import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export interface RentalData {
  id?: number
  jenis_mesin: string
  tid: string
  kc_supervisi: string
  lokasi: string
  vendor_cro?: string | null
  harga_sewa_tahun?: string | null
  total_harga_sewa_periode?: string | null
  lama_sewa_tahun?: string | null
  periode_awal?: string | null
  periode_akhir?: string | null
  nomor_polis_asuransi?: string | null
  perjanjian_sewa_pks?: string | null
  persetujuan_sewa_kode_remarks?: string | null
  pic?: string | null
  nomor_hp?: string | null
  state?: string | null
  notification?: boolean | null
  file_polis_asuransi_url?: string | null
  file_polis_asuransi_name?: string | null
  file_polis_asuransi_uploaded_at?: string | null
  file_pks_sewa_url?: string | null
  file_pks_sewa_name?: string | null
  file_pks_sewa_uploaded_at?: string | null
  file_sewa_kode_url?: string | null
  file_sewa_kode_name?: string | null
  file_sewa_kode_uploaded_at?: string | null
}

export const authAPI = {
  login: (username: string, password: string) => api.post("/auth/login", new URLSearchParams({ username, password })),

  register: (username: string, password: string) => api.post("/auth/register", { username, password }),

  getAllData: () => api.get<RentalData[]>("/auth/data"),

  addRow: (data: Partial<RentalData>) => api.post("/auth/add-row", data),

  editCell: (tid: string, lokasi: string, field: string, value: any) =>
    api.patch("/auth/edit-cell", null, {
      params: { tid, lokasi, field, value },
    }),

  uploadPdf: (tid: string, lokasi: string, fileType: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("file_type", fileType)
    return api.post(`/auth/upload-pdf?tid=${tid}&lokasi=${lokasi}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  batchDelete: (ids: number[]) => api.post("/auth/batch-delete", ids),
}

export const rentalAPI = {
  uploadAndCreate: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post("/rental/upload/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  uploadAndUpdate: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post("/rental/upload/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}

export default api
