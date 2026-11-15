"""
Observation Provenance and Lineage Tracker.

Attaches traceable source metadata (dataset, file, record, field, extraction method, confidence)
to every canonical clinical observation.
"""

from typing import Dict, Any, Optional


class ProvenanceTracker:
    """Creates and validates standardized provenance envelopes."""

    @staticmethod
    def create_envelope(
        source_dataset: str,
        source_file: str,
        source_record_id: str,
        source_field_path: Optional[str] = None,
        extraction_method: str = "structured_parser",
        confidence: Optional[float] = 1.0,
    ) -> Dict[str, Any]:
        """Builds standardized provenance and extraction dictionary blocks."""
        return {
            "provenance": {
                "source_dataset": source_dataset,
                "source_file": source_file,
                "source_record_id": str(source_record_id),
                "source_field_path": source_field_path,
            },
            "extraction": {
                "method": extraction_method,
                "confidence": confidence,
            },
        }

