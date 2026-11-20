# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
HER2 Receptor Clinical Interpretation per ASCO/CAP 2018 Focused Update.

Enforces strict reflex testing criteria for IHC 2+ equivocal cases and preserves
independent IHC and ISH/FISH observation streams.
"""

from typing import Dict, Any, Optional
from src.preprocessing.value_normalizer import ValueNormalizer


class HER2Interpreter:
    """Interprets HER2 IHC and ISH/FISH testing streams."""

    @classmethod
    def interpret(
        cls,
        raw_ihc: Any,
        raw_fish: Optional[Any] = None,
        fish_ratio: Optional[float] = None,
        copy_number: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Determines definitive HER2 status conforming strictly to ASCO/CAP 2018 rules.
        """
        norm = ValueNormalizer.normalize_her2(raw_ihc, fish_val=raw_fish)
        ihc_score = norm.get("ihc_score")
        fish_status = norm.get("fish_status")

        # Refine FISH from numeric ratio/copy number if available
        if fish_ratio is not None:
            if fish_ratio >= 2.0:
                fish_status = "positive"
            elif fish_ratio < 2.0 and (copy_number is None or copy_number < 4.0):
                fish_status = "negative"
            else:
                fish_status = "equivocal"

        definitive_status = "unknown"
        requires_reflex_testing = False
        review_prompt = None

        if ihc_score == "3+":
            definitive_status = "positive"
            comment = "HER2 positive by IHC 3+ (circumferential intense membrane staining in > 10% of cells)."
        elif ihc_score in {"0", "1+"}:
            if fish_status == "positive":
                definitive_status = "positive"
                comment = "HER2 positive by confirmatory ISH/FISH despite IHC 0/1+ (discordant, FISH governs)."
            else:
                definitive_status = "negative"
                comment = f"HER2 negative by IHC {ihc_score}."
        elif ihc_score == "2+":
            requires_reflex_testing = True
            if fish_status == "positive":
                definitive_status = "positive"
                comment = "HER2 positive: IHC 2+ equivocal resolved as amplified by confirmatory ISH/FISH."
            elif fish_status == "negative":
                definitive_status = "negative"
                comment = "HER2 negative: IHC 2+ equivocal resolved as non-amplified by confirmatory ISH/FISH."
            elif fish_status == "equivocal":
                definitive_status = "equivocal"
                comment = "HER2 equivocal: IHC 2+ with equivocal ISH/FISH. Requires alternative chromosome 17 probe or review."
                review_prompt = "Reflex testing with alternate chromosome 17 probe or second pathologist review required."
            else:
                definitive_status = "equivocal"
                comment = "HER2 equivocal: IHC 2+ documented without confirmatory ISH/FISH."
                review_prompt = "Mandatory reflex in situ hybridization (ISH/FISH) testing required before anti-HER2 therapy decision."
        elif fish_status == "positive":
            definitive_status = "positive"
            comment = "HER2 positive documented by ISH/FISH."
        elif fish_status == "negative":
            definitive_status = "negative"
            comment = "HER2 negative documented by ISH/FISH."
        else:
            definitive_status = norm.get("her2_status", "not_reported")
            comment = "HER2 status not reported or unassessed."

        return {
            "her2_definitive_status": definitive_status,
            "ihc_score": ihc_score,
            "fish_status": fish_status,
            "fish_ratio": fish_ratio,
            "copy_number": copy_number,
            "requires_reflex_testing": requires_reflex_testing,
            "review_prompt": review_prompt,
            "clinical_comment": comment,
            "status": "documented" if definitive_status in {"positive", "negative"} else (
                "equivocal" if definitive_status == "equivocal" else "not_reported"
            ),
        }

