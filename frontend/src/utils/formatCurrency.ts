export const formatCurrency = (value: number | string | null | undefined): string => {
  if (!value || value === "" || value === 0) return "-"

  let numValue: number
  if (typeof value === "string") {
    // Remove any existing currency formatting
    const cleanValue = value.replace(/[^\d.-]/g, "")
    numValue = Number.parseFloat(cleanValue)
  } else {
    numValue = value
  }

  if (isNaN(numValue)) return "-"

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)
}
