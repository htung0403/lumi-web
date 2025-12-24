import { useState, useEffect, useMemo } from "react"
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
import { AlertCircle, CheckCircle2, Save, XCircle, RefreshCcw, Search, Check, ChevronDown } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const HR_URL = import.meta.env.VITE_HR_URL;
const PAGE_URL = import.meta.env.VITE_PAGE_URL;

export function NhapDon() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [trangThaiDon, setTrangThaiDon] = useState<"hop-le" | "xem-xet" | null>(null)
    const [xacNhan, setXacNhan] = useState({
        khach: false,
        don: false,
        giaoHang: false,
        thanhToan: false
    })

    // States for Page data
    const [pages, setPages] = useState<any[]>([]);
    const [loadingPages, setLoadingPages] = useState(false);
    const [selectedPage, setSelectedPage] = useState<string>("");
    const [pageSearch, setPageSearch] = useState("");
    const [isPageOpen, setIsPageOpen] = useState(false);

    // States for Sale employees
    const [saleEmployees, setSaleEmployees] = useState<any[]>([]);
    const [loadingSale, setLoadingSale] = useState(false);
    const [selectedSale, setSelectedSale] = useState<string>("");
    const [saleSearch, setSaleSearch] = useState("");
    const [isSaleOpen, setIsSaleOpen] = useState(false);

    // States for Marketing employees
    const [mktEmployees, setMktEmployees] = useState<any[]>([]);
    const [loadingMkt, setLoadingMkt] = useState(false);
    const [selectedMkt, setSelectedMkt] = useState<string>("");
    const [mktSearch, setMktSearch] = useState("");
    const [isMktOpen, setIsMktOpen] = useState(false);

    // Get user from localStorage
    const userJson = localStorage.getItem("user")
    const user = userJson ? JSON.parse(userJson) : null
    const userEmail = (user?.Email || user?.email || "").toString().toLowerCase().trim();
    const userName = user?.['Họ_và_tên'] || user?.['Họ và tên'] || user?.['Tên'] || ""
    const boPhan = user?.['Bộ_phận'] || user?.['Bộ phận'] || ""

    const loadPageData = async () => {
        setLoadingPages(true);
        setLoadingSale(true);
        setLoadingMkt(true);
        try {
            const hrRes = await fetch(HR_URL);
            const hrData = await hrRes.json();
            const hrList = Array.isArray(hrData) ? hrData : Object.values(hrData || {}).filter(i => i && typeof i === 'object');

            // 1a. Filter Sale employees immediately from the full list
            const saleList = hrList.filter((e: any) => {
                const dep = (e['Bộ_phận'] || e['Bộ phận'] || "").toString().trim().toLowerCase();
                return dep === 'sale' || dep === 'sales';
            });
            setSaleEmployees(saleList);

            // 1b. Filter MKT employees immediately from the full list
            const mktList = hrList.filter((e: any) => {
                const dep = (e['Bộ_phận'] || e['Bộ phận'] || "").toString().trim().toLowerCase();
                return dep === 'mkt' || dep === 'marketing';
            });
            setMktEmployees(mktList);

            // Auto-set defaults based on user's department
            if (boPhan) {
                const userDep = boPhan.toString().trim().toLowerCase();
                if ((userDep === 'sale' || userDep === 'sales') && !selectedSale) {
                    setSelectedSale(userName);
                }
                if ((userDep === 'mkt' || userDep === 'marketing') && !selectedMkt) {
                    setSelectedMkt(userName);
                }
            }

            const currentEmp = hrList.find((e: any) =>
                (e.Email || e.email || "").toString().toLowerCase().trim() === userEmail
            );

            // 2. Fetch all Pages
            const pageRes = await fetch(PAGE_URL);
            const pageData = await pageRes.json();
            const pageList = Object.values(pageData || {}).filter((p: any) => p && typeof p === 'object') as any[];

            // 3. Determine filtering logic
            if (userEmail === import.meta.env.VITE_ADMIN_MAIL) {
                setPages(pageList);
            } else if (currentEmp) {
                const viTri = (currentEmp['Vị_trí'] ?? currentEmp['Vị trí'] ?? '').toString().toLowerCase();
                const hoVaTen = (currentEmp['Họ_và_tên'] ?? currentEmp['Họ và tên'] ?? '').toString().trim();
                const team = (currentEmp['Team'] ?? '').toString().trim();
                const teamSM = (currentEmp['Team_Sale_mar'] ?? '').toString().trim();

                const isLeader = viTri.includes('leader');
                const allowedNames = new Set<string>();
                allowedNames.add(hoVaTen);

                if (isLeader) {
                    hrList.forEach((e: any) => {
                        const eTeam = (e['Team'] ?? '').toString().trim();
                        const eTeamSM = (e['Team_Sale_mar'] ?? '').toString().trim();
                        if ((team && eTeam === team) || (teamSM && eTeamSM === teamSM)) {
                            const eName = (e['Họ_và_tên'] ?? e['Họ và tên'] ?? '').toString().trim();
                            if (eName) allowedNames.add(eName);
                        }
                    });
                }

                const filtered = pageList.filter(p => {
                    const mktName = (p['Tên MKT'] || "").toString().trim();
                    return allowedNames.has(mktName);
                });
                setPages(filtered);
            } else {
                setPages([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu page/nhân sự:", error);
        } finally {
            setLoadingPages(false);
            setLoadingSale(false);
            setLoadingMkt(false);
        }
    };

    useEffect(() => {
        loadPageData();
    }, []);

    const filteredPages = useMemo(() => {
        if (!pageSearch) return pages;
        return pages.filter(p =>
            (p['Tên Page'] || "").toLowerCase().includes(pageSearch.toLowerCase())
        );
    }, [pages, pageSearch]);

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
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="ngay-len-don">Ngày lên đơn*</Label>
                                    </div>
                                    <DatePicker value={date} onChange={setDate} className="w-full text-left" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="nv-mkt">Nhân viên marketing</Label>
                                    </div>
                                    <Popover open={isMktOpen} onOpenChange={setIsMktOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isMktOpen}
                                                className="w-full justify-between h-9 font-normal border-input bg-background hover:bg-background px-3"
                                                disabled={loadingMkt}
                                            >
                                                {selectedMkt ? (
                                                    <span className="truncate">{selectedMkt}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">{loadingMkt ? "Đang tải..." : "Chọn nhân viên..."}</span>
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
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between h-5">
                                        <Label htmlFor="ten-page">Tên page*</Label>
                                        <button
                                            onClick={loadPageData}
                                            disabled={loadingPages}
                                            className="text-[10px] text-blue-600 flex items-center gap-1 hover:underline"
                                        >
                                            <RefreshCcw className={cn("w-3 h-3", loadingPages && "animate-spin")} />
                                            Làm mới
                                        </button>
                                    </div>
                                    <Popover open={isPageOpen} onOpenChange={setIsPageOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isPageOpen}
                                                className="w-full justify-between h-9 font-normal border-input bg-background hover:bg-background px-3"
                                                disabled={loadingPages}
                                            >
                                                {selectedPage ? (
                                                    <span className="truncate">{selectedPage}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">{loadingPages ? "Đang tải..." : "Chọn page..."}</span>
                                                )}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                            <div className="flex flex-col">
                                                <div className="flex items-center border-b px-3">
                                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                    <input
                                                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder="Tìm kiếm page..."
                                                        value={pageSearch}
                                                        onChange={(e) => setPageSearch(e.target.value)}
                                                    />
                                                </div>
                                                <div className="max-h-[300px] overflow-y-auto p-1">
                                                    {filteredPages.length === 0 ? (
                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                            Không tìm thấy page nào.
                                                        </div>
                                                    ) : (
                                                        filteredPages.map((p, idx) => {
                                                            const pageName = p['Tên Page'] || `Page ${idx}`;
                                                            const isSelected = selectedPage === pageName;
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={cn(
                                                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                                                        isSelected && "bg-accent/50 font-medium"
                                                                    )}
                                                                    onClick={() => {
                                                                        setSelectedPage(pageName);
                                                                        setIsPageOpen(false);
                                                                        setPageSearch("");
                                                                    }}
                                                                >
                                                                    <div className={cn(
                                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                                    )}>
                                                                        <Check className="h-3 w-3" />
                                                                    </div>
                                                                    <span className="truncate">{pageName}</span>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="phone">Phone*</Label>
                                    </div>
                                    <Input id="phone" placeholder="Số điện thoại..." />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="ten-kh">Tên*</Label>
                                    </div>
                                    <Input id="ten-kh" placeholder="Họ và tên khách hàng..." />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="add">Add*</Label>
                                    </div>
                                    <Input id="add" placeholder="Địa chỉ chi tiết..." />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label>Khu vực</Label>
                                    </div>
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
                                    <div className="flex items-center h-5">
                                        <Label>Loại tiền thanh toán</Label>
                                    </div>
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
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="city">City</Label>
                                    </div>
                                    <Input id="city" placeholder="Thành phố..." />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="state">State</Label>
                                    </div>
                                    <Input id="state" placeholder="Tỉnh/Bang..." />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="zipcode">Zipcode</Label>
                                    </div>
                                    <Input id="zipcode" placeholder="Mã bưu điện..." />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center h-5">
                                        <Label htmlFor="hinh-thuc">Hình thức thanh toán*</Label>
                                    </div>
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
                                        <div className="flex items-center h-5">
                                            <Label>Nhân viên Sale</Label>
                                        </div>
                                        <Popover open={isSaleOpen} onOpenChange={setIsSaleOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={isSaleOpen}
                                                    className="w-full justify-between h-9 font-normal border-input bg-background hover:bg-background px-3"
                                                    disabled={loadingSale}
                                                >
                                                    {selectedSale ? (
                                                        <span className="truncate">{selectedSale}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">{loadingSale ? "Đang tải..." : "Chọn nhân viên..."}</span>
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
                                    <div className="space-y-2">
                                        <div className="flex items-center h-5">
                                            <Label>Phân loại khách hàng</Label>
                                        </div>
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
                                        <div className="flex items-center h-5">
                                            <Label>Trạng thái đơn</Label>
                                        </div>
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
