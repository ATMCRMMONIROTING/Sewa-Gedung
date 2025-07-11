from sqlalchemy.orm import Session
from . import models, schemas

def get_all_rental_data(db: Session):
    return db.query(models.RentalData).all()

def get_by_tid(db: Session, tid: str):
    return db.query(models.RentalData).filter(models.RentalData.tid == tid).first()

def create_or_update_rental(db: Session, data: schemas.RentalDataCreate):
    db_data = get_by_tid(db, data.tid)
    if db_data:
        for key, value in data.dict().items():
            setattr(db_data, key, value)
    else:
        db_data = models.RentalData(**data.dict())
        db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data