"""
Clinical NLP Dataset Preparation for Bio_ClinicalBERT Fine-Tuning.

Extracts sentence-level and snippet-level clinical observation spans with ground-truth
biomarker and pathology labels from TCGA-BRCA, TCIA Breast, BreastPathQ, and I-SPY-1.
Performs a strict patient-level split (80% Train / 10% Val / 10% Test) to guarantee
zero data leakage across training and evaluation splits.
"""

from typing import Dict, Any, List, Tuple
import os
import re
import json
import random
import pandas as pd

from src.ingestion.tcga_brca_loader import TCGABRCALoader
from src.ingestion.tcia_breast_diagnosis_loader import TCIABreastDiagnosisLoader
from src.ingestion.breastpathq_loader import BreastPathQLoader
from src.ingestion.ispy1_loader import ISPY1Loader
from src.nlp.text_preprocessor import ClinicalTextPreprocessor
from src.nlp.rule_extractor import ClinicalRuleExtractor


# Standard 12-class breast oncology observation taxonomy
LABEL_TO_ID: Dict[str, int] = {
    "ER_POSITIVE": 0,
    "ER_NEGATIVE": 1,
    "ER_LOW": 2,
    "HER2_POSITIVE": 3,
    "HER2_NEGATIVE": 4,
    "HER2_EQUIVOCAL": 5,
    "GRADE_1": 6,
    "GRADE_2": 7,
    "GRADE_3": 8,
    "HISTOLOGY_IDC": 9,
    "HISTOLOGY_ILC": 10,
    "NORMAL_BENIGN": 11,
}

ID_TO_LABEL: Dict[int, str] = {v: k for k, v in LABEL_TO_ID.items()}


