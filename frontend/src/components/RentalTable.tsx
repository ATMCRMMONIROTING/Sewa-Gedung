"use client"

import type React from "react"
import type { RentalData } from "../services/api"
import { FileLink } from "./FileLink"
import { EditableCell } from "./EditableCell"
import { formatCurrency } from "../utils/formatCurrency"
import clsx from "clsx"

interface RentalTableProps {
  data: RentalData[]
  selectedRows: Set<number>
  onRowSelect: (id: number, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onEditCell: (tid: string, lokasi: string, field: string, value: any) => void
  onFileUpload: (tid: string, lokasi: string, fileType: string, file: File) => void
}

export const RentalTable: React.FC<RentalTableProps> = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onEditCell,
  onFileUpload,
}) => {
  const columns = [
    { key: "jenis_mesin", label: "Jenis Mesin" },
    { key: "tid", label: "TID" },
    { key: "kc_supervisi", label: "KC Supervisi" },
    { key: "lokasi", label: "Lokasi" },
    { key: "vendor_cro", label: "Vendor CRO" },
    { key: "harga_sewa_tahun", label: "Harga Sewa/Tahun" },
    { key: "total_harga_sewa_periode", label: "Total Harga Sewa Periode" },
    { key: "lama_sewa_tahun", label: "Lama Sewa" },
    { key: "pic", label: "PIC" },
    { key: "nomor_hp", label: "Nomor HP" },
    { key: "state", label: "State" },
    { key: "file_polis_asuransi_url", label: "File Polis Asuransi" },
    { key: "file_pks_sewa_url", label: "File PKS Sewa" },
    { key: "file_sewa_kode_url", label: "File Sewa Kode" },
  ]

  const fileColumns = ["file_polis_asuransi_url", "file_pks_sewa_url", "file_sewa_kode_url"]
  const currencyColumns = ["harga_sewa_tahun", "total_harga_sewa_periode"]

  // Debug: Log the first few rows to see the data structure
  console.log("First 3 rows of data:", data.slice(0, 3))

  // Filter data to only include rows with valid IDs
  const validData = data.filter((row) => row.id !== undefined && row.id !== null)

  // Debug: Check if we have any valid data
  console.log("Valid data count:", validData.length, "Total data count:", data.length)
  console.log("Sample valid data:", validData.slice(0, 2))

  const allSelected = validData.length > 0 && validData.every((row) => selectedRows.has(row.id!))
  const someSelected = validData.some((row) => selectedRows.has(row.id!)) && !allSelected

  // Enhanced debug logs
  console.log("RentalTable - Data length:", data.length)
  console.log("RentalTable - Valid data length:", validData.length)
  console.log("RentalTable - Selected rows:", Array.from(selectedRows))
  console.log("RentalTable - All selected:", allSelected)
  console.log("RentalTable - Some selected:", someSelected)

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    console.log("Header checkbox clicked:", e.target.checked)
    console.log("Valid data for selection:", validData.length)
    onSelectAll(e.target.checked)
  }

  const handleRowSelectChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: number) => {
    e.stopPropagation()
    console.log("Row checkbox clicked:", rowId, e.target.checked)
    onRowSelect(rowId, e.target.checked)
  }

  // If no valid data, show a message
  if (data.length > 0 && validData.length === 0) {
    console.warn("No rows have valid IDs. Checkbox functionality will be disabled.")
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="checkbox-header">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected
                }}
                onChange={handleSelectAllChange}
                className="checkbox"
                disabled={validData.length === 0}
                style={{
                  pointerEvents: "auto",
                  cursor: validData.length > 0 ? "pointer" : "not-allowed",
                }}
                title={validData.length === 0 ? "No selectable rows" : "Select all rows"}
              />
            </th>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const isSelected = row.id ? selectedRows.has(row.id) : false
            const hasValidId = row.id !== undefined && row.id !== null

            // Enhanced logging for debugging
            if (index < 5) {
              // Only log first 5 rows to avoid spam
              console.log(
                `Row ${index}: TID=${row.tid}, ID=${row.id}, HasValidId=${hasValidId}, Selected=${isSelected}`,
              )
            }

            return (
              <tr
                key={`${row.tid}-${row.lokasi}-${row.id || index}`}
                data-row-id={`${row.tid}-${row.lokasi}`}
                className={clsx({
                  "warning-row": row.state === "warning",
                  "selected-row": hasValidId && selectedRows.has(row.id!),
                })}
              >
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation()
                      if (hasValidId) {
                        handleRowSelectChange(e, row.id!)
                      } else {
                        console.warn(`Row with TID ${row.tid} has no valid ID`)
                      }
                    }}
                    className="checkbox"
                    disabled={!hasValidId}
                    style={{
                      pointerEvents: "auto",
                      cursor: hasValidId ? "pointer" : "not-allowed",
                    }}
                    title={hasValidId ? "Select this row" : "Row has no valid ID"}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key} className="relative">
                    {fileColumns.includes(column.key) ? (
                      <FileLink
                        tid={row.tid}
                        lokasi={row.lokasi}
                        fileType={column.key.replace("file_", "").replace("_url", "")}
                        fileUrl={row[column.key as keyof RentalData] as string}
                        fileName={row[`${column.key.replace("_url", "_name")}` as keyof RentalData] as string}
                        onUpload={onFileUpload}
                      />
                    ) : currencyColumns.includes(column.key) ? (
                      <div className="currency-cell">
                        {formatCurrency(row[column.key as keyof RentalData] as string | number)}
                      </div>
                    ) : (
                      <EditableCell
                        value={row[column.key as keyof RentalData] as string}
                        onSave={(value) => onEditCell(row.tid, row.lokasi, column.key, value)}
                        type={column.key.includes("harga") ? "number" : "text"}
                      />
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Debug info */}
      {data.length > 0 && validData.length === 0 && (
        <div className="alert alert-yellow mt-4">
          <p className="text-sm">
            <strong>Note:</strong> No rows have valid IDs. Checkbox selection is disabled. This might indicate a backend
            issue where the 'id' field is not being returned properly.
          </p>
        </div>
      )}
    </div>
  )
}