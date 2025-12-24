import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { Menu } from "@/pages/Menu"
import { QuanLyOrder } from "@/pages/QuanLyOrder"
import { NhapDon } from "@/pages/NhapDon"
import { LoginPage } from "@/pages/LoginPage"
import { QuanLyNhanSu } from "@/pages/QuanLyNhanSu"
import { ChiTietNhanSu } from "@/pages/ChiTietNhanSu"

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
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><QuanLyOrder /></ProtectedRoute>} />
        <Route path="/nhap-don" element={<ProtectedRoute><NhapDon /></ProtectedRoute>} />
        <Route path="/nhan-su" element={<ProtectedRoute><QuanLyNhanSu /></ProtectedRoute>} />
        <Route path="/nhan-su/:id" element={<ProtectedRoute><ChiTietNhanSu /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
