import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { TrangChu } from "@/pages/TrangChu"
import { QuanLyOrder } from "@/pages/QuanLyOrder"
import { NhapDon } from "@/pages/NhapDon"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TrangChu />} />
        <Route path="/orders" element={<QuanLyOrder />} />
        <Route path="/nhap-don" element={<NhapDon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
