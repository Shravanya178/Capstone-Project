# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Patient Organ Function & Baseline Risk Assessment Module.

Parses structured clinical observations to evaluate cardiac, renal, hepatic,
hematologic, and reproductive risk status prior to systemic therapy consideration.
"""

from typing import Dict, Any, List, Optional


class PatientRiskAssessor:
    """Evaluates organ function adequacy and baseline physiological risk."""

    @classmethod
    def assess_all_organs(cls, patient_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Assesses organ function categories from documented observations."""
        observations = patient_profile.get("observations", [])
        demographics = patient_profile.get("demographics", {})

        obs_by_concept: Dict[str, List[Dict[str, Any]]] = {}
        for o in observations:
            c = o.get("concept")
            if c:
                obs_by_concept.setdefault(c, []).append(o)

        cardiac = cls._assess_cardiac(obs_by_concept)
        renal = cls._assess_renal(obs_by_concept)
        hepatic = cls._assess_hepatic(obs_by_concept)
        hematologic = cls._assess_hematologic(obs_by_concept)
        reproductive = cls._assess_reproductive(demographics, obs_by_concept)

        return {
            "cardiac": cardiac,
            "renal": renal,
            "hepatic": hepatic,
            "hematologic": hematologic,
            "reproductive": reproductive,
        }

    @classmethod
    def _assess_cardiac(cls, obs_map: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        lvef_obs = obs_map.get("lvef_percent") or obs_map.get("cardiac_ejection_fraction")
        if lvef_obs:
            raw_val = lvef_obs[0].get("normalized_value")
            try:
                lvef = float(raw_val)
                if lvef < 50.0:
                    return {
                        "status": "abnormal",
                        "lvef_percent": lvef,
                        "risk_level": "critical" if lvef < 40.0 else "high",
                        "notes": f"Left Ventricular Ejection Fraction is {lvef}% (< 50% threshold). High risk of cardiomyopathy with anti-HER2 or anthracycline agents."
                    }
                else:
                    return {
                        "status": "normal",
                        "lvef_percent": lvef,
                        "risk_level": "low",
                        "notes": f"LVEF is documented at {lvef}% (>= 50% threshold; adequate baseline cardiac function)."
                    }
            except (ValueError, TypeError):
                pass

        # Check for documented heart failure or cardiac history
        hf_obs = obs_map.get("heart_failure") or obs_map.get("cardiac_history")
        if hf_obs:
            val = str(hf_obs[0].get("normalized_value")).lower()
            if val in {"positive", "present", "documented", "congestive_heart_failure"}:
                return {
                    "status": "abnormal",
                    "lvef_percent": None,
                    "risk_level": "high",
                    "notes": "Documented history of congestive heart failure or cardiomyopathy."
                }

        return {
            "status": "not_reported",
            "lvef_percent": None,
            "risk_level": "unknown",
            "notes": "Baseline echocardiogram / LVEF measurement not recorded in available dataset records."
        }

    @classmethod
    def _assess_renal(cls, obs_map: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        crcl_obs = obs_map.get("creatinine_clearance_ml_min") or obs_map.get("egfr")
        if crcl_obs:
            try:
                val = float(crcl_obs[0].get("normalized_value"))
                if val < 30.0:
                    risk = "critical"
                    status = "abnormal"
                    notes = f"Severe renal impairment (eGFR/CrCl = {val} mL/min). Cisplatin contraindicated; Carboplatin requires renal dose reduction."
                elif val < 50.0:
                    risk = "high"
                    status = "abnormal"
                    notes = f"Moderate renal impairment (eGFR/CrCl = {val} mL/min). Cisplatin caution/contraindication."
                else:
                    risk = "low"
                    status = "normal"
                    notes = f"eGFR/CrCl is {val} mL/min (>= 50 mL/min; adequate baseline renal clearance)."
                return {"status": status, "egfr_or_crcl": val, "risk_level": risk, "notes": notes}
            except (ValueError, TypeError):
                pass

        return {
            "status": "not_reported",
            "egfr_or_crcl": None,
            "risk_level": "unknown",
            "notes": "Serum creatinine / estimated GFR not recorded in available dataset records."
        }

    @classmethod
    def _assess_hepatic(cls, obs_map: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        bili_obs = obs_map.get("total_bilirubin") or obs_map.get("hepatic_impairment")
        if bili_obs:
            val_str = str(bili_obs[0].get("normalized_value"))
            if "severe" in val_str.lower() or "abnormal" in val_str.lower():
                return {
                    "status": "abnormal",
                    "bilirubin_ast_alt": val_str,
                    "risk_level": "high",
                    "notes": f"Documented hepatic dysfunction: {val_str}. Requires taxane/anthracycline dose adjustments."
                }
            return {
                "status": "documented",
                "bilirubin_ast_alt": val_str,
                "risk_level": "low",
                "notes": f"Hepatic markers documented: {val_str}."
            }

        return {
            "status": "not_reported",
            "bilirubin_ast_alt": None,
            "risk_level": "unknown",
            "notes": "Hepatic enzyme panel (total bilirubin, AST, ALT) not recorded in available dataset records."
        }

    @classmethod
    def _assess_hematologic(cls, obs_map: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        anc_obs = obs_map.get("absolute_neutrophil_count")
        plt_obs = obs_map.get("platelets")

        anc_val = None
        plt_val = None
        if anc_obs:
            try:
                anc_val = float(anc_obs[0].get("normalized_value"))
            except (ValueError, TypeError):
                pass
        if plt_obs:
            try:
                plt_val = float(plt_obs[0].get("normalized_value"))
            except (ValueError, TypeError):
                pass

        if anc_val is not None:
            if anc_val < 1000:
                risk = "critical"
                status = "abnormal"
                notes = f"Severe neutropenia (ANC = {anc_val}/uL < 1,000/uL). Hold cytotoxic chemotherapy."
            elif anc_val < 1500:
                risk = "high"
                status = "abnormal"
                notes = f"Moderate neutropenia (ANC = {anc_val}/uL < 1,500/uL). Hold taxane chemotherapy."
            else:
                risk = "low"
                status = "normal"
                notes = f"ANC is {anc_val}/uL (>= 1,500/uL; adequate baseline neutrophil count)."
            return {"status": status, "anc": anc_val, "platelets": plt_val, "risk_level": risk, "notes": notes}

        return {
            "status": "not_reported",
            "anc": None,
            "platelets": None,
            "risk_level": "unknown",
            "notes": "Complete blood count (ANC, Platelets) not recorded in available dataset records."
        }

    @classmethod
    def _assess_reproductive(
        cls, demographics: Dict[str, Any], obs_map: Dict[str, List[Dict[str, Any]]]
    ) -> Dict[str, Any]:
        meno = demographics.get("menopausal_status", "not_reported")
        preg_obs = obs_map.get("pregnancy_status")

        preg_status = "not_reported"
        if preg_obs:
            p_val = str(preg_obs[0].get("normalized_value")).lower()
            preg_status = "positive" if "pos" in p_val or "pregnant" in p_val else (
                "negative" if "neg" in p_val else "unknown"
            )
        elif meno == "postmenopausal":
            preg_status = "not_applicable"

        if preg_status == "positive":
            notes = "CONFIRMED PREGNANCY. Cytotoxic chemotherapy, anti-HER2 agents, and endocrine therapy contraindicated or require high-risk maternal-fetal oncology protocol."
        elif meno == "premenopausal":
            notes = "Premenopausal patient. Ensure pregnancy test before systemic therapy; aromatase inhibitors require concurrent ovarian function suppression."
        elif meno == "postmenopausal":
            notes = "Postmenopausal patient. Candidate for aromatase inhibitor therapy; pregnancy not applicable."
        else:
            notes = f"Menopausal status: {meno}. Pregnancy status: {preg_status}."

        return {
            "status": "documented" if meno != "not_reported" or preg_status != "not_reported" else "not_reported",
            "menopausal_status": meno,
            "pregnancy_status": preg_status,
            "notes": notes,
        }

