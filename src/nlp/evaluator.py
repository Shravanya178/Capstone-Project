"""
Clinical NLP Evaluation Harness.

Computes Precision, Recall, F1-score, and Confusion Matrices across clinical entity
classes (ER, PR, HER2, Grade, Histology, Size, Lymph Nodes) comparing rule-based
and contextual NLP models against gold-standard annotations.
"""

from typing import List, Dict, Any, Tuple
from collections import defaultdict


class NLPEvaluationHarness:
    """Evaluation framework for clinical information extraction."""

    @staticmethod
    def evaluate_predictions(
        ground_truth: List[Dict[str, Any]],
        predictions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluates predictions against gold-standard samples.
        Ground truth and predictions are lists of observation dicts with
        'provenance.source_record_id', 'concept', and 'normalized_value'.
        """
        gt_map: Dict[Tuple[str, str], Any] = {}
        for item in ground_truth:
            key = (item["provenance"]["source_record_id"], item["concept"])
            gt_map[key] = str(item.get("normalized_value")).strip().lower()

        pred_map: Dict[Tuple[str, str], Any] = {}
        for item in predictions:
            key = (item["provenance"]["source_record_id"], item["concept"])
            pred_map[key] = str(item.get("normalized_value")).strip().lower()

        concepts = sorted(list(set([k[1] for k in gt_map.keys()] + [k[1] for k in pred_map.keys()])))

        results_by_concept: Dict[str, Dict[str, Any]] = {}
        overall_tp = 0
        overall_fp = 0
        overall_fn = 0

        for c in concepts:
            c_gt_keys = [k for k in gt_map.keys() if k[1] == c]
            c_pred_keys = [k for k in pred_map.keys() if k[1] == c]

            tp = 0
            fp = 0
            fn = 0

            for k in c_gt_keys:
                if k in pred_map:
                    if pred_map[k] == gt_map[k]:
                        tp += 1
                    else:
                        fp += 1
                        fn += 1
                else:
                    fn += 1

            for k in c_pred_keys:
                if k not in gt_map:
                    fp += 1

            prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

            results_by_concept[c] = {
                "true_positives": tp,
                "false_positives": fp,
                "false_negatives": fn,
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
            }

            overall_tp += tp
            overall_fp += fp
            overall_fn += fn

        overall_prec = overall_tp / (overall_tp + overall_fp) if (overall_tp + overall_fp) > 0 else 0.0
        overall_rec = overall_tp / (overall_tp + overall_fn) if (overall_tp + overall_fn) > 0 else 0.0
        overall_f1 = (2 * overall_prec * overall_rec) / (overall_prec + overall_rec) if (overall_prec + overall_rec) > 0 else 0.0

        return {
            "overall": {
                "total_ground_truth": len(gt_map),
                "total_predictions": len(pred_map),
                "precision": round(overall_prec, 4),
                "recall": round(overall_rec, 4),
                "f1_score": round(overall_f1, 4),
            },
            "by_concept": results_by_concept,
        }
