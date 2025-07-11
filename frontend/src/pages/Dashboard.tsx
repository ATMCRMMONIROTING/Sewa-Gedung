"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { authAPI, type RentalData } from "../services/api"
import { RentalTable } from "../components/RentalTable"
import { AddRowModal } from "../components/AddRowModal"
import { Header } from "../components/Header"
import { exportToExcel } from "../utils/exportToExcel"
import toast from "react-hot-toast"
import { Plus, RefreshCw, Filter, AlertTriangle, ChevronDown, ChevronUp, Trash2, Download } from "lucide-react"

const Dashboard = () => {
  const [data, setData] = useState<RentalData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filters, setFilters] = useState({
    state: "",
    jenis_mesin: "",
    kc_supervisi: "",
    vendor_cro: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showWarningSummary, setShowWarningSummary] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await authAPI.getAllData()
      console.log("Raw API response:", response.data) // Enhanced debug log

      // Check if the data has proper structure
      if (response.data && response.data.length > 0) {
        console.log("Sample row structure:", response.data[0])
        console.log("Row keys:", Object.keys(response.data[0]))

        // Check for ID field variations
        const firstRow = response.data[0]
        console.log("ID field check:", {
          id: firstRow.id
        })
      }

      setData(response.data)
      setSelectedRows(new Set()) // Clear selections when data refreshes
    } catch (error: any) {
      toast.error("Failed to fetch data")
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const states = [...new Set(data.map((item) => item.state).filter((value): value is string => Boolean(value)))]
    const jenisMesin = [
      ...new Set(data.map((item) => item.jenis_mesin).filter((value): value is string => Boolean(value))),
    ]
    const kcSupervisi = [
      ...new Set(data.map((item) => item.kc_supervisi).filter((value): value is string => Boolean(value))),
    ]
    const vendorCro = [
      ...new Set(data.map((item) => item.vendor_cro).filter((value): value is string => Boolean(value))),
    ]

    return { states, jenisMesin, kcSupervisi, vendorCro }
  }, [data])

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        (!filters.state || item.state === filters.state) &&
        (!filters.jenis_mesin || item.jenis_mesin === filters.jenis_mesin) &&
        (!filters.kc_supervisi || item.kc_supervisi === filters.kc_supervisi) &&
        (!filters.vendor_cro || item.vendor_cro === filters.vendor_cro)
      )
    })
  }, [data, filters])

  // Warning items
  const warningItems = useMemo(() => {
    return data.filter((item) => item.state === "warning")
  }, [data])

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      state: "",
      jenis_mesin: "",
      kc_supervisi: "",
      vendor_cro: "",
    })
  }

  const scrollToRow = (tid: string, lokasi: string) => {
    const rowElement = document.querySelector(`[data-row-id="${tid}-${lokasi}"]`)
    if (rowElement && tableRef.current) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center" })
      // Highlight the row briefly
      rowElement.classList.add("highlight-row")
      setTimeout(() => {
        rowElement.classList.remove("highlight-row")
      }, 2000)
    }
  }

  // Fixed handleRowSelect with useCallback to prevent re-renders
  const handleRowSelect = useCallback((id: number, checked: boolean) => {
    console.log("Dashboard - Row select called:", id, checked) // Debug log
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (checked) {
        newSelected.add(id)
        console.log("Dashboard - Added to selection:", id) // Debug log
      } else {
        newSelected.delete(id)
        console.log("Dashboard - Removed from selection:", id) // Debug log
      }
      console.log("Dashboard - New selection:", Array.from(newSelected)) // Debug log
      return newSelected
    })
  }, [])

  // Fixed handleSelectAll with useCallback
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      console.log("Dashboard - Select all called:", checked) // Debug log
      if (checked) {
        // Only select rows that have valid IDs and are in the filtered data
        const validIds = filteredData
          .filter((item) => item.id !== undefined && item.id !== null)
          .map((item) => item.id!)
        console.log("Dashboard - Selecting all IDs:", validIds) // Debug log
        setSelectedRows(new Set(validIds))
      } else {
        console.log("Dashboard - Clearing all selections") // Debug log
        setSelectedRows(new Set())
      }
    },
    [filteredData],
  )

  const handleBatchDelete = async () => {
    if (selectedRows.size === 0) {
      toast.error("Please select rows to delete")
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedRows.size} selected row(s)?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await authAPI.batchDelete(Array.from(selectedRows))
      toast.success(`${selectedRows.size} row(s) deleted successfully!`)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete rows")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split("T")[0]
    exportToExcel(data, `rental_data_all_${timestamp}`)
    toast.success("All data exported successfully!")
  }

  const handleExportFiltered = () => {
    const timestamp = new Date().toISOString().split("T")[0]
    const filterSuffix = Object.values(filters).some((f) => f) ? "_filtered" : "_all"
    exportToExcel(filteredData, `rental_data${filterSuffix}_${timestamp}`)
    toast.success("Filtered data exported successfully!")
  }

  const handleAddRow = async (newData: Partial<RentalData>) => {
    try {
      await authAPI.addRow(newData)
      toast.success("Row added successfully!")
      fetchData()
      setShowAddModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add row")
      console.error("Add row error:", error.response?.data)
    }
  }

  const handleEditCell = async (tid: string, lokasi: string, field: string, value: any) => {
    try {
      await authAPI.editCell(tid, lokasi, field, value)
      toast.success("Cell updated successfully!")
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update cell")
    }
  }

  const handleFileUpload = async (tid: string, lokasi: string, fileType: string, file: File) => {
    try {
      await authAPI.uploadPdf(tid, lokasi, fileType, file)
      toast.success("File uploaded successfully!")
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to upload file")
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    )
  }

  // Enhanced debug logs
  const validDataCount = data.filter((item) => item.id !== undefined && item.id !== null).length
  console.log("Dashboard - Current data:", data.length)
  console.log("Dashboard - Valid data with IDs:", validDataCount)
  console.log("Dashboard - Filtered data:", filteredData.length)
  console.log("Dashboard - Selected rows:", Array.from(selectedRows))

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-6">
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Rental Management Dashboard</h1>
              <p className="text-muted">Welcome back, {user?.username}!</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={fetchData} className="btn btn-secondary flex items-center space-x-2">
                <RefreshCw style={{ height: "1rem", width: "1rem" }} />
                <span>Refresh</span>
              </button>
              <button onClick={handleExportAll} className="btn btn-secondary flex items-center space-x-2">
                <Download style={{ height: "1rem", width: "1rem" }} />
                <span>Export All</span>
              </button>
              <button onClick={handleExportFiltered} className="btn btn-secondary flex items-center space-x-2">
                <Download style={{ height: "1rem", width: "1rem" }} />
                <span>Export Filtered</span>
              </button>
              {selectedRows.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  disabled={isDeleting}
                  className="btn btn-danger flex items-center space-x-2"
                >
                  <Trash2 style={{ height: "1rem", width: "1rem" }} />
                  <span>{isDeleting ? "Deleting..." : `Delete (${selectedRows.size})`}</span>
                </button>
              )}
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center space-x-2">
                <Plus style={{ height: "1rem", width: "1rem" }} />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          {/* Data Status Info */}
          {data.length > 0 && validDataCount === 0 && (
            <div className="alert alert-yellow mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle style={{ height: "1.25rem", width: "1.25rem", color: "#f59e0b" }} />
                <div>
                  <h3 className="font-medium text-yellow-800">Data Issue Detected</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {data.length} rows loaded but none have valid IDs. Checkbox selection is disabled. Please check your
                    backend API response.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Summary */}
          {warningItems.length > 0 && (
            <div className="card mb-6" style={{ borderLeft: "4px solid #dc2626" }}>
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle style={{ height: "1.25rem", width: "1.25rem", color: "#dc2626" }} />
                    <h3 className="font-medium text-red-800">Warning Items ({warningItems.length})</h3>
                  </div>
                  <button onClick={() => setShowWarningSummary(!showWarningSummary)} className="btn btn-secondary">
                    {showWarningSummary ? (
                      <ChevronUp style={{ height: "1rem", width: "1rem" }} />
                    ) : (
                      <ChevronDown style={{ height: "1rem", width: "1rem" }} />
                    )}
                  </button>
                </div>

                {showWarningSummary && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {warningItems.map((item, index) => (
                        <button
                          key={`${item.tid}-${item.lokasi}`}
                          onClick={() => scrollToRow(item.tid, item.lokasi)}
                          className="warning-summary-item text-left p-2 rounded border hover:bg-red-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-red-800">
                            {item.jenis_mesin} - {item.tid}
                          </div>
                          <div className="text-xs text-red-600">
                            {item.lokasi} | {item.kc_supervisi}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-6">
            <div className="card-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Filters</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Filter style={{ height: "1rem", width: "1rem" }} />
                    <span>Filters</span>
                  </button>
                  <button onClick={clearFilters} className="btn btn-secondary">
                    Clear All
                  </button>
                </div>
              </div>

              {/* Filter Controls */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label">State:</label>
                    <select
                      value={filters.state}
                      onChange={(e) => handleFilterChange("state", e.target.value)}
                      className="input"
                    >
                      <option value="">All States</option>
                      {filterOptions.states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Jenis Mesin:</label>
                    <select
                      value={filters.jenis_mesin}
                      onChange={(e) => handleFilterChange("jenis_mesin", e.target.value)}
                      className="input"
                    >
                      <option value="">All Types</option>
                      {filterOptions.jenisMesin.map((jenis) => (
                        <option key={jenis} value={jenis}>
                          {jenis}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">KC Supervisi:</label>
                    <select
                      value={filters.kc_supervisi}
                      onChange={(e) => handleFilterChange("kc_supervisi", e.target.value)}
                      className="input"
                    >
                      <option value="">All KC</option>
                      {filterOptions.kcSupervisi.map((kc) => (
                        <option key={kc} value={kc}>
                          {kc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Vendor CRO:</label>
                    <select
                      value={filters.vendor_cro}
                      onChange={(e) => handleFilterChange("vendor_cro", e.target.value)}
                      className="input"
                    >
                      <option value="">All Vendors</option>
                      {filterOptions.vendorCro.map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-muted">
                Showing {filteredData.length} of {data.length} records
                {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
                {validDataCount < data.length && ` • ${validDataCount} selectable`}
              </div>
            </div>
          </div>

          <div className="card" ref={tableRef}>
            <RentalTable
              data={filteredData}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              onEditCell={handleEditCell}
              onFileUpload={handleFileUpload}
            />
          </div>
        </div>
      </main>

      {showAddModal && <AddRowModal onClose={() => setShowAddModal(false)} onSubmit={handleAddRow} />}
    </div>
  )
}

export default Dashboard
