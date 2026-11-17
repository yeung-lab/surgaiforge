#!/usr/bin/env python3
"""
Convert raw model output files into normalized JSON for the SurgAI Forge web demo.

Source data: ../Example Model Outputs/
Output: ../SurgAI Forge Website Prototype/demo-data/

Run from the converters/ directory:
    python3 convert_all.py
"""

import csv
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "Example Model Outputs")
OUT = os.path.join(ROOT, "SurgAI Forge Website Prototype", "demo-data")

CASES = ["00304-33607", "00625-41653"]

STEP_LABELS = {
    "2ExposeGallbladder":                         "Expose Gallbladder",
    "3DissectingHepatocysticTriangle":            "Dissecting the Gallbladder / Hepatocystic Triangle",
    "4Ligation&Division":                         "Ligation & Division",
    "5GallbladderDissection":                     "Gallbladder Dissection",
    "6PackagingAndRemoval":                       "Packaging & Removal of Gallbladder",
}

STEP_IDS = {
    "2ExposeGallbladder":             2,
    "3DissectingHepatocysticTriangle":3,
    "4Ligation&Division":             4,
    "5GallbladderDissection":         5,
    "6PackagingAndRemoval":           6,
}

STEP_COLORS = {
    2: "#4A90D9",
    3: "#7B5EA7",
    4: "#D97B4A",
    5: "#4AA87B",
    6: "#D9C44A",
}

ERROR_LABELS = {
    "bleeding":       "Bleeding",
    "thermal_injury": "Thermal Injury",
    "spillage":       "Spillage",
}

MC2_DOMAINS = {
    "TH":    "Tissue Handling",
    "PS":    "Psychomotor Skills",
    "Prog":  "Progress",
    "DQ-S5": "Dissection Quality (Step 5)",
    "EQ-S3": "Exposure Quality (Step 3)",
    "EQ-S5": "Exposure Quality (Step 5)",
}

PGS_LABELS = {
    1: "Normal",
    2: "Minor Inflammation",
    3: "Moderate Inflammation",
    4: "Severe Inflammation",
    5: "Extreme / Necrotic",
}


def hms_to_s(hms: str) -> float:
    """Convert HH:MM:SS to seconds."""
    parts = hms.strip().split(":")
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])


def convert_steps(case: str) -> dict:
    path = os.path.join(SRC, "step", case, "pred_postprocessed.csv")
    segments = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            label_raw = row["label"].strip()
            start_s = hms_to_s(row["start_time"])
            end_s = hms_to_s(row["end_time"])
            step_id = STEP_IDS.get(label_raw, 0)
            segments.append({
                "start": start_s,
                "end": end_s,
                "stepId": step_id,
                "label": STEP_LABELS.get(label_raw, label_raw),
                "color": STEP_COLORS.get(step_id, "#A0A7B6"),
            })
    return {"segments": segments}


def convert_errors(case: str) -> dict:
    path = os.path.join(SRC, "error", f"{case}.csv")
    events = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            label_raw = row["label"].strip()
            events.append({
                "start": hms_to_s(row["start_time"]),
                "end": hms_to_s(row["end_time"]),
                "label": ERROR_LABELS.get(label_raw, label_raw),
                "labelRaw": label_raw,
                "score": float(row["score"]),
            })
    events.sort(key=lambda e: e["start"])
    return {"events": events}


def convert_pgs(case: str) -> dict:
    path = os.path.join(SRC, "pgs", f"{case}.csv")
    with open(path) as f:
        reader = csv.DictReader(f)
        row = next(reader)
    grade = int(float(row["consensus_score"]))
    return {
        "consensusGrade": grade,
        "label": PGS_LABELS.get(grade, f"Grade {grade}"),
        "avgScore": float(row["avg_score"]),
        "numFrames": int(row["num_selected_frames"]),
        "probabilities": {
            "1": float(row["grade_1_prob"]),
            "2": float(row["grade_2_prob"]),
            "3": float(row["grade_3_prob"]),
            "4": float(row["grade_4_prob"]),
            "5": float(row["grade_5_prob"]),
        },
    }


def convert_cvs(case: str) -> dict:
    path = os.path.join(SRC, "cvs", f"{case}_cvs-criteria_timestamps.json")
    with open(path) as f:
        raw = json.load(f)
    tr = raw["cvs_time_range"]
    criteria_map = {
        "c1_cystic_duct_artery_isolation":    ("c1", "Isolation of cystic duct & artery"),
        "c2_hepatocystic_triangle_clearance": ("c2", "Clearance of hepatocystic triangle"),
        "c3_cystic_plate_exposure":           ("c3", "Exposure of cystic plate"),
    }
    criteria = []
    for key, (cid, clabel) in criteria_map.items():
        c = raw["criteria"][key]
        segs = [{"start": s["start_seconds"], "end": s["end_seconds"]} for s in c.get("segments", [])]
        criteria.append({
            "id": cid,
            "label": clabel,
            "achieved": c["achieved"],
            "segments": segs,
        })
    return {
        "start": tr["start_seconds"],
        "end": tr["end_seconds"],
        "startLabel": tr["start"],
        "endLabel": tr["end"],
        "criteria": criteria,
    }


