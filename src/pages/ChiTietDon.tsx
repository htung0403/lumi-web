import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
import { DatePicker } from "@/components/ui/date-picker"
import { AlertCircle, Save, ArrowLeft, Search, Check, ChevronDown, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const F3_URL = import.meta.env.VITE_F3_URL;
const HR_URL = import.meta.env.VITE_HR_URL;

interface OrderData {
    [key: string]: any;
}

function getRowValue(row: OrderData, ...keys: string[]): string {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return String(row[key]);
        }
    }
    return '';
}

export function ChiTietDon() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [khuVuc, setKhuVuc] = useState("");
    const [matHang, setMatHang] = useState("");
    const [maDon, setMaDon] = useState("");
    const [tracking, setTracking] = useState("");
    const [tongTien, setTongTien] = useState("");
    const [phiShip, setPhiShip] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    const [ketQuaCheck, setKetQuaCheck] = useState("");
    const [trangThaiGiaoHang, setTrangThaiGiaoHang] = useState("");
    const [trangThaiThuTien, setTrangThaiThuTien] = useState("");

    // Employee states
    const [saleEmployees, setSaleEmployees] = useState<any[]>([]);
    const [mktEmployees, setMktEmployees] = useState<any[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [selectedSale, setSelectedSale] = useState("");
    const [selectedMkt, setSelectedMkt] = useState("");
    const [saleSearch, setSaleSearch] = useState("");
    const [mktSearch, setMktSearch] = useState("");
    const [isSaleOpen, setIsSaleOpen] = useState(false);
    const [isMktOpen, setIsMktOpen] = useState(false);

    // Load order data
    useEffect(() => {
        const loadOrderData = async () => {
            if (!id) {
                setError("Không tìm thấy mã đơn hàng");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch F3 data
                const f3Res = await fetch(F3_URL);
                const f3Data = await f3Res.json();
                const f3List = Array.isArray(f3Data)
                    ? f3Data
                    : Object.values(f3Data || {}).filter(i => i && typeof i === 'object');

                // Find the order by ID
                const order = f3List.find((o: any) => {
                    const orderId = getRowValue(o, 'Mã_đơn_hàng', 'Mã đơn hàng');
                    return orderId === id;
                });

                if (!order) {
                    setError(`Không tìm thấy đơn hàng với mã: ${id}`);
                    setLoading(false);
                    return;
                }

                // Populate form fields
                const dateStr = getRowValue(order, 'Ngày_lên_đơn', 'Ngày lên đơn', 'Thời gian lên đơn');
                if (dateStr) {
                    try {
                        setDate(new Date(dateStr));
                    } catch { }
                }

                setCustomerName(getRowValue(order, 'Name', 'Name*', 'Tên lên đơn'));
                setPhone(getRowValue(order, 'Phone', 'Số điện thoại'));
                setAddress(getRowValue(order, 'Add', 'Địa chỉ'));
                setCity(getRowValue(order, 'City', 'Thành phố'));
                setState(getRowValue(order, 'State', 'Tỉnh'));
                setZipcode(getRowValue(order, 'Zipcode', 'Mã bưu điện'));
                setKhuVuc(getRowValue(order, 'Khu_vực', 'Khu vực'));
                setMatHang(getRowValue(order, 'Mặt_hàng', 'Mặt hàng'));
                setMaDon(getRowValue(order, 'Mã_đơn_hàng', 'Mã đơn hàng'));
                setTracking(getRowValue(order, 'Mã_Tracking', 'Mã Tracking'));
                setTongTien(getRowValue(order, 'Tổng_tiền_VNĐ', 'Tổng tiền VNĐ', 'Tổng Tiền VNĐ'));
                setPhiShip(getRowValue(order, 'Phí_ship', 'Phí ship'));
                setGhiChu(getRowValue(order, 'Ghi_chú', 'Ghi chú'));
                setSelectedSale(getRowValue(order, 'Nhân_viên_Sale', 'Nhân viên Sale'));
                setSelectedMkt(getRowValue(order, 'Nhân_viên_Marketing', 'Nhân viên Marketing'));
                setKetQuaCheck(getRowValue(order, 'Kết_quả_Check', 'Kết quả Check'));
                setTrangThaiGiaoHang(getRowValue(order, 'Trạng_thái_giao_hàng', 'Trạng thái giao hàng NB', 'Trạng thái giao hàng'));
                setTrangThaiThuTien(getRowValue(order, 'Trạng_thái_thu_tiền', 'Trạng thái thu tiền'));

                // Load employees
                await loadEmployees();

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Lỗi tải dữ liệu đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        loadOrderData();
    }, [id]);

    const loadEmployees = async () => {
        setLoadingEmployees(true);
        try {
            const hrRes = await fetch(HR_URL);
            const hrData = await hrRes.json();
            const hrList = Array.isArray(hrData) ? hrData : Object.values(hrData || {}).filter(i => i && typeof i === 'object');

            const saleList = hrList.filter((e: any) => {
                const dep = (e['Bộ_phận'] || e['Bộ phận'] || "").toString().trim().toLowerCase();
                return dep === 'sale' || dep === 'sales';
            });
            setSaleEmployees(saleList);

            const mktList = hrList.filter((e: any) => {
                const dep = (e['Bộ_phận'] || e['Bộ phận'] || "").toString().trim().toLowerCase();
                return dep === 'mkt' || dep === 'marketing';
            });
            setMktEmployees(mktList);
        } catch (err) {
            console.error("Lỗi tải danh sách nhân viên:", err);
        } finally {
            setLoadingEmployees(false);
        }
    };

    const filteredSaleEmployees = useMemo(() => {
        if (!saleSearch) return saleEmployees;
        return saleEmployees.filter(e =>
            (e['Họ_và_tên'] || e['Họ và tên'] || "").toLowerCase().includes(saleSearch.toLowerCase())
        );
    }, [saleEmployees, saleSearch]);

    const filteredMktEmployees = useMemo(() => {
        if (!mktSearch) return mktEmployees;
        return mktEmployees.filter(e =>
            (e['Họ_và_tên'] || e['Họ và tên'] || "").toLowerCase().includes(mktSearch.toLowerCase())
        );
    }, [mktEmployees, mktSearch]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // TODO: Implement actual save logic to Firebase
            // For now, just show a success message
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Đã lưu thay đổi thành công!");
            navigate("/chinh-sua-don");
        } catch (err: any) {
            toast.error(err.message || "Lỗi khi lưu đơn hàng");
        } finally {
            setSaving(false);
        }
    };

    if (error) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <p className="text-red-500 font-medium">{error}</p>
                        <Button variant="outline" onClick={() => navigate("/chinh-sua-don")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => navigate("/chinh-sua-don")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#2d7c2d]">Chỉnh sửa đơn hàng</h1>
                            <p className="text-muted-foreground text-sm">
                                {loading ? <Skeleton className="h-4 w-32 mt-1" /> : `Mã đơn: ${maDon}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/chinh-sua-don")}>
                            Hủy
                        </Button>
                        <Button
                            className="bg-[#2d7c2d] hover:bg-[#246124]"
                            onClick={handleSave}
                            disabled={saving || loading}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </>
                            )}
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
                                {loading ? (
                                    Array.from({ length: 9 }).map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-9 w-full" />
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="ngay-len-don">Ngày lên đơn*</Label>
                                            <DatePicker value={date} onChange={setDate} className="w-full text-left" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="ten-kh">Tên khách hàng*</Label>
                                            <Input
                                                id="ten-kh"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="Họ và tên khách hàng..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Số điện thoại*</Label>
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Số điện thoại..."
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="address">Địa chỉ*</Label>
                                            <Input
                                                id="address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Địa chỉ chi tiết..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="khu-vuc">Khu vực</Label>
                                            <Input
                                                id="khu-vuc"
                                                value={khuVuc}
                                                onChange={(e) => setKhuVuc(e.target.value)}
                                                placeholder="Khu vực..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="Thành phố..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                placeholder="Tỉnh/Bang..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="zipcode">Zipcode</Label>
                                            <Input
                                                id="zipcode"
                                                value={zipcode}
                                                onChange={(e) => setZipcode(e.target.value)}
                                                placeholder="Mã bưu điện..."
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Thông tin đơn */}
                    <TabsContent value="thong-tin-don" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3 border-b mb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[#2d7c2d] rounded-full" />
                                    Chi tiết đơn hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loading ? (
                                    Array.from({ length: 9 }).map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-9 w-full" />
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="ma-don">Mã đơn hàng</Label>
                                            <Input
                                                id="ma-don"
                                                value={maDon}
                                                onChange={(e) => setMaDon(e.target.value)}
                                                disabled
                                                className="bg-muted/50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tracking">Mã Tracking</Label>
                                            <Input
                                                id="tracking"
                                                value={tracking}
                                                onChange={(e) => setTracking(e.target.value)}
                                                placeholder="Mã tracking..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Mặt hàng</Label>
                                            <Select value={matHang} onValueChange={setMatHang}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn mặt hàng..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bakuchiol-retinol">Bakuchiol Retinol</SelectItem>
                                                    <SelectItem value="bonavita-coffee">Bonavita Coffee</SelectItem>
                                                    <SelectItem value="combo-gold-24k">ComboGold24k</SelectItem>
                                                    <SelectItem value="dg">DG</SelectItem>
                                                    <SelectItem value="dragon-blood-cream">Dragon Blood Cream</SelectItem>
                                                    <SelectItem value="dan-kinoki">Dán Kinoki</SelectItem>
                                                    <SelectItem value="fitgum-cafe-20x">Fitgum CAFE 20X</SelectItem>
                                                    <SelectItem value="gel-da-day">Gel Dạ Dày</SelectItem>
                                                    <SelectItem value="gel-tri">Gel Trĩ</SelectItem>
                                                    <SelectItem value="gel-xk-phi">Gel XK Phi</SelectItem>
                                                    <SelectItem value="gel-xk-thai">Gel XK Thái</SelectItem>
                                                    <SelectItem value="gel-xuong-khop">Gel Xương Khớp</SelectItem>
                                                    <SelectItem value="glutathione-collagen">Glutathione Collagen</SelectItem>
                                                    <SelectItem value="glutathione-collagen-new">Glutathione Collagen NEW</SelectItem>
                                                    <SelectItem value="kem-body">Kem Body</SelectItem>
                                                    <SelectItem value="keo-tao">Kẹo Táo</SelectItem>
                                                    <SelectItem value="nam-dr-hancy">Nám DR Hancy</SelectItem>
                                                    <SelectItem value="serum-sam">Serum Sâm</SelectItem>
                                                    <SelectItem value="sua-tam-cuishifan">Sữa tắm CUISHIFAN</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tong-tien">Tổng tiền VNĐ</Label>
                                            <Input
                                                id="tong-tien"
                                                value={tongTien}
                                                onChange={(e) => setTongTien(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phi-ship">Phí ship</Label>
                                            <Input
                                                id="phi-ship"
                                                value={phiShip}
                                                onChange={(e) => setPhiShip(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Kết quả Check</Label>
                                            <Select value={ketQuaCheck} onValueChange={setKetQuaCheck}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn kết quả..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="OK">OK</SelectItem>
                                                    <SelectItem value="Chờ xác nhận">Chờ xác nhận</SelectItem>
                                                    <SelectItem value="Hủy">Hủy</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Trạng thái giao hàng</Label>
                                            <Select value={trangThaiGiaoHang} onValueChange={setTrangThaiGiaoHang}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Chờ giao">Chờ giao</SelectItem>
                                                    <SelectItem value="Đang giao">Đang giao</SelectItem>
                                                    <SelectItem value="Đã giao">Đã giao</SelectItem>
                                                    <SelectItem value="Hoàn">Hoàn</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Trạng thái thu tiền</Label>
                                            <Select value={trangThaiThuTien} onValueChange={setTrangThaiThuTien}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Chưa thu">Chưa thu</SelectItem>
                                                    <SelectItem value="Đã thu">Đã thu</SelectItem>
                                                    <SelectItem value="Đã đối soát">Đã đối soát</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2 md:col-span-3">
                                            <Label htmlFor="ghi-chu">Ghi chú</Label>
                                            <Textarea
                                                id="ghi-chu"
                                                value={ghiChu}
                                                onChange={(e) => setGhiChu(e.target.value)}
                                                placeholder="Ghi chú thêm..."
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Thông tin nhân sự */}
                    <TabsContent value="nhan-su" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3 border-b mb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[#2d7c2d] rounded-full" />
                                    Nhân viên phụ trách
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {loading ? (
                                    <>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-9 w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-9 w-full" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Sale Employee Dropdown */}
                                        <div className="space-y-2">
                                            <Label>Nhân viên Sale</Label>
                                            <Popover open={isSaleOpen} onOpenChange={setIsSaleOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={isSaleOpen}
                                                        className="w-full justify-between h-9 font-normal border-input bg-background hover:bg-background px-3"
                                                        disabled={loadingEmployees}
                                                    >
                                                        {selectedSale ? (
                                                            <span className="truncate">{selectedSale}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">{loadingEmployees ? "Đang tải..." : "Chọn nhân viên..."}</span>
                                                        )}
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center border-b px-3">
                                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                            <input
                                                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                                                placeholder="Tìm tên nhân viên..."
                                                                value={saleSearch}
                                                                onChange={(e) => setSaleSearch(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="max-h-[300px] overflow-y-auto p-1">
                                                            {filteredSaleEmployees.length === 0 ? (
                                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                                    Không tìm thấy nhân viên Sale.
                                                                </div>
                                                            ) : (
                                                                filteredSaleEmployees.map((e, idx) => {
                                                                    const empName = e['Họ_và_tên'] || e['Họ và tên'] || `NV ${idx}`;
                                                                    const isSelected = selectedSale === empName;
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={cn(
                                                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                                                isSelected && "bg-accent/50 font-medium"
                                                                            )}
                                                                            onClick={() => {
                                                                                setSelectedSale(empName);
                                                                                setIsSaleOpen(false);
                                                                                setSaleSearch("");
                                                                            }}
                                                                        >
                                                                            <div className={cn(
                                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                                            )}>
                                                                                <Check className="h-3 w-3" />
                                                                            </div>
                                                                            <span className="truncate">{empName}</span>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Marketing Employee Dropdown */}
                                        <div className="space-y-2">
                                            <Label>Nhân viên Marketing</Label>
                                            <Popover open={isMktOpen} onOpenChange={setIsMktOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={isMktOpen}
                                                        className="w-full justify-between h-9 font-normal border-input bg-background hover:bg-background px-3"
                                                        disabled={loadingEmployees}
                                                    >
                                                        {selectedMkt ? (
                                                            <span className="truncate">{selectedMkt}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">{loadingEmployees ? "Đang tải..." : "Chọn nhân viên..."}</span>
                                                        )}
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center border-b px-3">
                                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                            <input
                                                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                                                placeholder="Tìm tên nhân viên..."
                                                                value={mktSearch}
                                                                onChange={(e) => setMktSearch(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="max-h-[300px] overflow-y-auto p-1">
                                                            {filteredMktEmployees.length === 0 ? (
                                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                                    Không tìm thấy nhân viên MKT.
                                                                </div>
                                                            ) : (
                                                                filteredMktEmployees.map((e, idx) => {
                                                                    const empName = e['Họ_và_tên'] || e['Họ và tên'] || `NV ${idx}`;
                                                                    const isSelected = selectedMkt === empName;
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={cn(
                                                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                                                isSelected && "bg-accent/50 font-medium"
                                                                            )}
                                                                            onClick={() => {
                                                                                setSelectedMkt(empName);
                                                                                setIsMktOpen(false);
                                                                                setMktSearch("");
                                                                            }}
                                                                        >
                                                                            <div className={cn(
                                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                                            )}>
                                                                                <Check className="h-3 w-3" />
                                                                            </div>
                                                                            <span className="truncate">{empName}</span>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
