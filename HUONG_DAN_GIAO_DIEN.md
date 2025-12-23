# HƯỚNG DẪN TẠO GIAO DIỆN (UI GUIDELINES)

Tài liệu này quy định các nguyên tắc thiết kế và phát triển giao diện cho dự án.

## 1. Nguyên tắc thiết kế (Design Principles)

### Màu sắc & Nền (Colors & Backgrounds)
- **Hạn chế tối đa Gradient**: Ưu tiên sử dụng màu đơn sắc (solid colors), clean và hiện đại.
- Sử dụng hệ thống màu của **Shadcn UI** và **Tailwind CSS**.
- Giao diện cần sáng sủa, rõ ràng, tập trung vào nội dung.

### Iconography
- **KHÔNG SỬ DỤNG EMOJI**: Tuyệt đối không dùng emoji trong giao diện chính thức.
- **Sử dụng Lucide React**: Tất cả các biểu tượng (icons) phải được lấy từ thư viện `lucide-react`.
  - Ví dụ: `<Home />`, `<User />`, `<Settings />`.

## 2. Thư viện Component (Component Library)

### Shadcn UI
- Dự án sử dụng **Shadcn UI** làm thư viện component chính.
- Khi cần một component mới, ưu tiên tìm và cài đặt từ Shadcn trước khi tự build.
- Cài đặt component: `npx shadcn@latest add [component-name]`

## 3. Quy tắc đặt tên (Naming Conventions)

### Tên File & Thư mục (Files & Directories)
- **Trang (Pages)**: Tên file cho các trang màn hình phải đặt bằng **Tiếng Việt**.
  - Ví dụ: `TrangChu.tsx`, `GioiThieu.tsx`, `QuanLyNguoiDung.tsx`.
- **Component**: Tên component nhỏ (reusable) có thể đặt tên tiếng Anh hoặc tiếng Việt nhưng cần thống nhất (ưu tiên tiếng Anh cho các component cơ sở như Button, Input...).

## 4. Ví dụ mẫu (Examples)

### Sử dụng Icon
```tsx
import { Home } from "lucide-react"

export function MyComponent() {
  return (
    <div>
      <Home className="w-4 h-4 mr-2" />
      <span>Trang chủ</span>
    </div>
  )
}
```

### Button
Sử dụng Button từ Shadcn:
```tsx
import { Button } from "@/components/ui/button"

export function ActionButton() {
  return (
    <Button variant="outline">Xác nhận</Button>
  )
}
```
