import pandas as pd
import re
from io import BytesIO
from datetime import datetime

# Mapping Indonesian month names to English
INDO_MONTHS = {
    'Januari': 'January', 'Februari': 'February', 'Maret': 'March',
    'April': 'April', 'Mei': 'May', 'Juni': 'June',
    'Juli': 'July', 'Agustus': 'August', 'September': 'September',
    'Oktober': 'October', 'November': 'November', 'Desember': 'December'
}

def parse_indonesian_month_year(date_str):
    if isinstance(date_str, str):
        for indo, eng in INDO_MONTHS.items():
            date_str = date_str.replace(indo, eng)

        date_str = date_str.strip()

        try:
            dt = datetime.strptime(date_str, "%d %B %Y")
            return dt.strftime("%Y-%m")
        except ValueError:
            pass

        try:
            dt = datetime.strptime("1 " + date_str, "%d %B %Y")
            return dt.strftime("%Y-%m")
        except ValueError:
            return None

    elif isinstance(date_str, datetime):
        return date_str.strftime("%Y-%m")

    return None

def clean_currency(value):
    if isinstance(value, str):
        value = value.strip()
        if not re.search(r'\d', value):
            return value
        value = value.replace("Rp", "").replace(".", "").replace(" ", "").replace("-","")
        value = value.replace(",", ".")

        try:
            return float(value)
        except ValueError:
            return None
    elif pd.isna(value):
        return None
    return float(value)

def parse_excel(contents: bytes):
    # Skip the header and title rows, read raw data (skip 5 rows based on your example)
    df = pd.read_excel(BytesIO(contents), skiprows=5, header=None)

    # Define column names to match your DB and Excel layout
    df.columns = [
        "no", "jenis_mesin", "tid", "kc_supervisi", "lokasi",
        "vendor_cro", 
        "harga_sewa_tahun", "total_harga_sewa_periode", "lama_sewa_tahun",
        "periode_awal", "periode_akhir", "nomor_polis_asuransi",
        "perjanjian_sewa_pks", "persetujuan_sewa_kode_remarks",
        "pic", "nomor_hp"
    ]

    # Drop 'no' column since it's just a row number
    df.drop(columns=["no"], inplace=True)

    # Clean and convert necessary fields
    df["tid"] = df["tid"].astype(str)
    df["harga_sewa_tahun"] = df["harga_sewa_tahun"].apply(clean_currency)
    df["total_harga_sewa_periode"] = df["total_harga_sewa_periode"].apply(clean_currency)
    df["periode_awal"] = df["periode_awal"].apply(parse_indonesian_month_year)
    df["periode_akhir"] = df["periode_akhir"].apply(parse_indonesian_month_year)

    return df