"use client"

import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Link, useLocation } from "react-router-dom"
import { LogOut, Database, Settings, Moon, Sun } from "lucide-react"

export const Header = () => {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-inner">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Monitoring Sewa Gedung</h1>
            <nav className="flex space-x-4">
              <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
                <Database style={{ display: "inline", height: "1rem", width: "1rem", marginRight: "0.25rem" }} />
                Dashboard
              </Link>
              <Link to="/admin" className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}>
                <Settings style={{ display: "inline", height: "1rem", width: "1rem", marginRight: "0.25rem" }} />
                Panel Admin
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.username}</span>
            <button onClick={toggleDarkMode} className="btn btn-secondary flex items-center space-x-2">
              {isDarkMode ? (
                <Sun style={{ height: "1rem", width: "1rem" }} />
              ) : (
                <Moon style={{ height: "1rem", width: "1rem" }} />
              )}
              <span>{isDarkMode ? "Terang" : "Gelap"}</span>
            </button>
            <button onClick={logout} className="btn btn-secondary flex items-center space-x-2">
              <LogOut style={{ height: "1rem", width: "1rem" }} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}