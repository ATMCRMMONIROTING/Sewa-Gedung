import * as XLSX from "xlsx"
import type { RentalData } from "../services/api"

export const exportToExcel = (data: RentalData[], filename: string) => {
  // Format number to Rupiah
  const formatRupiah = (value: number | string | null | undefined) => {
    const num = typeof value === "number" ? value : parseFloat(value || "0")
    return isNaN(num) ? "" : `Rp. ${num.toLocaleString("id-ID")}`
  }

  // Prepare data for Excel export
  const excelData = data.map((row) => ({
    ID: row.id || "",
    "Jenis Mesin": row.jenis_mesin || "",
    TID: row.tid || "",
    "KC Supervisi": row.kc_supervisi || "",
    Lokasi: row.lokasi || "",
    "Vendor CRO": row.vendor_cro || "",
    "Harga Sewa/Tahun": formatRupiah(row.harga_sewa_tahun),
    "Total Harga Sewa Periode": formatRupiah(row.total_harga_sewa_periode),
    "Lama Sewa (Tahun)": row.lama_sewa_tahun || "",
    "Periode Awal": row.periode_awal || "",
    "Periode Akhir": row.periode_akhir || "",
    "Nomor Polis Asuransi": row.nomor_polis_asuransi || "",
    "Perjanjian Sewa PKS": row.perjanjian_sewa_pks || "",
    "Persetujuan Sewa Kode Remarks": row.persetujuan_sewa_kode_remarks || "",
    PIC: row.pic || "",
    "Nomor HP": row.nomor_hp || "",
    State: row.state || "",
    Notification: row.notification ? "Yes" : "No",
    "File Polis Asuransi": row.file_polis_asuransi_name || "",
    "File PKS Sewa": row.file_pks_sewa_name || "",
    "File Sewa Kode": row.file_sewa_kode_name || "",
  }))

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const columnWidths = [
    { wch: 5 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
    { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 20 },
    { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
    { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
    { wch: 20 }
  ]
  worksheet["!cols"] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rental Data")

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
