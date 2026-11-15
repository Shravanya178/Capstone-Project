# DICOM Structured Report (SR) Parser Documentation

## 1. Scope & Standards
The CDSS DICOM SR Parser (`src/dicom_sr/`) implements deterministic recursive decoding of DICOM Part 16 structured reports, specifically:
- SOP Class UID: `1.2.840.10008.5.1.4.1.1.88.33` (Comprehensive SR Storage).
- Modality: `SR`.
- Templates: TID 4200 (Breast Imaging Report) and TID 1400 (Linear Measurement).

## 2. Architecture & Traversal

1. **Header Validation**:
   - Asserts Modality == `SR`.
   - Validates SOP Class UID against authorized Comprehensive SR specifications.
   - Extracts Patient ID, Study Description, and SOP Instance UID.

2. **Recursive Tree Walker**:
   - Recursively traverses `ContentSequence` (`(0040,A730)`).
   - Node Types handled:
     - `CONTAINER`: Continuity of content (`SEPARATE`, `CONTINUOUS`).
     - `CODE`: Coded terminology (`ConceptCodeSequence`: `CodeValue`, `CodingSchemeDesignator`, `CodeMeaning`).
     - `NUM`: Quantitative measurements (`MeasuredValueSequence`: `NumericValue`, `MeasurementUnitsCodeSequence`).
     - `TEXT`: Narrative notes (`TextValue`).
     - `DATE` / `TIME` / `DATETIME`: Temporal observation metadata.

3. **Concept Mapping**:
   - Maps DCM and SNOMED-CT concept codes to canonical clinical observation concepts (`birads_category`, `tumor_largest_diameter_mm`, `lesion_margin`, `breast_density`).

4. **Output Contract**:
   - Emits standardized observation objects conforming to `schemas/clinical_observation.schema.json`.

