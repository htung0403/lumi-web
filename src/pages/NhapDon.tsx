import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateInput } from "@/components/ui/date-input"
import { AlertCircle, CheckCircle2, Save, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function NhapDon() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [trangThaiDon, setTrangThaiDon] = useState<"hop-le" | "xem-xet" | null>(null)
    const [xacNhan, setXacNhan] = useState({
        khach: false,
        don: false,
        giaoHang: false,
        thanhToan: false
    })

    // Get user from localStorage
    const userJson = localStorage.getItem("user")
    const user = userJson ? JSON.parse(userJson) : null
    const userName = user?.['Họ_và_tên'] || user?.['Họ và tên'] || user?.['Tên'] || ""
    const boPhan = user?.['Bộ_phận'] || user?.['Bộ phận'] || ""
    const teamSaleMar = user?.['Team_Sale_mar'] || user?.['Team'] || ""

    const toggleXacNhan = (key: keyof typeof xacNhan) => {
        setXacNhan(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#2d7c2d]">Nhập đơn hàng mới</h1>
                        <p className="text-muted-foreground italic text-sm">Vui lòng điền đầy đủ các thông tin bắt buộc (*)</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <XCircle className="w-4 h-4 mr-2" />
                            Hủy bỏ
                        </Button>
                        <Button className="bg-[#2d7c2d] hover:bg-[#256625]">
                            <Save className="w-4 h-4 mr-2" />
                            Lưu đơn hàng
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="khach-hang" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-12">
                        <TabsTrigger value="khach-hang" className="data-[state=active]:bg-[#2d7c2d] data-[state=active]:text-white">
                            Thông tin khách hàng
                        </TabsTrigger>
                        <TabsTrigger value="thong-tin-don" className="data-[state=active]:bg-[#2d7c2d] data-[state=active]:text-white">
                            Thông tin đơn
                        </TabsTrigger>
                        <TabsTrigger value="nhan-su" className="data-[state=active]:bg-[#2d7c2d] data-[state=active]:text-white">
                            Thông tin nhân sự
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Thông tin khách hàng */}
                    <TabsContent value="khach-hang" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3 border-b mb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[#2d7c2d] rounded-full" />
                                    Dữ liệu khách hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ngay-len-don">Ngày lên đơn*</Label>
                                    <DateInput value={date} onChange={setDate} className="w-full text-left" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nv-mkt">Nhân viên marketing</Label>
                                    <Input id="nv-mkt" defaultValue={boPhan.includes("MKT") || teamSaleMar.includes("MKT") ? userName : ""} placeholder="Nhập tên nhân viên..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ten-page">Tên page*</Label>
                                    <Input id="ten-page" placeholder="Nhập tên trang..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone*</Label>
                                    <Input id="phone" placeholder="Số điện thoại..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ten-kh">Tên*</Label>
                                    <Input id="ten-kh" placeholder="Họ và tên khách hàng..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="add">Add*</Label>
                                    <Input id="add" placeholder="Địa chỉ chi tiết..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Khu vực</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn khu vực..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mien-bac">Miền Bắc</SelectItem>
                                            <SelectItem value="mien-trung">Miền Trung</SelectItem>
                                            <SelectItem value="mien-nam">Miền Nam</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Loại tiền thanh toán</Label>
                                    <Select defaultValue="vnd">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn tiền tệ..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="vnd">VNĐ</SelectItem>
                                            <SelectItem value="usd">USD</SelectItem>
                                            <SelectItem value="khr">KHR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" placeholder="Thành phố..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" placeholder="Tỉnh/Bang..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zipcode">Zipcode</Label>
                                    <Input id="zipcode" placeholder="Mã bưu điện..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hinh-thuc">Hình thức thanh toán*</Label>
                                    <Input id="hinh-thuc" placeholder="Ví dụ: Chuyển khoản, COD..." />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Thông tin đơn */}
                    <TabsContent value="thong-tin-don" className="mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader className="pb-3 border-b mb-4">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <div className="w-1 h-6 bg-[#2d7c2d] rounded-full" />
                                        Chi tiết mặt hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Mặt hàng (Chính)</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn mặt hàng..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hang-a">Mặt hàng A</SelectItem>
                                                    <SelectItem value="hang-b">Mặt hàng B</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ma-don">Mã đơn hàng</Label>
                                            <Input id="ma-don" placeholder="Tự động hoặc nhập tay..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-3 space-y-2">
                                            <Label htmlFor="mathang1">Tên mặt hàng 1</Label>
                                            <Input id="mathang1" placeholder="Nhập tên..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sl1">Số lượng 1</Label>
                                            <Input id="sl1" type="number" defaultValue="1" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-3 space-y-2">
                                            <Label htmlFor="mathang2">Tên mặt hàng 2</Label>
                                            <Input id="mathang2" placeholder="Nhập tên..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sl2">Số lượng 2</Label>
                                            <Input id="sl2" type="number" defaultValue="0" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-t pt-4">
                                        <div className="md:col-span-3 space-y-2">
                                            <Label htmlFor="quatang">Quà tặng</Label>
                                            <Input id="quatang" placeholder="Tên quà tặng..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="slq">Số lượng quà</Label>
                                            <Input id="slq" type="number" defaultValue="0" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gia-goc">Giá gốc</Label>
                                            <Input id="gia-goc" type="number" placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gia-ban">Giá bán</Label>
                                            <Input id="gia-ban" type="number" placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tong-tien" className="text-[#2d7c2d] font-bold">Tổng tiền VNĐ</Label>
                                            <Input id="tong-tien" type="number" className="border-[#2d7c2d] bg-green-50 font-bold" placeholder="0" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="border-yellow-200 bg-yellow-50/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-yellow-700 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Kiểm tra hệ thống
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs space-y-2 text-yellow-800">
                                        <p>• Cảnh báo Blacklist: <span className="font-semibold text-green-600">Sạch</span></p>
                                        <p>• Trùng đơn: <span className="font-semibold text-green-600">Không phát hiện</span></p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold">Ghi chú & Phản hồi</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="ghi-chu" className="text-xs">Ghi chú</Label>
                                            <Textarea id="ghi-chu" placeholder="Nhập ghi chú..." className="h-20" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="ph-tc" className="text-xs text-green-600">Phản hồi tích cực</Label>
                                            <Textarea id="ph-tc" placeholder="..." className="h-16" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="ph-tc" className="text-xs text-red-600">Phản hồi tiêu cực</Label>
                                            <Textarea id="ph-tc" placeholder="..." className="h-16" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Thông tin nhân sự */}
                    <TabsContent value="nhan-su" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3 border-b mb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[#2d7c2d] rounded-full" />
                                    Xử lý bởi nhân viên
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>Nhân viên Sale</Label>
                                        <Select defaultValue={boPhan.includes("Sale") || teamSaleMar.includes("SALE") ? userName : undefined}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nhân viên..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {boPhan.includes("Sale") || teamSaleMar.includes("SALE") ? (
                                                    <SelectItem value={userName}>{userName}</SelectItem>
                                                ) : (
                                                    <>
                                                        <SelectItem value="nv1">Nguyễn Văn A</SelectItem>
                                                        <SelectItem value="nv2">Trần Thị B</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phân loại khách hàng</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phân loại..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="moi">Khách mới</SelectItem>
                                                <SelectItem value="cu">Khách cũ</SelectItem>
                                                <SelectItem value="vip">VIP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Trạng thái đơn</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={trangThaiDon === "hop-le" ? "default" : "outline"}
                                                className={cn("flex-1", trangThaiDon === "hop-le" && "bg-green-600 hover:bg-green-700")}
                                                onClick={() => setTrangThaiDon("hop-le")}
                                            >
                                                Đơn hợp lệ
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={trangThaiDon === "xem-xet" ? "default" : "outline"}
                                                className={cn("flex-1", trangThaiDon === "xem-xet" && "bg-yellow-600 hover:bg-yellow-700")}
                                                onClick={() => setTrangThaiDon("xem-xet")}
                                            >
                                                Đơn xem xét
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dien-giai">Diễn giải</Label>
                                    <Textarea id="dien-giai" placeholder="Nhập diễn giải chi tiết về đơn hàng hoặc khách hàng..." className="h-24" />
                                </div>

                                <div className="space-y-4 border-t pt-6">
                                    <Label className="text-base font-bold text-[#2d7c2d]">Quy trình xác nhận đơn</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Button
                                            type="button"
                                            variant={xacNhan.khach ? "default" : "outline"}
                                            className={cn("h-16 flex flex-col gap-1 transition-all", xacNhan.khach && "bg-green-600 hover:bg-green-700 border-none")}
                                            onClick={() => toggleXacNhan("khach")}
                                        >
                                            <span className="text-xs opacity-70">Bước 1</span>
                                            <span className="font-semibold">TT Khách</span>
                                            {xacNhan.khach && <CheckCircle2 className="w-4 h-4 mt-1" />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={xacNhan.don ? "default" : "outline"}
                                            className={cn("h-16 flex flex-col gap-1 transition-all", xacNhan.don && "bg-green-600 hover:bg-green-700 border-none")}
                                            onClick={() => toggleXacNhan("don")}
                                        >
                                            <span className="text-xs opacity-70">Bước 2</span>
                                            <span className="font-semibold">TT Đơn</span>
                                            {xacNhan.don && <CheckCircle2 className="w-4 h-4 mt-1" />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={xacNhan.giaoHang ? "default" : "outline"}
                                            className={cn("h-16 flex flex-col gap-1 transition-all", xacNhan.giaoHang && "bg-green-600 hover:bg-green-700 border-none")}
                                            onClick={() => toggleXacNhan("giaoHang")}
                                        >
                                            <span className="text-xs opacity-70">Bước 3</span>
                                            <span className="font-semibold">TT Giao hàng</span>
                                            {xacNhan.giaoHang && <CheckCircle2 className="w-4 h-4 mt-1" />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={xacNhan.thanhToan ? "default" : "outline"}
                                            className={cn("h-16 flex flex-col gap-1 transition-all", xacNhan.thanhToan && "bg-green-600 hover:bg-green-700 border-none")}
                                            onClick={() => toggleXacNhan("thanhToan")}
                                        >
                                            <span className="text-xs opacity-70">Bước 4</span>
                                            <span className="font-semibold">TT Thanh toán</span>
                                            {xacNhan.thanhToan && <CheckCircle2 className="w-4 h-4 mt-1" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}
