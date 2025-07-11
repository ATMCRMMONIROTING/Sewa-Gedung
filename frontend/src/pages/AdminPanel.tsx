"use client"

import type React from "react"

import { useState } from "react"
import { rentalAPI } from "../services/api"
import { Header } from "../components/Header"
import toast from "react-hot-toast"
import { Upload, FileSpreadsheet, Database, RefreshCw } from "lucide-react"

const AdminPanel = () => {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile)
      } else {
        toast.error("Mohon pilih file excel (.xlsx or .xls)")
      }
    }
  }

  const handleUploadAndCreate = async () => {
    if (!file) {
      toast.error("Mohon pilih file")
      return
    }

    setIsUploading(true)
    try {
      const response = await rentalAPI.uploadAndCreate(file)
      toast.success(response.data.message)
      setFile(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Upload gagal")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadAndUpdate = async () => {
    if (!file) {
      toast.error("Mohon pilih file")
      return
    }

    setIsUploading(true)
    try {
      const response = await rentalAPI.uploadAndUpdate(file)
      toast.success(response.data.message)
      setFile(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Upload gagal")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main style={{ maxWidth: "56rem", margin: "0 auto" }} className="py-6 px-4">
        <div className="px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel Admin</h1>
            <p className="text-gray-600 mt-2">Upload file Excel untuk membuat atau mengupdate data sewa</p>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="space-y-6">
                {/* File Upload Section */}
                <div>
                  <label className="form-label mb-2">Pilih file Excel </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="file-upload-area">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileSpreadsheet
                          style={{ width: "2rem", height: "2rem", marginBottom: "1rem", color: "#6b7280" }}
                        />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-medium">Click untuk upload</span> atau tempelkan file disini
                        </p>
                        <p className="text-xs text-gray-500">hanya untuk file Excel (.xlsx, .xls)</p>
                      </div>
                      <input
                        type="file"
                        className="file-upload-input"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {file && (
                    <div className="file-selected">
                      <p className="text-sm text-blue-700">Dipilih: {file.name}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="alert alert-green">
                    <div className="flex items-center mb-2">
                      <Database
                        style={{ height: "1.25rem", width: "1.25rem", color: "#16a34a", marginRight: "0.5rem" }}
                      />
                      <h3 className="font-medium text-green-800">Membuat data baru</h3>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      Upload file Excel untuk membuat data baru. Data dengan TID dan lokasi yang sama akan dilewati.
                    </p>
                    <button
                      onClick={handleUploadAndCreate}
                      disabled={!file || isUploading}
                      className="btn btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      {isUploading ? (
                        <RefreshCw style={{ height: "1rem", width: "1rem" }} className="spinner" />
                      ) : (
                        <Upload style={{ height: "1rem", width: "1rem" }} />
                      )}
                      <span>{isUploading ? "Mengupload Data..." : "Upload & Buat"}</span>
                    </button>
                  </div>

                  <div className="alert alert-blue">
                    <div className="flex items-center mb-2">
                      <RefreshCw
                        style={{ height: "1.25rem", width: "1.25rem", color: "#2563eb", marginRight: "0.5rem" }}
                      />
                      <h3 className="font-medium text-blue-800">Update Data yang ada</h3>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">
                      Upload dile Excel untuk mengupdate data berdasarkan TID dan lokasi.
                    </p>
                    <button
                      onClick={handleUploadAndUpdate}
                      disabled={!file || isUploading}
                      className="btn btn-primary w-full flex items-center justify-center space-x-2"
                    >
                      {isUploading ? (
                        <RefreshCw style={{ height: "1rem", width: "1rem" }} className="spinner" />
                      ) : (
                        <Upload style={{ height: "1rem", width: "1rem" }} />
                      )}
                      <span>{isUploading ? "Mengupdate Data..." : "Upload & Update"}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="alert alert-yellow">
                  <h3 className="font-medium text-yellow-800 mb-2">HAL YANG PERLU DIPERHATIKAN</h3>
                    <li>File Excel harus memiliki kolom yang sesuai dengan skema basis data pada halaman dahsboard</li>
                    <li>Kolom wajib terdapat: jenis_mesin, tid, kc_supervisi, lokasi</li>
                    <li>Kombinasi TID dan Lokasi harus unik untuk data baru</li>
                    <li>Proses pembaruan akan mencocokkan data berdasarkan TID dan Lokasi</li>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminPanel