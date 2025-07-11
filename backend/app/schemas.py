from pydantic import BaseModel
from typing import Optional, Union
from datetime import date

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class RentalDataBase(BaseModel):
    jenis_mesin: str
    tid: str
    kc_supervisi: str
    lokasi: str
    vendor_cro: Optional[str]
    harga_sewa_tahun: Optional[Union[float, str]]
    total_harga_sewa_periode: Optional[Union[float, str]]
    lama_sewa_tahun: Optional[str]
    periode_awal: Optional[str]
    periode_akhir: Optional[str]
    nomor_polis_asuransi: Optional[str]
    perjanjian_sewa_pks: Optional[str]
    persetujuan_sewa_kode_remarks: Optional[str]
    pic: Optional[str]
    nomor_hp: Optional[str]
    state: Optional[str]
    notification: Optional[bool]
    
    file_polis_asuransi_url: Optional[str]
    file_polis_asuransi_name: Optional[str]
    file_polis_asuransi_uploaded_at: Optional[str]

    file_pks_sewa_url: Optional[str]
    file_pks_sewa_name: Optional[str]
    file_pks_sewa_uploaded_at: Optional[str]

    file_sewa_kode_url: Optional[str]
    file_sewa_kode_name: Optional[str]
    file_sewa_kode_uploaded_at: Optional[str]
    
    class Config:
        orm_mode = True

class RentalDataCreate(RentalDataBase):
    pass

class RentalDataUpdate(RentalDataBase):
    pass

class RentalDataResponse(RentalDataBase):
    id: int 
    
    class Config:
        orm_mode = True