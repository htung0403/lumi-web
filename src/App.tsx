import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { TrangChu } from "@/pages/TrangChu"
import { QuanLyOrder } from "@/pages/QuanLyOrder"
import { NhapDon } from "@/pages/NhapDon"
import { LoginPage } from "@/pages/LoginPage"

// Simple Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user")
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><TrangChu /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><QuanLyOrder /></ProtectedRoute>} />
        <Route path="/nhap-don" element={<ProtectedRoute><NhapDon /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
