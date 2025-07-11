"use client"

import type React from "react"
import { useState } from "react"
import type { RentalData } from "../services/api"
import { X } from "lucide-react"

interface AddRowModalProps {
  onClose: () => void
  onSubmit: (data: Partial<RentalData>) => void
}

export const AddRowModal: React.FC<AddRowModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<RentalData>>({
    jenis_mesin: "",
    tid: "",
    kc_supervisi: "",
    lokasi: "",
    vendor_cro: "",
    harga_sewa_tahun: "",
    total_harga_sewa_periode: "",
    lama_sewa_tahun: "",
    periode_awal: "",
    periode_akhir: "",
    nomor_polis_asuransi: "",
    perjanjian_sewa_pks: "",
    persetujuan_sewa_kode_remarks: "",
    pic: "",
    nomor_hp: "",
    state: "safe",
    notification: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Clean up the data before sending - convert empty strings to null for optional fields
    const cleanedData: Partial<RentalData> = {
      jenis_mesin: formData.jenis_mesin || "",
      tid: formData.tid || "",
      kc_supervisi: formData.kc_supervisi || "",
      lokasi: formData.lokasi || "",
      vendor_cro: formData.vendor_cro || null,
      harga_sewa_tahun: formData.harga_sewa_tahun || null, // Keep as string
      total_harga_sewa_periode: formData.total_harga_sewa_periode || null, // Keep as string
      lama_sewa_tahun: formData.lama_sewa_tahun || null,
      periode_awal: formData.periode_awal || null,
      periode_akhir: formData.periode_akhir || null,
      nomor_polis_asuransi: formData.nomor_polis_asuransi || null,
      perjanjian_sewa_pks: formData.perjanjian_sewa_pks || null,
      persetujuan_sewa_kode_remarks: formData.persetujuan_sewa_kode_remarks || null,
      pic: formData.pic || null,
      nomor_hp: formData.nomor_hp || null,
      state: "safe",
      notification: false,
      // File fields - set to null
      file_polis_asuransi_url: null,
      file_polis_asuransi_name: null,
      file_polis_asuransi_uploaded_at: null,
      file_pks_sewa_url: null,
      file_pks_sewa_name: null,
      file_pks_sewa_uploaded_at: null,
      file_sewa_kode_url: null,
      file_sewa_kode_name: null,
      file_sewa_kode_uploaded_at: null,
    }

    onSubmit(cleanedData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="text-xl font-bold">Add New Rental Row</h2>
          <button onClick={onClose} className="modal-close">
            <X style={{ height: "1.25rem", width: "1.25rem" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Jenis Mesin *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.jenis_mesin || ""}
                onChange={(e) => handleChange("jenis_mesin", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">TID *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.tid || ""}
                onChange={(e) => handleChange("tid", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">KC Supervisi *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.kc_supervisi || ""}
                onChange={(e) => handleChange("kc_supervisi", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lokasi *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.lokasi || ""}
                onChange={(e) => handleChange("lokasi", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vendor CRO</label>
              <input
                type="text"
                className="input"
                value={formData.vendor_cro || ""}
                onChange={(e) => handleChange("vendor_cro", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harga Sewa/Tahun</label>
              <input
                type="number"
                className="input"
                value={formData.harga_sewa_tahun || ""}
                onChange={(e) => handleChange("harga_sewa_tahun", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Harga Sewa Periode</label>
              <input
                type="number"
                className="input"
                value={formData.total_harga_sewa_periode || ""}
                onChange={(e) => handleChange("total_harga_sewa_periode", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lama Sewa (Tahun)</label>
              <input
                type="text"
                className="input"
                value={formData.lama_sewa_tahun || ""}
                onChange={(e) => handleChange("lama_sewa_tahun", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Periode Awal (YYYY-MM)</label>
              <input
                type="text"
                className="input"
                placeholder="2024-01"
                value={formData.periode_awal || ""}
                onChange={(e) => handleChange("periode_awal", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Periode Akhir (YYYY-MM)</label>
              <input
                type="text"
                className="input"
                placeholder="2025-12"
                value={formData.periode_akhir || ""}
                onChange={(e) => handleChange("periode_akhir", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nomor Polis Asuransi</label>
              <input
                type="text"
                className="input"
                value={formData.nomor_polis_asuransi || ""}
                onChange={(e) => handleChange("nomor_polis_asuransi", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Perjanjian Sewa PKS</label>
              <input
                type="text"
                className="input"
                value={formData.perjanjian_sewa_pks || ""}
                onChange={(e) => handleChange("perjanjian_sewa_pks", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Persetujuan Sewa Kode Remarks</label>
              <input
                type="text"
                className="input"
                value={formData.persetujuan_sewa_kode_remarks || ""}
                onChange={(e) => handleChange("persetujuan_sewa_kode_remarks", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIC</label>
              <input
                type="text"
                className="input"
                value={formData.pic || ""}
                onChange={(e) => handleChange("pic", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nomor HP</label>
              <input
                type="text"
                className="input"
                value={formData.nomor_hp || ""}
                onChange={(e) => handleChange("nomor_hp", e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Row
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}