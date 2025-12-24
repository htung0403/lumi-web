import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Search,
    RefreshCcw,
    Download,
    User,
    MoreHorizontal,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Building2,
    Target,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    Clock
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import * as XLSX from 'xlsx'
import { cn } from "@/lib/utils"

interface Employee {
    id: string;
    avatarUrl: string;
    bo_phan: string;
    cccd: string;
    chi_nhanh: string;
    email: string;
    gioi_tinh: string;
    ho_va_ten: string;
    ngay_cap: string;
    ngay_vao_lam: number;
    noi_cap: string;
    que_quan: string;
    sđt: string;
    tinh_trang_hon_nhan: string;
    trang_thai: string;
    vi_tri: string;
}

const EMPLOYEES_URL = import.meta.env.VITE_EMPLOYEES_BASE_URL;

function excelDateToJSDate(serial: number) {
    if (!serial || isNaN(serial)) return null;
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date;
}

function formatDate(date: Date | null) {
    if (!date) return "---";
    return date.toLocaleDateString("vi-VN");
}

export function QuanLyNhanSu() {
    const navigate = useNavigate();
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [greeting, setGreeting] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBoPhan, setFilterBoPhan] = useState<string>("all");
    const [filterChiNhanh, setFilterChiNhanh] = useState<string>("all");
    const [filterTrangThai, setFilterTrangThai] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(EMPLOYEES_URL);
            if (!response.ok) throw new Error("Không thể tải dữ liệu nhân sự");
            const data = await response.json();

            if (data) {
                const dataArray = Object.entries(data).map(([id, value]) => ({
                    id,
                    ...(value as any)
                }));
                setAllEmployees(dataArray);

                const userJson = localStorage.getItem("user");
                if (userJson) {
                    const user = JSON.parse(userJson);
                    setGreeting(`Xin chào ${user['Họ_và_tên'] || 'Người dùng'} - Đang xem dữ liệu nhân sự`);
                }
            } else {
                setAllEmployees([]);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredEmployees = useMemo(() => {
        return allEmployees.filter(emp => {
            const matchesSearch =
                emp.ho_va_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.sđt?.includes(searchTerm);

            const matchesBoPhan = filterBoPhan === "all" || emp.bo_phan === filterBoPhan;
            const matchesChiNhanh = filterChiNhanh === "all" || emp.chi_nhanh === filterChiNhanh;
            const matchesTrangThai = filterTrangThai === "all" || emp.trang_thai === filterTrangThai;

            return matchesSearch && matchesBoPhan && matchesChiNhanh && matchesTrangThai;
        });
    }, [allEmployees, searchTerm, filterBoPhan, filterChiNhanh, filterTrangThai]);

    const departments = useMemo(() =>
        Array.from(new Set(allEmployees.map(e => e.bo_phan).filter(Boolean))),
        [allEmployees]);

    const branches = useMemo(() =>
        Array.from(new Set(allEmployees.map(e => e.chi_nhanh).filter(Boolean))),
        [allEmployees]);

    const statuses = useMemo(() =>
        Array.from(new Set(allEmployees.map(e => e.trang_thai).filter(Boolean))),
        [allEmployees]);

    const stats = useMemo(() => {
        const active = allEmployees.filter(e => {
            const status = (e.trang_thai || "").toLowerCase();
            return status.includes("chính thức") || status === "" || status.includes("đang làm việc");
        }).length;

        const probation = allEmployees.filter(e =>
            (e.trang_thai || "").toLowerCase().includes("thử việc")
        ).length;

        return {
            total: allEmployees.length,
            active, // This map to "Đang làm việc"
            probation,
            filtered: filteredEmployees.length
        };
    }, [allEmployees, filteredEmployees]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredEmployees.length / pageSize);
    const pagedEmployees = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEmployees.slice(start, start + pageSize);
    }, [filteredEmployees, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterBoPhan, filterChiNhanh, filterTrangThai]);

    const handleExport = () => {
        if (!filteredEmployees.length) return;

        const data = filteredEmployees.map((emp, idx) => ({
            "STT": idx + 1,
            "Họ và tên": emp.ho_va_ten,
            "Email": emp.email,
            "Số điện thoại": emp.sđt,
            "Giới tính": emp.gioi_tinh,
            "Vị trí": emp.vi_tri,
            "Bộ phận": emp.bo_phan,
            "Chi nhánh": emp.chi_nhanh,
            "Ngày vào làm": formatDate(excelDateToJSDate(emp.ngay_vao_lam)),
            "Quê quán": emp.que_quan,
            "Tình trạng hôn nhân": emp.tinh_trang_hon_nhan,
            "Trạng thái": emp.trang_thai
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Nhan_Su");
        XLSX.writeFile(wb, `Danh_sach_nhan_su_${new Date().getTime()}.xlsx`);
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#2d7c2d] flex items-center gap-2">
                            <Building2 className="w-6 h-6" />
                            Quản lý nhân sự
                        </h1>
                        {greeting && (
                            <p className="text-sm text-[#2d7c2d] font-medium">{greeting}</p>
                        )}
                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200 mt-2">{error}</div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                            Làm mới
                        </Button>
                        <Button size="sm" className="bg-[#6c757d] hover:bg-[#5a6268]" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Xuất Excel
                        </Button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#e8f5e9] border-[#c8e6c9]">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg border">
                                <User className="w-5 h-5 text-[#2d7c2d]" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tổng nhân viên</p>
                                <p className="text-xl font-bold text-[#1b5e20]">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg border">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-blue-600 uppercase">Đang làm việc</p>
                                <p className="text-xl font-bold text-blue-800">{stats.active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg border">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-orange-600 uppercase">Đang thử việc</p>
                                <p className="text-xl font-bold text-orange-800">{stats.probation}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg border">
                                <Target className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-purple-600 uppercase">Kết quả lọc</p>
                                <p className="text-xl font-bold text-purple-800">{stats.filtered}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[240px]">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Tìm kiếm</label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm theo tên, email, sđt..."
                                        className="pl-9 h-9 text-xs"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="w-[180px]">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Bộ phận</label>
                                <Select value={filterBoPhan} onValueChange={setFilterBoPhan}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Tất cả bộ phận" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả bộ phận</SelectItem>
                                        {departments.map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-[180px]">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Chi nhánh</label>
                                <Select value={filterChiNhanh} onValueChange={setFilterChiNhanh}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Tất cả chi nhánh" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                                        {branches.map(branch => (
                                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-[150px]">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Trạng thái</label>
                                <Select value={filterTrangThai} onValueChange={setFilterTrangThai}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        {statuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {(searchTerm || filterBoPhan !== 'all' || filterChiNhanh !== 'all' || filterTrangThai !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterBoPhan("all");
                                        setFilterChiNhanh("all");
                                        setFilterTrangThai("all");
                                    }}
                                >
                                    Xóa lọc
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#2d7c2d] hover:bg-[#2d7c2d]">
                                    <TableHead className="text-white w-[50px] text-center font-bold text-[11px]">STT</TableHead>
                                    <TableHead className="text-white font-bold text-[11px]">Nhân viên</TableHead>
                                    <TableHead className="text-white font-bold text-[11px]">Liên hệ</TableHead>
                                    <TableHead className="text-white font-bold text-[11px]">Vị trí / Bộ phận</TableHead>
                                    <TableHead className="text-white font-bold text-[11px]">Chi nhánh</TableHead>
                                    <TableHead className="text-white font-bold text-[11px]">Ngày vào làm</TableHead>
                                    <TableHead className="text-white font-bold text-[11px]">Trạng thái</TableHead>
                                    <TableHead className="text-white font-bold text-[11px] text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCcw className="w-8 h-8 text-[#2d7c2d] animate-spin" />
                                                <p className="text-sm text-muted-foreground font-medium">Đang tải dữ liệu nhân viên...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-8 h-8 text-muted-foreground opacity-20" />
                                                <p className="text-sm text-muted-foreground">Không tìm thấy nhân viên nào phù hợp.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagedEmployees.map((emp, idx) => (
                                        <TableRow key={emp.id} className="hover:bg-[#eff5fb] group">
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {(currentPage - 1) * pageSize + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border shadow-sm group-hover:border-primary transition-colors">
                                                        <AvatarImage src={emp.avatarUrl} />
                                                        <AvatarFallback className="bg-muted text-xs font-bold uppercase">
                                                            {emp.ho_va_ten?.split(' ').slice(-1)[0]?.substring(0, 1)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-foreground leading-tight">{emp.ho_va_ten}</span>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Badge variant="outline" className="text-[10px] h-4 px-1 leading-none font-medium border-slate-200 bg-slate-50">
                                                                {emp.gioi_tinh}
                                                            </Badge>
                                                            {emp.tinh_trang_hon_nhan && (
                                                                <span className="text-[10px] text-muted-foreground">{emp.tinh_trang_hon_nhan}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>{emp.sđt || "---"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                                                        <span className="truncate max-w-[150px]">{emp.email || "---"}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{emp.vi_tri || "---"}</span>
                                                    <span className="text-xs text-muted-foreground">{emp.bo_phan}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                                                    <span>{emp.chi_nhanh || "---"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                                    <span>{formatDate(excelDateToJSDate(emp.ngay_vao_lam))}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "text-[10px] px-2 py-0 h-5 border-none",
                                                        emp.trang_thai?.toLowerCase().includes("thử việc") ? "bg-[#fff9c4] text-[#f57f17]" :
                                                            emp.trang_thai?.toLowerCase().includes("chính thức") ? "bg-[#c8e6c9] text-[#2e7d32]" :
                                                                "bg-slate-100 text-slate-600"
                                                    )}
                                                >
                                                    {emp.trang_thai || "Đang làm việc"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/[0.08] hover:text-primary">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-40 p-1" align="end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start text-xs font-medium h-8"
                                                            onClick={() => navigate(`/nhan-su/${emp.id}`)}
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start text-xs font-medium h-8"
                                                            onClick={() => navigate(`/nhan-su/${emp.id}`, { state: { edit: true } })}
                                                        >
                                                            Chỉnh sửa
                                                        </Button>
                                                        <div className="h-px bg-muted my-1" />
                                                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-medium h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                            Nghỉ việc
                                                        </Button>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Số dòng/trang:</span>
                            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1) }}>
                                <SelectTrigger className="w-[80px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="ml-2">
                                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredEmployees.length)} trong tổng số {filteredEmployees.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </Button>

                            <div className="flex items-center px-4 h-8 bg-muted/50 rounded-md text-xs font-medium">
                                Trang {currentPage} / {totalPages || 1}
                            </div>

                            <Button
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Sau
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    )
}
