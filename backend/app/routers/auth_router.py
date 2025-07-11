from typing import Union, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, File, Form
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import timedelta, datetime
from .. import models, schemas, auth
from ..dependencies import get_db
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/register", response_model=dict)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.post("/login", response_model=dict)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Fixed: Changed from "/auth/data" to "/data" and added proper response model
@router.get("/data", response_model=List[schemas.RentalDataResponse])
def get_all_data(db: Session = Depends(get_db)):
    data = db.query(models.RentalData).all()
    now = datetime.now()
    three_months = timedelta(days=90)

    for entry in data:
        try:
            periode_akhir_str = entry.periode_akhir
            if periode_akhir_str:
                periode_akhir_date = datetime.strptime(periode_akhir_str + "-01", "%Y-%m-%d")
                if periode_akhir_date - now <= three_months:
                    if entry.state != "warning":
                        entry.state = "warning"
                        entry.notification = True
                else:
                    if entry.state != "safe":
                        entry.state = "safe"
                        entry.notification = False
            else:
                entry.state = "safe"
                entry.notification = False
        except Exception as e:
            entry.state = "safe"
            entry.notification = False

    db.commit()
    return data

@router.post("/add-row", response_model=dict)
def add_rental_row(data: schemas.RentalDataCreate, db: Session = Depends(get_db)):
    required_fields = [data.jenis_mesin, data.tid, data.kc_supervisi, data.lokasi]
    if any(f is None or f == "" for f in required_fields):
        raise HTTPException(status_code=400, detail="jenis_mesin, tid, kc_supervisi, and lokasi are required")

    existing = db.query(models.RentalData).filter(
        and_(models.RentalData.tid == data.tid, models.RentalData.lokasi == data.lokasi)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Data already exists")

    new_row = models.RentalData(**data.dict())
    db.add(new_row)
    db.commit()
    return {"message": "New row added"}

@router.patch("/edit-cell", response_model=dict)
def edit_cell(
    tid: str,
    lokasi: str,
    field: str,
    value: Union[str, float, bool],
    db: Session = Depends(get_db)
):
    data = db.query(models.RentalData).filter(
        and_(models.RentalData.tid == tid, models.RentalData.lokasi == lokasi)
    ).first()
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")

    if not hasattr(data, field):
        raise HTTPException(status_code=400, detail="Invalid field name")

    setattr(data, field, value)
    db.commit()
    return {"message": f"{field} updated successfully"}

@router.post("/upload-pdf", response_model=dict)
def upload_pdf(
    tid: str,
    lokasi: str,
    file_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    record = db.query(models.RentalData).filter(
        and_(models.RentalData.tid == tid, models.RentalData.lokasi == lokasi)
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    file_path = f"files/{tid}_{lokasi}_{file_type}_{file.filename}"
    
    # Ensure the files directory exists
    os.makedirs("files", exist_ok=True)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    if file_type == "polis_asuransi":
        record.file_polis_asuransi_url = file_path
        record.file_polis_asuransi_name = file.filename
        record.file_polis_asuransi_uploaded_at = timestamp

    elif file_type == "pks_sewa":
        record.file_pks_sewa_url = file_path
        record.file_pks_sewa_name = file.filename
        record.file_pks_sewa_uploaded_at = timestamp

    elif file_type == "sewa_kode":
        record.file_sewa_kode_url = file_path
        record.file_sewa_kode_name = file.filename
        record.file_sewa_kode_uploaded_at = timestamp

    else:
        raise HTTPException(status_code=400, detail="Invalid file type")

    db.commit()
    return {"message": f"PDF uploaded and linked to {file_type} successfully"}

@router.delete("/delete-row", response_model=dict)
def delete_row(tid: str, lokasi: str, db: Session = Depends(get_db)):
    data = db.query(models.RentalData).filter(
        and_(models.RentalData.tid == tid, models.RentalData.lokasi == lokasi)
    ).first()

    if not data:
        raise HTTPException(status_code=404, detail="Data not found")

    # Delete associated files if they exist
    file_fields = [
        data.file_polis_asuransi_url,
        data.file_pks_sewa_url,
        data.file_sewa_kode_url
    ]
    for file_path in file_fields:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

    db.delete(data)
    db.commit()

    return {"message": f"Data with TID '{tid}' and lokasi '{lokasi}' deleted successfully"}

@router.post("/batch-delete", response_model=dict)
def batch_delete(ids: List[int], db: Session = Depends(get_db)):
    deleted_count = 0

    for data_id in ids:
        data = db.query(models.RentalData).filter(models.RentalData.id == data_id).first()
        if data:
            # Delete associated files if they exist
            file_fields = [
                data.file_polis_asuransi_url,
                data.file_pks_sewa_url,
                data.file_sewa_kode_url
            ]
            for file_path in file_fields:
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)

            db.delete(data)
            deleted_count += 1

    db.commit()

    return {"message": f"{deleted_count} record(s) deleted successfully"}