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
        toast.error("Please select an Excel file (.xlsx or .xls)")
      }
    }
  }

  const handleUploadAndCreate = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setIsUploading(true)
    try {
      const response = await rentalAPI.uploadAndCreate(file)
      toast.success(response.data.message)
      setFile(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadAndUpdate = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setIsUploading(true)
    try {
      const response = await rentalAPI.uploadAndUpdate(file)
      toast.success(response.data.message)
      setFile(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Upload failed")
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Upload Excel files to create or update rental data</p>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="space-y-6">
                {/* File Upload Section */}
                <div>
                  <label className="form-label mb-2">Select Excel File</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="file-upload-area">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileSpreadsheet
                          style={{ width: "2rem", height: "2rem", marginBottom: "1rem", color: "#6b7280" }}
                        />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
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
                      <p className="text-sm text-blue-700">Selected: {file.name}</p>
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
                      <h3 className="font-medium text-green-800">Create New Records</h3>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      Upload Excel file to create new rental records. Existing records will be skipped.
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
                      <span>{isUploading ? "Creating..." : "Upload & Create"}</span>
                    </button>
                  </div>

                  <div className="alert alert-blue">
                    <div className="flex items-center mb-2">
                      <RefreshCw
                        style={{ height: "1.25rem", width: "1.25rem", color: "#2563eb", marginRight: "0.5rem" }}
                      />
                      <h3 className="font-medium text-blue-800">Update Existing Records</h3>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">
                      Upload Excel file to update existing rental records based on TID and Location.
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
                      <span>{isUploading ? "Updating..." : "Upload & Update"}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="alert alert-yellow">
                  <h3 className="font-medium text-yellow-800 mb-2">Instructions</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Excel file should contain columns matching the database schema</li>
                    <li>• Required fields: jenis_mesin, tid, kc_supervisi, lokasi</li>
                    <li>• TID and Location combination must be unique for new records</li>
                    <li>• Update operation matches records by TID and Location</li>
                  </ul>
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