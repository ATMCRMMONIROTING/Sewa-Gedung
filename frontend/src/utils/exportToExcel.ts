import * as XLSX from "xlsx"
import type { RentalData } from "../services/api"

export const exportToExcel = (data: RentalData[], filename: string) => {
  // Prepare data for Excel export
  const excelData = data.map((row) => ({
    ID: row.id || "",
    "Jenis Mesin": row.jenis_mesin || "",
    TID: row.tid || "",
    "KC Supervisi": row.kc_supervisi || "",
    Lokasi: row.lokasi || "",
    "Vendor CRO": row.vendor_cro || "",
    "Harga Sewa/Tahun": row.harga_sewa_tahun || "",
    "Total Harga Sewa Periode": row.total_harga_sewa_periode || "",
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
    { wch: 5 }, // ID
    { wch: 15 }, // Jenis Mesin
    { wch: 10 }, // TID
    { wch: 15 }, // KC Supervisi
    { wch: 20 }, // Lokasi
    { wch: 15 }, // Vendor CRO
    { wch: 18 }, // Harga Sewa/Tahun
    { wch: 20 }, // Total Harga Sewa Periode
    { wch: 15 }, // Lama Sewa
    { wch: 12 }, // Periode Awal
    { wch: 12 }, // Periode Akhir
    { wch: 20 }, // Nomor Polis Asuransi
    { wch: 20 }, // Perjanjian Sewa PKS
    { wch: 25 }, // Persetujuan Sewa Kode Remarks
    { wch: 15 }, // PIC
    { wch: 15 }, // Nomor HP
    { wch: 10 }, // State
    { wch: 12 }, // Notification
    { wch: 20 }, // File Polis Asuransi
    { wch: 20 }, // File PKS Sewa
    { wch: 20 }, // File Sewa Kode
  ]
  worksheet["!cols"] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rental Data")

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}