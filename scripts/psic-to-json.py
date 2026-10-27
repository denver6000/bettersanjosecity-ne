"""
Convert PSA's PSIC detailed-structure workbook into src/data/psic.json.

    pip install openpyxl
    python scripts/psic-to-json.py sources/PSIC_Revision_5_Detailed_Structure_30July2026.xlsx

Run it again whenever PSA releases a corrected workbook, then rebuild. Only
the output is committed; the workbook stays in sources/, which git ignores.
Get it from PSA (psa.gov.ph, PSIC) or from a maintainer.
"""

import json
import re
import sys
from pathlib import Path

import openpyxl

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "psic.json"
# Code length per column: Section, Division, Group, Class, Sub-Class.
WIDTHS = [1, 2, 3, 4, 5]


def clean_code(value, width):
    if value is None:
        return None
    # Excel stores some codes as numbers, which drops leading zeros (01111 -> 1111).
    text = str(int(value)) if not isinstance(value, str) else value.strip()
    if not text:
        return None
    return text if width == 1 else text.zfill(width)


def clean_title(value):
    # Drop replacement characters and non-breaking spaces left in some titles.
    return re.sub(r"[%c%c\s]+" % (0xFFFD, 0xA0), " ", str(value or "")).strip()


def main(path):
    sheet = openpyxl.load_workbook(path, read_only=True)["Detailed Structure"]
    sections, divisions, groups, classes, sub_classes = {}, {}, {}, {}, []
    section = cls_parent = None
    mismatched = []

    for i, row in enumerate(sheet.iter_rows(values_only=True)):
        if i == 0:
            continue
        codes = [clean_code(row[j], WIDTHS[j]) for j in range(5)]
        title = clean_title(row[5])
        if not title:
            continue
        sec, div, grp, cls, sub = codes
        if sec:
            section = sec
            sections[sec] = title
        if div:
            divisions[div] = [title, section]
        if grp:
            groups[grp] = title
        if cls:
            cls_parent = cls
            classes[cls] = title
        if sub:
            # Keep the code as printed, but file it under the class it is printed
            # beneath: the workbook has a few sub-classes whose code does not start
            # with their class's code (52331 under 5231, for example).
            if not sub.startswith(cls_parent):
                mismatched.append(f"{sub} under {cls_parent}")
            sub_classes.append([sub, title, cls_parent])

    data = {
        "edition": "PSIC Revision 5",
        "released": "30 July 2026",
        "file": Path(path).name,
        "sections": sections,
        "divisions": divisions,
        "groups": groups,
        "classes": classes,
        "subClasses": sub_classes,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    if mismatched:
        print("Kept as printed, filed under the class above them:", ", ".join(mismatched))
    print(
        f"{OUT.name}: {len(sections)} sections, {len(divisions)} divisions, {len(groups)} groups, "
        f"{len(classes)} classes, {len(sub_classes)} sub-classes"
    )


if __name__ == "__main__":
    main(sys.argv[1])
