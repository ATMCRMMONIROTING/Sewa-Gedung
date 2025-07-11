"use client"

import type React from "react"

import { useRef } from "react"
import { Upload, FileText } from "lucide-react"

interface FileUploadButtonProps {
  tid: string
  lokasi: string
  fileType: string
  currentFile?: string
  onUpload: (tid: string, lokasi: string, fileType: string, file: File) => void
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ tid, lokasi, fileType, currentFile, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "application/pdf") {
        onUpload(tid, lokasi, fileType, file)
      } else {
        alert("Please select a PDF file")
      }
    }
  }

  return (
    <div className="file-upload-btn-container">
      <button onClick={handleClick} className="btn btn-secondary file-upload-btn">
        <Upload style={{ height: "0.75rem", width: "0.75rem" }} />
        <span>Add PDF</span>
      </button>

      {currentFile && (
        <div className="file-status">
          <FileText style={{ height: "0.75rem", width: "0.75rem" }} />
          <span>File uploaded</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
    </div>
  )
}