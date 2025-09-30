import pandas as pd
import re
from io import BytesIO
from datetime import datetime, timedelta

# Mapping Indonesian month names to English
INDO_MONTHS = {
    'Januari': 'January', 'Februari': 'February', 'Maret': 'March',
    'April': 'April', 'Mei': 'May', 'Juni': 'June',
    'Juli': 'July', 'Agustus': 'August', 'September': 'September',
    'Oktober': 'October', 'November': 'November', 'Desember': 'December'
}

# Excel serial number base date (Excel uses 1899-12-30 for Windows)
EXCEL_BASE_DATE = datetime(1899, 12, 30)

def excel_serial_to_date(value):
    """Convert Excel serial number to datetime string (YYYY-MM)."""
    try:
        serial = int(float(value))
        dt = EXCEL_BASE_DATE + timedelta(days=serial)
        return dt.strftime("%Y-%m")
    except Exception:
        return value  # keep original if not convertible

def parse_indonesian_month_year(date_val):
    """Parse Indonesian month-year strings, Excel serials, or datetime objects."""
    # Handle numbers (Excel serials)
    if isinstance(date_val, (int, float)):
        return excel_serial_to_date(date_val)

    # Handle datetime objects directly
    if isinstance(date_val, datetime):
        return date_val.strftime("%Y-%m")

    # Handle strings
    if isinstance(date_val, str):
        # Try Excel serial stored as string
        if date_val.isdigit():
            return excel_serial_to_date(date_val)

        # Replace Indonesian months with English
        for indo, eng in INDO_MONTHS.items():
            date_val = date_val.replace(indo, eng)

        date_val = date_val.strip()

        # Try "DD Month YYYY"
        try:
            dt = datetime.strptime(date_val, "%d %B %Y")
            return dt.strftime("%Y-%m")
        except ValueError:
            pass

        # Try "Month YYYY"
        try:
            dt = datetime.strptime("1 " + date_val, "%d %B %Y")
            return dt.strftime("%Y-%m")
        except ValueError:
            return date_val  # fallback: keep as-is

    return date_val

def clean_currency(value):
    if isinstance(value, str):
        v = value.strip()
        if not re.search(r'\d', v):
            return value
        v = v.replace("Rp", "").replace(".", "").replace(",", "").replace("-", "").replace(" ", "")
        try:
            return float(v)
        except ValueError:
            return value
    elif pd.isna(value):
        return None
    return value

def parse_excel(contents: bytes):
    df = pd.read_excel(BytesIO(contents), header=0, dtype=str)

    df.columns = [
        "jenis_mesin", "tid", "kc_supervisi", "lokasi",
        "vendor_cro", 
        "harga_sewa_tahun", "total_harga_sewa_periode", "lama_sewa_tahun",
        "periode_awal", "periode_akhir", "nomor_polis_asuransi",
        "perjanjian_sewa_pks", "persetujuan_sewa_kode_remarks",
        "pic", "nomor_hp"
    ]

    # Fix merged cells
    df.ffill(inplace=True)

    # Clean specific numeric fields
    df["harga_sewa_tahun"] = df["harga_sewa_tahun"].apply(clean_currency)
    df["total_harga_sewa_periode"] = df["total_harga_sewa_periode"].apply(clean_currency)

    # Parse periods (string dates + excel serials)
    df["periode_awal"] = df["periode_awal"].apply(parse_indonesian_month_year)
    df["periode_akhir"] = df["periode_akhir"].apply(parse_indonesian_month_year)

    # Required fields
    required_fields = ["jenis_mesin", "tid", "kc_supervisi", "lokasi"]
    df.dropna(subset=required_fields, inplace=True)

    # Clean missing values
    df.replace({"nan": None, "NaN": None}, inplace=True)
    df["nomor_hp"] = df["nomor_hp"].fillna("")

    return df