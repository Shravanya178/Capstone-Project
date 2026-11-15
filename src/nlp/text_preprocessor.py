"""
Clinical Text Preprocessor with Domain Sentence Segmentation and Negation/Uncertainty Detection.
"""

from typing import List, Dict, Any, Tuple
import re


class ClinicalTextPreprocessor:
    """Preprocessor for clinical pathology narratives and imaging impressions."""

    # Medical abbreviations that should NOT trigger a sentence split
    ABBREVIATIONS = {
        "dr", "approx", "ca", "cm", "mm", "no", "vs", "eg", "ie", "fig",
        "pt", "tab", "dx", "hx", "bx", "ihc", "fish", "ish", "sn", "ln",
    }

    # Negation cue phrases
    NEGATION_CUES = [
        r"\bno\s+evidence\s+of\b",
        r"\bnegative\s+for\b",
        r"\bfree\s+of\b",
        r"\bwithout\s+evidence\s+of\b",
        r"\bwithout\b",
        r"\babsent\b",
        r"\bdenies\b",
        r"\bno\b",
        r"\bnot\b",
        r"\bruled\s+out\b",
    ]

    # Uncertainty / hedging cue phrases
    UNCERTAINTY_CUES = [
        r"\bequivocal\b",
        r"\bsuspicious\s+for\b",
        r"\bborderline\b",
        r"\bcannot\s+(?:rule\s+out|be\s+excluded)\b",
        r"\bpossible\b",
        r"\bindeterminate\b",
        r"\buncertain\b",
        r"\bquestionable\b",
    ]

    @classmethod
    def clean_text(cls, text: str) -> str:
        """Normalizes unicode whitespace and removes control artifacts while preserving clinical tokens."""
        if not text:
            return ""
        # Replace non-breaking spaces and tabs
        cleaned = re.sub(r"[\r\t\f\v]", " ", text)
        cleaned = re.sub(r" +", " ", cleaned)
        return cleaned.strip()

    @classmethod
    def split_sentences(cls, text: str) -> List[Dict[str, Any]]:
        """
        Splits narrative into clinical sentences without breaking on abbreviations or decimal points.
        Returns a list of sentence dictionaries with character offsets.
        """
        cleaned = cls.clean_text(text)
        if not cleaned:
            return []

        # Temporarily mask known medical abbreviations followed by period
        abbrev_pattern = r"\b(" + "|".join(re.escape(a) for a in cls.ABBREVIATIONS) + r")\."
        masked_text = re.sub(abbrev_pattern, r"\1<DOT>", cleaned, flags=re.IGNORECASE)

        # Regex for sentence boundaries on masked text
        raw_splits = re.split(r"(?<=[.!?])\s+(?=[A-Z])", masked_text)
        
        sentences: List[Dict[str, Any]] = []
        current_offset = 0

        for s in raw_splits:
            # Restore abbreviation periods
            s_restored = s.replace("<DOT>", ".").strip()
            if not s_restored:
                continue

            # Find actual start position in cleaned text
            start_idx = cleaned.find(s_restored, current_offset)
            if start_idx == -1:
                start_idx = current_offset
            end_idx = start_idx + len(s_restored)
            current_offset = end_idx

            sentences.append({
                "sentence_index": len(sentences),
                "text": s_restored,
                "start_char": start_idx,
                "end_char": end_idx,
            })

        return sentences

    @classmethod
    def analyze_context(cls, sentence: str, target_phrase: str) -> Dict[str, Any]:
        """
        Evaluates whether a target entity in a sentence is negated or hedged/uncertain.
        Respects termination boundary words ('but', 'however', 'although').
        """
        sent_lower = sentence.lower()
        target_lower = target_phrase.lower()

        target_pos = sent_lower.find(target_lower)
        if target_pos == -1:
            return {"is_negated": False, "is_uncertain": False, "context_scope": sentence}

        # Analyze prefix window up to 100 characters before target
        window_start = max(0, target_pos - 100)
        prefix = sent_lower[window_start:target_pos]

        # Check for boundary conjunctions that cancel prior negation
        boundary_match = re.search(r"\b(but|however|although|whereas|nevertheless)\b", prefix)
        if boundary_match:
            prefix = prefix[boundary_match.end():]

        # Evaluate negation
        is_negated = False
        neg_cue_found = None
        for cue in cls.NEGATION_CUES:
            m = re.search(cue, prefix)
            if m:
                is_negated = True
                neg_cue_found = m.group(0)
                break

        # Evaluate uncertainty
        is_uncertain = False
        unc_cue_found = None
        for cue in cls.UNCERTAINTY_CUES:
            m = re.search(cue, prefix) or re.search(cue, sent_lower)
            if m:
                is_uncertain = True
                unc_cue_found = m.group(0)
                break

        return {
            "is_negated": is_negated,
            "negation_cue": neg_cue_found,
            "is_uncertain": is_uncertain,
            "uncertainty_cue": unc_cue_found,
            "context_scope": sentence,
        }