def convert_mc2(case: str) -> dict:
    domains = []
    for code, label in MC2_DOMAINS.items():
        path = os.path.join(SRC, "mc2", case, code, f"infer-{case}_vlo.csv")
        with open(path) as f:
            reader = csv.DictReader(f)
            row = next(reader)
        domains.append({
            "code": code,
            "label": label,
            "score": float(row["pta_entire_case"]),
        })
    return {"domains": domains}


def convert_tools(case: str) -> dict:
    """Downsample tool tracking to every 10th frame for web use."""
    metrics_path = os.path.join(SRC, "tool_tracking", case, "metrics.json")
    vlo_path = os.path.join(SRC, "tool_tracking", case, "video_level_outputs.csv")

    with open(metrics_path) as f:
        raw = json.load(f)

    # Video-level summary
    vlo_rows = []
    with open(vlo_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            vlo_rows.append({
                "avgVelocity": float(row["Avg velocity"]),
                "avgAcceleration": float(row["Avg acceleration"]),
                "distFromCenter": float(row["Dist from center"]),
            })

    # Extract frame-level data (skip non-integer keys), sample every 10 frames
    frames = {}
    for k, v in raw.items():
        if not k.isdigit():
            continue
        frame_num = int(k)
        if frame_num % 10 != 0:
            continue
        entry = {}
        for tool_id, tool_data in v.items():
            centroid = tool_data.get("centroid", [[None, None]])
            if centroid and centroid[0][0] is not None:
                entry[tool_id] = {
                    "x": centroid[0][0],
                    "y": centroid[0][1],
                }
        if entry:
            frames[str(frame_num)] = entry

    int_keys = sorted(int(k) for k in raw.keys() if k.isdigit())
    first_frame = int_keys[0] if int_keys else 0
    last_frame = int_keys[-1] if int_keys else 0

    return {
        "fps": 10,
        "sourceWidth": 854,
        "sourceHeight": 480,
        "firstFrame": first_frame,
        "lastFrame": last_frame,
        "sampleEvery": 10,
        "videoLevelMetrics": [
            {"toolId": "1", **vlo_rows[0]} if len(vlo_rows) > 0 else {},
            {"toolId": "2", **vlo_rows[1]} if len(vlo_rows) > 1 else {},
        ],
        "frames": frames,
    }


def build_manifest() -> dict:
    return {
        "cases": [
            {
                "id": "00304-33607",
                "label": "Case A",
                "procedure": "Laparoscopic cholecystectomy",
                "video": "../Example Model Outputs/00304-33607.mp4",
                "durationSeconds": 4892.3,
                "outputs": {
                    "steps":           "demo-data/00304-33607-steps.json",
                    "errors":          "demo-data/00304-33607-errors.json",
                    "tools":           "demo-data/00304-33607-tools.json",
                    "pgs":             "demo-data/00304-33607-pgs.json",
                    "cvs":             "demo-data/00304-33607-cvs.json",
                    "mc2":             "demo-data/00304-33607-mc2.json",
                },
            },
            {
                "id": "00625-41653",
                "label": "Case B",
                "procedure": "Laparoscopic cholecystectomy",
                "video": "../Example Model Outputs/00625-41653.mp4",
                "durationSeconds": 4315.2,
                "outputs": {
                    "steps":           "demo-data/00625-41653-steps.json",
                    "errors":          "demo-data/00625-41653-errors.json",
                    "tools":           "demo-data/00625-41653-tools.json",
                    "pgs":             "demo-data/00625-41653-pgs.json",
                    "cvs":             "demo-data/00625-41653-cvs.json",
                    "mc2":             "demo-data/00625-41653-mc2.json",
                },
            },
        ]
    }


def write_json(path: str, data: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    size_kb = os.path.getsize(path) / 1024
    print(f"  wrote {os.path.relpath(path, ROOT)} ({size_kb:.1f} KB)")


def main():
    print("Converting model outputs to normalized JSON...\n")
    for case in CASES:
        print(f"--- {case} ---")
        write_json(os.path.join(OUT, f"{case}-steps.json"),  convert_steps(case))
        write_json(os.path.join(OUT, f"{case}-errors.json"), convert_errors(case))
        write_json(os.path.join(OUT, f"{case}-pgs.json"),    convert_pgs(case))
        write_json(os.path.join(OUT, f"{case}-cvs.json"),    convert_cvs(case))
        write_json(os.path.join(OUT, f"{case}-mc2.json"),    convert_mc2(case))
        print(f"  converting tool tracking (may take a moment)...")
        write_json(os.path.join(OUT, f"{case}-tools.json"),  convert_tools(case))
        print()
    write_json(os.path.join(OUT, "manifest.json"), build_manifest())
    print("\nDone. All files written to:")
    print(f"  {OUT}")


if __name__ == "__main__":
    main()
