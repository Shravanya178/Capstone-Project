# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Ingestion modules for clinical datasets:
- TCIA Breast Diagnosis clinical summary
- I-SPY-1 trial clinical and outcome data
- BreastPathQ residual cancer burden dataset
- TCGA-BRCA narrative pathology reports
"""

from .tcia_breast_diagnosis_loader import TCIABreastDiagnosisLoader
from .ispy1_loader import ISPY1Loader
from .breastpathq_loader import BreastPathQLoader
from .tcga_brca_loader import TCGABRCALoader

__all__ = [
    "TCIABreastDiagnosisLoader",
    "ISPY1Loader",
    "BreastPathQLoader",
    "TCGABRCALoader",
]

