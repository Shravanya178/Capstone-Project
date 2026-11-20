# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Supervised Fine-Tuning Pipeline for Bio_ClinicalBERT on Breast Oncology Data.

Trains Emily Alsentzer's Bio_ClinicalBERT on multi-class clinical observation classification
(ER, HER2, Nottingham Grade, Histology, Benign Controls) across TCGA-BRCA and TCIA cohorts.
Caches HuggingFace artifacts in D:\hf_cache and saves fine-tuned weights to models_cache/bio_clinicalbert_brca.
"""

import os
import sys
import json
import time
from typing import Dict, Any, List
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup,
)
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

from src.nlp.prepare_finetuning_data import LABEL_TO_ID, ID_TO_LABEL

# Enforce cache routing to D: drive
HF_CACHE_DIR = r"D:\hf_cache"
os.environ["HF_HOME"] = HF_CACHE_DIR
os.environ["TRANSFORMERS_CACHE"] = HF_CACHE_DIR

DEFAULT_DATASET_PATH = os.path.join("data", "processed", "nlp_finetuning_dataset.json")
DEFAULT_OUTPUT_DIR = os.path.join("models_cache", "bio_clinicalbert_brca")
BASE_MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"


class ClinicalTextDataset(Dataset):
    """PyTorch Dataset wrapper for clinical tokenized observation snippets."""

    def __init__(self, examples: List[Dict[str, Any]], tokenizer, max_length: int = 64):
        self.examples = examples
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.examples)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        item = self.examples[idx]
        text = str(item["text"])
        label = int(item["label"])

        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt",
        )

        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(label, dtype=torch.long),
        }


def resolve_base_model() -> tuple:
    """Finds cached snapshot path on D: drive to enable instantaneous offline loading."""
    snapshots_dir = r"D:\hf_cache\hub\models--emilyalsentzer--Bio_ClinicalBERT\snapshots"
    if os.path.isdir(snapshots_dir):
        for snap in os.listdir(snapshots_dir):
            full_path = os.path.join(snapshots_dir, snap)
            if os.path.isfile(os.path.join(full_path, "pytorch_model.bin")):
                return full_path, True
    return BASE_MODEL_NAME, False


def train_bio_clinicalbert(
    dataset_path: str = DEFAULT_DATASET_PATH,
    output_dir: str = DEFAULT_OUTPUT_DIR,
    epochs: int = 3,
    batch_size: int = 16,
    learning_rate: float = 3e-5,
    max_length: int = 64,
    device_name: str = "cpu",
) -> Dict[str, Any]:
    """Fine-tunes Bio_ClinicalBERT and evaluates on the held-out test cohort."""
    model_source, local_only = resolve_base_model()

    print("=" * 70)
    print("BIO_CLINICALBERT SUPERVISED FINE-TUNING PIPELINE")
    print("=" * 70)
    print(f"Base Model:       {model_source} (local={local_only})")
    print(f"Dataset Path:     {dataset_path}")
    print(f"Checkpoint Dest:  {output_dir}")
    print(f"HF Cache Root:    {HF_CACHE_DIR}")
    print(f"Device:           {device_name.upper()}")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}. Run prepare_finetuning_data.py first.")

    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    train_data = data["train"]
    val_data = data["validation"]
    test_data = data["test"]

    print(f"\nCohort Splits: Train={len(train_data)}, Val={len(val_data)}, Test={len(test_data)}")

    # Initialize Tokenizer and Model
    tokenizer = AutoTokenizer.from_pretrained(model_source, local_files_only=local_only)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_source,
        num_labels=len(LABEL_TO_ID),
        id2label=ID_TO_LABEL,
        label2id=LABEL_TO_ID,
        local_files_only=local_only,
    )

    # Transfer Learning Optimization: Freeze lower transformer layers (0..8)
    # Train top layers (9..11) and classification head for optimal CPU efficiency
    print("Freezing lower layers (embeddings + layers 0..8); fine-tuning top 3 layers + classifier...")
    for param in model.bert.embeddings.parameters():
        param.requires_grad = False
    for i in range(9):
        for param in model.bert.encoder.layer[i].parameters():
            param.requires_grad = False

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Trainable Parameters: {trainable_params:,} / {total_params:,} ({100 * trainable_params / total_params:.1f}%)")

    device = torch.device(device_name)
    model.to(device)

    train_dataset = ClinicalTextDataset(train_data, tokenizer, max_length=max_length)
    val_dataset = ClinicalTextDataset(val_data, tokenizer, max_length=max_length)
    test_dataset = ClinicalTextDataset(test_data, tokenizer, max_length=max_length)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    optimizer = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad],
        lr=learning_rate,
        weight_decay=0.01,
    )
    total_steps = len(train_loader) * epochs
    warmup_steps = int(total_steps * 0.1)
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps
    )

    history: List[Dict[str, Any]] = []
    best_val_f1 = 0.0

    print("\nStarting Training Loop...")
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        total_train_loss = 0.0

        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            loss.backward()

            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()

            total_train_loss += loss.item()

        avg_train_loss = total_train_loss / len(train_loader)

        # Validation Phase
        model.eval()
        total_val_loss = 0.0
        val_preds: List[int] = []
        val_labels: List[int] = []

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["labels"].to(device)

                outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
                total_val_loss += outputs.loss.item()

                logits = outputs.logits
                preds = torch.argmax(logits, dim=-1).cpu().tolist()
                val_preds.extend(preds)
                val_labels.extend(labels.cpu().tolist())

        avg_val_loss = total_val_loss / len(val_loader)
        val_acc = accuracy_score(val_labels, val_preds)
        _, _, val_macro_f1, _ = precision_recall_fscore_support(
            val_labels, val_preds, average="macro", zero_division=0
        )

        epoch_stats = {
            "epoch": epoch,
            "train_loss": round(avg_train_loss, 4),
            "val_loss": round(avg_val_loss, 4),
            "val_accuracy": round(float(val_acc), 4),
            "val_macro_f1": round(float(val_macro_f1), 4),
        }
        history.append(epoch_stats)
        print(f"Epoch {epoch}/{epochs} | Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f} | Val Acc: {val_acc:.4f} | Val Macro F1: {val_macro_f1:.4f}")

        # Save best checkpoint
        if val_macro_f1 > best_val_f1 or epoch == epochs:
            best_val_f1 = val_macro_f1
            os.makedirs(output_dir, exist_ok=True)
            model.save_pretrained(output_dir)
            tokenizer.save_pretrained(output_dir)

    train_duration = round(time.time() - start_time, 2)
    print(f"\nTraining Complete in {train_duration}s. Best Validation Macro F1: {best_val_f1:.4f}")

    # Final Test Set Evaluation
    print("\nEvaluating on Held-Out Test Cohort (Strict Patient-Separated)...")
    model.eval()
    test_preds: List[int] = []
    test_labels: List[int] = []

    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            preds = torch.argmax(outputs.logits, dim=-1).cpu().tolist()
            test_preds.extend(preds)
            test_labels.extend(batch["labels"].cpu().tolist())

    test_acc = accuracy_score(test_labels, test_preds)
    test_prec_w, test_rec_w, test_f1_w, _ = precision_recall_fscore_support(
        test_labels, test_preds, average="weighted", zero_division=0
    )
    test_prec_m, test_rec_m, test_f1_m, _ = precision_recall_fscore_support(
        test_labels, test_preds, average="macro", zero_division=0
    )

    clf_report = classification_report(
        test_labels,
        test_preds,
        target_names=[ID_TO_LABEL[i] for i in sorted(set(test_labels) | set(test_preds))],
        output_dict=True,
        zero_division=0,
    )

    test_metrics = {
        "accuracy": round(float(test_acc), 4),
        "weighted_precision": round(float(test_prec_w), 4),
        "weighted_recall": round(float(test_rec_w), 4),
        "weighted_f1": round(float(test_f1_w), 4),
        "macro_precision": round(float(test_prec_m), 4),
        "macro_recall": round(float(test_rec_m), 4),
        "macro_f1": round(float(test_f1_m), 4),
        "training_duration_sec": train_duration,
        "history": history,
        "classification_report": clf_report,
    }

    metrics_file = os.path.join(output_dir, "training_and_evaluation_metrics.json")
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(test_metrics, f, indent=2)

    print("\n" + "=" * 70)
    print("FINAL TEST COHORT BENCHMARK RESULTS")
    print("=" * 70)
    print(f"Accuracy:           {test_acc:.4f}")
    print(f"Weighted Macro F1:  {test_f1_w:.4f}")
    print(f"Macro Average F1:   {test_f1_m:.4f}")
    print(f"Saved Checkpoints:  {output_dir}")
    print(f"Saved Metrics:      {metrics_file}")

    return test_metrics


if __name__ == "__main__":
    train_bio_clinicalbert()
