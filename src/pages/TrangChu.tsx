import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"

export function TrangChu() {
    return (
        <MainLayout>
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <Home className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Xin chào Shadcn + Vite</h1>
                </div>
                <p className="text-muted-foreground">
                    Đây là trang chủ mẫu tuân thủ quy tắc đặt tên tiếng Việt và sử dụng Layout chung.
                </p>
                <div className="flex gap-2">
                    <Button variant="default">Nút Mặc Định</Button>
                    <Button variant="destructive">Nút Cảnh Báo</Button>
                </div>
            </div>
        </MainLayout>
    )
}
