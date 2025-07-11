"use client"

import type React from "react"

import { useState } from "react"
import { Check, X } from "lucide-react"

interface EditableCellProps {
  value: string | number | null | undefined
  onSave: (value: string) => void
  type?: "text" | "number"
}

export const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, type = "text" }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value?.toString() || "")

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(value?.toString() || "")
  }

  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value?.toString() || "")
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="cell-edit-container">
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input cell-edit-input"
          autoFocus
        />
        <button onClick={handleSave} className="cell-action-btn save">
          <Check style={{ height: "1rem", width: "1rem" }} />
        </button>
        <button onClick={handleCancel} className="cell-action-btn cancel">
          <X style={{ height: "1rem", width: "1rem" }} />
        </button>
      </div>
    )
  }

  return (
    <div onDoubleClick={handleDoubleClick} className="editable-cell" title="Double-click to edit">
      {value || "-"}
    </div>
  )
}