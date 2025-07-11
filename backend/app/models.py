from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class RentalData(Base):
    __tablename__ = "rental_data"
    
    id = Column(Integer, primary_key=True, index=True, unique=True, autoincrement=True)
    jenis_mesin = Column(String, nullable=False)
    tid = Column(String, nullable=False)
    kc_supervisi = Column(String, nullable=False)
    lokasi = Column(String, nullable=False)
    vendor_cro = Column(String)
    harga_sewa_tahun = Column(String)
    total_harga_sewa_periode = Column(String)
    lama_sewa_tahun = Column(String)
    periode_awal = Column(String)
    periode_akhir = Column(String)
    nomor_polis_asuransi = Column(String)
    perjanjian_sewa_pks = Column(String)
    persetujuan_sewa_kode_remarks = Column(String)
    pic = Column(String)
    nomor_hp = Column(String)
    state = Column(String, default="safe")
    notification = Column(Boolean, default=False)
    
    file_polis_asuransi_url = Column(String)
    file_polis_asuransi_name = Column(String)
    file_polis_asuransi_uploaded_at = Column(String)

    file_pks_sewa_url = Column(String)
    file_pks_sewa_name = Column(String)
    file_pks_sewa_uploaded_at = Column(String)

    file_sewa_kode_url = Column(String)
    file_sewa_kode_name = Column(String)
    file_sewa_kode_uploaded_at = Column(String)