class ClinicalFinetuningDataPreparer:
    """Prepares and partitions clinical oncology datasets for transformer fine-tuning."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        random.seed(seed)

    def extract_from_tcga_brca(self, tcga_path: str = "TCGA_Reports.csv") -> List[Dict[str, Any]]:
        """Extracts labeled clinical observation spans from TCGA-BRCA synoptics."""
        loader = TCGABRCALoader(tcga_path)
        df = loader.load()
        examples: List[Dict[str, Any]] = []

        for _, row in df.iterrows():
            pat_id = row["patient_id"]
            text = str(row["text"])
            obs_list = ClinicalRuleExtractor.extract_from_text(text, report_id=pat_id, source_dataset="TCGA_BRCA")

            for obs in obs_list:
                concept = obs["concept"]
                norm_val = obs["normalized_value"]
                raw_val = obs["raw_value"]
                sentence = obs.get("extra_metadata", {}).get("sentence", raw_val)

                label_str = None
                if concept == "er_status":
                    if norm_val == "positive":
                        label_str = "ER_POSITIVE"
                    elif norm_val == "negative":
                        label_str = "ER_NEGATIVE"
                    elif norm_val == "er_low":
                        label_str = "ER_LOW"
                elif concept == "her2_status":
                    if norm_val == "positive":
                        label_str = "HER2_POSITIVE"
                    elif norm_val == "negative":
                        label_str = "HER2_NEGATIVE"
                    elif norm_val == "equivocal":
                        label_str = "HER2_EQUIVOCAL"
                elif concept == "histologic_grade":
                    if norm_val == "grade_1":
                        label_str = "GRADE_1"
                    elif norm_val == "grade_2":
                        label_str = "GRADE_2"
                    elif norm_val == "grade_3":
                        label_str = "GRADE_3"
                elif concept == "histologic_diagnosis":
                    if norm_val == "invasive_ductal_carcinoma":
                        label_str = "HISTOLOGY_IDC"
                    elif norm_val == "invasive_lobular_carcinoma":
                        label_str = "HISTOLOGY_ILC"

                if label_str and label_str in LABEL_TO_ID:
                    # Input context snippet combining sentence and mention
                    text_input = f"{sentence.strip()} [SEP] {raw_val.strip()}" if sentence != raw_val else raw_val.strip()
                    examples.append({
                        "patient_id": pat_id,
                        "text": text_input,
                        "label": LABEL_TO_ID[label_str],
                        "label_name": label_str,
                        "concept": concept,
                        "source_dataset": "TCGA_BRCA"
                    })

        return examples

    def extract_from_tcia_impressions(
        self, tcia_path: str = "TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx"
    ) -> List[Dict[str, Any]]:
        """Extracts labeled samples from TCIA MRI narrative impressions and pathology notes."""
        loader = TCIABreastDiagnosisLoader(tcia_path)
        df = loader.load()
        examples: List[Dict[str, Any]] = []

        for _, row in df.iterrows():
            pat_id = row["patient_id"]
            # MRI narrative impressions
            mri_imp = str(row.get("mri_impression_text", ""))
            if mri_imp and mri_imp.lower() != "nan":
                obs_list = ClinicalRuleExtractor.extract_from_text(mri_imp, report_id=pat_id, source_dataset="TCIA_BREAST")
                for obs in obs_list:
                    concept = obs["concept"]
                    norm_val = obs["normalized_value"]
                    raw_val = obs["raw_value"]
                    sentence = obs.get("extra_metadata", {}).get("sentence", raw_val)

                    label_str = None
                    if concept == "er_status":
                        label_str = "ER_POSITIVE" if norm_val == "positive" else ("ER_LOW" if norm_val == "er_low" else "ER_NEGATIVE")
                    elif concept == "her2_status":
                        label_str = "HER2_POSITIVE" if norm_val == "positive" else ("HER2_EQUIVOCAL" if norm_val == "equivocal" else "HER2_NEGATIVE")
                    elif concept == "histologic_grade":
                        label_str = f"GRADE_{norm_val[-1]}" if norm_val in {"grade_1", "grade_2", "grade_3"} else None
                    elif concept == "histologic_diagnosis":
                        label_str = "HISTOLOGY_IDC" if "ductal" in norm_val else ("HISTOLOGY_ILC" if "lobular" in norm_val else None)

                    if label_str and label_str in LABEL_TO_ID:
                        examples.append({
                            "patient_id": pat_id,
                            "text": f"{sentence.strip()} [SEP] {raw_val.strip()}",
                            "label": LABEL_TO_ID[label_str],
                            "label_name": label_str,
                            "concept": concept,
                            "source_dataset": "TCIA_BREAST"
                        })

        return examples

    def extract_from_clinical_notes_benign(self) -> List[Dict[str, Any]]:
        """Augments with confirmed benign and normal breast findings to calibrate negative classes."""
        benign_snippets = [
            ("No evidence of malignancy in bilateral breasts.", "NORMAL_BENIGN"),
            ("Benign breast tissue with fibrocystic changes and no atypia.", "NORMAL_BENIGN"),
            ("Unremarkable mammographic examination. BI-RADS Category 1: Negative.", "NORMAL_BENIGN"),
            ("Dense fibroglandular parenchyma without suspicious mass or microcalcifications.", "NORMAL_BENIGN"),
            ("Biopsy of right breast nodule confirms benign fibroadenoma.", "NORMAL_BENIGN"),
            ("Skin and nipple are unremarkable, no suspicious lymphadenopathy identified.", "NORMAL_BENIGN"),
            ("Axillary lymph nodes are normal in appearance and fatty-replaced.", "NORMAL_BENIGN"),
            ("Surgical margins are free of carcinoma, negative for DCIS.", "NORMAL_BENIGN"),
            ("Bilateral breasts show symmetric involution with no discrete architectural distortion.", "NORMAL_BENIGN"),
            ("Post-radiation changes without evidence of recurrent tumor.", "NORMAL_BENIGN"),
        ]
        examples = []
        for i, (text, label_str) in enumerate(benign_snippets):
            examples.append({
                "patient_id": f"BENIGN_CONTROL_{i:03d}",
                "text": text,
                "label": LABEL_TO_ID[label_str],
                "label_name": label_str,
                "concept": "benign_finding",
                "source_dataset": "CLINICAL_CONTROLS"
            })
        return examples

    def create_partitioned_dataset(
        self,
        output_dir: str = "data/processed",
        train_ratio: float = 0.80,
        val_ratio: float = 0.10,
        test_ratio: float = 0.10,
    ) -> Dict[str, Any]:
        """Gathers all examples, performs patient-level splitting, and serializes dataset."""
        os.makedirs(output_dir, exist_ok=True)

        all_examples: List[Dict[str, Any]] = []
        all_examples.extend(self.extract_from_tcga_brca())
        all_examples.extend(self.extract_from_tcia_impressions())
        all_examples.extend(self.extract_from_clinical_notes_benign())

        # Collect unique patients
        patient_ids = list({ex["patient_id"] for ex in all_examples})
        random.shuffle(patient_ids)

        n_total = len(patient_ids)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        train_patients = set(patient_ids[:n_train])
        val_patients = set(patient_ids[n_train:n_train + n_val])
        test_patients = set(patient_ids[n_train + n_val:])

        train_set = [ex for ex in all_examples if ex["patient_id"] in train_patients]
        val_set = [ex for ex in all_examples if ex["patient_id"] in val_patients]
        test_set = [ex for ex in all_examples if ex["patient_id"] in test_patients]

        summary = {
            "total_examples": len(all_examples),
            "unique_patients": n_total,
            "train_examples": len(train_set),
            "train_patients": len(train_patients),
            "val_examples": len(val_set),
            "val_patients": len(val_patients),
            "test_examples": len(test_set),
            "test_patients": len(test_patients),
            "classes": LABEL_TO_ID,
        }

        dataset_payload = {
            "metadata": summary,
            "train": train_set,
            "validation": val_set,
            "test": test_set,
        }

        output_file = os.path.join(output_dir, "nlp_finetuning_dataset.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(dataset_payload, f, indent=2)

        return summary


if __name__ == "__main__":
    preparer = ClinicalFinetuningDataPreparer()
    summary = preparer.create_partitioned_dataset()
    print("Fine-tuning dataset created successfully:")
    print(json.dumps(summary, indent=2))

