from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..dependencies import get_db, get_current_user
from .. import models
from ..excel_parser import parse_excel 
import pandas as pd

router = APIRouter()

@router.post("/upload/create")
def upload_and_create(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    contents = file.file.read()
    df = parse_excel(contents)

    df = df.where(pd.notnull(df), None)

    created_count = 0
    for _, row in df.iterrows():
        tid_value = row["tid"]
        lokasi_value = row["lokasi"]
        if db.query(models.RentalData).filter(
            and_(models.RentalData.tid == tid_value, models.RentalData.lokasi == lokasi_value)
        ).first():
            continue
        new_data = models.RentalData(**row.to_dict())
        db.add(new_data)
        db.flush()  # Avoids huge INSERT
        created_count += 1

    db.commit()
    return {"message": f"Created {created_count} new rental records."}


@router.post("/upload/update")
def upload_and_update(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    contents = file.file.read()
    df = parse_excel(contents)

    # Ensure consistent types
    df["tid"] = df["tid"].astype(str).str.strip()
    df["lokasi"] = df["lokasi"].astype(str).str.strip()
    df = df.where(pd.notnull(df), None)

    updated_count = 0
    updated_details = []

    for _, row in df.iterrows():
        tid_value = row["tid"]
        lokasi_value = row["lokasi"]

        db_obj = db.query(models.RentalData).filter(
            and_(models.RentalData.tid == tid_value, models.RentalData.lokasi == lokasi_value)
        ).first()

        if db_obj:
            for col, val in row.items():
                db_val = getattr(db_obj, col)
                if db_val != val:
                    setattr(db_obj, col, val)

    db.commit()
    return {
        "message": "Updated existing rental records.",
    }