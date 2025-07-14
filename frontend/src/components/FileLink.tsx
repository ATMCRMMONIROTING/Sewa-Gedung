"use client"

import type React from "react"
import { useRef } from "react"
import { Upload, FileText, ExternalLink } from "lucide-react"

interface FileLinkProps {
  tid: string
  lokasi: string
  fileType: string
  fileUrl?: string
  fileName?: string
  onUpload: (tid: string, lokasi: string, fileType: string, file: File) => void
}

export const FileLink: React.FC<FileLinkProps> = ({ tid, lokasi, fileType, fileUrl, fileName, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
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

  const handleFileOpen = () => {
    if (fileUrl) {
      const backendUrl = import.meta.env.VITE_API_URL // or use environment variable
      const fullUrl = `${backendUrl}/${fileUrl}`
      window.open(fullUrl, "_blank")
    }
  }

  return (
    <div className="file-upload-btn-container">
      {fileUrl ? (
        // Show link when file exists
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={handleFileOpen}
            className="btn btn-primary file-upload-btn flex items-center space-x-2"
            title={fileName || "Open file"}
          >
            <FileText style={{ height: "0.75rem", width: "0.75rem" }} />
            <span>View PDF</span>
            <ExternalLink style={{ height: "0.75rem", width: "0.75rem" }} />
          </button>

          <button
            onClick={handleUploadClick}
            className="btn btn-secondary file-upload-btn text-xs"
            title="Replace file"
          >
            <Upload style={{ height: "0.75rem", width: "0.75rem" }} />
            <span>Replace</span>
          </button>
        </div>
      ) : (
        // Show upload button when no file
        <button onClick={handleUploadClick} className="btn btn-secondary file-upload-btn">
          <Upload style={{ height: "0.75rem", width: "0.75rem" }} />
          <span>Add PDF</span>
        </button>
      )}

      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
    </div>
  )
}