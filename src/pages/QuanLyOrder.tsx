import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Search,
    RefreshCcw,
    Download,
    ChevronDown,
    Check
} from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

// Types
interface F3Item {
    [key: string]: any
}

interface HRItem {
    [key: string]: any
}

// Constants
const F3_URL = import.meta.env.VITE_F3_URL;
const HR_URL = import.meta.env.VITE_HR_URL;

// Helpers
function formatCurrency(value: any) {
    if (!value) return '0 ₫';
    const num = Number(value);
    const rounded = Math.round(num / 1000) * 1000;
    return rounded.toLocaleString('vi-VN') + ' ₫';
}

function formatDate(dateStr: any) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return dateStr;
    }
}

function getRowValue(row: F3Item, ...columnNames: string[]) {
    for (const colName of columnNames) {
        if (row[colName] !== undefined && row[colName] !== null && row[colName] !== '') {
            return row[colName];
        }
    }
    return '';
}

// Helper for Dropdown Select
// Multi-Select Filter Component
const MultiSelectFilter = ({
    value, onChange, options, placeholder, visible = true
}: { value: string[], onChange: (v: string[]) => void, options: string[], placeholder: string, visible?: boolean }) => {
    const [search, setSearch] = useState("")

    if (!visible) return null;

    const filteredOptions = options.filter(opt =>
        (opt || 'Trống').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs justify-between min-w-[200px]">
                    <span className="truncate max-w-[150px]">
                        {value.length === 0 ? placeholder : `${placeholder} (${value.length})`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm..."
                            className="h-8 pl-7 text-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-2 border-b flex items-center justify-between bg-muted/30">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">Đã chọn: {value.length}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onChange([])}
                    >
                        Xóa hết
                    </Button>
                </div>
                <div className="max-h-[250px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <div className="py-4 text-center text-xs text-muted-foreground">Không tìm thấy</div>
                    ) : (
                        filteredOptions.map(opt => {
                            const val = opt || '__EMPTY__';
                            const label = opt || 'Trống';
                            const isSelected = value.includes(val);
                            return (
                                <div
                                    key={val}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent transition-colors",
                                        isSelected && "bg-accent/50"
                                    )}
                                    onClick={() => {
                                        if (isSelected) {
                                            onChange(value.filter(v => v !== val));
                                        } else {
                                            onChange([...value, val]);
                                        }
                                    }}
                                >
                                    <div className={cn(
                                        "w-4 h-4 border rounded flex items-center justify-center transition-colors shrink-0",
                                        isSelected ? "bg-[#2d7c2d] border-[#2d7c2d]" : "bg-white border-gray-300"
                                    )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="truncate text-xs">{label}</span>
                                </div>
                            )
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export function QuanLyOrder() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allData, setAllData] = useState<F3Item[]>([]);
    const [filteredData, setFilteredData] = useState<F3Item[]>([]);

    // User/Auth State
    const [greeting, setGreeting] = useState("");
    const [currentEmployee, setCurrentEmployee] = useState<HRItem | null>(null);
    const [allowedStaffNames, setAllowedStaffNames] = useState<Set<string> | null>(null);
    const [currentBoPhan, setCurrentBoPhan] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    // const [selectedMonth, setSelectedMonth] = useState("all"); // Removed unused

    // Dropdown Filter States
    const [filterNVSale, setFilterNVSale] = useState<string[]>([]);
    const [filterNVMarketing, setFilterNVMarketing] = useState<string[]>([]);
    const [filterNVVanDon, setFilterNVVanDon] = useState<string[]>([]);
    const [filterKetQuaCheck, setFilterKetQuaCheck] = useState<string[]>([]);
    const [filterTrangThaiGiaoHang, setFilterTrangThaiGiaoHang] = useState<string[]>([]);
    const [filterMatHang, setFilterMatHang] = useState<string[]>([]);
    const [filterKhuVuc, setFilterKhuVuc] = useState<string[]>([]);
    const [filterTrangThaiThuTien, setFilterTrangThaiThuTien] = useState<string[]>([]);

    // Options for dropdowns (populated dynamically)
    const [optionsNVSale, setOptionsNVSale] = useState<string[]>([]);
    const [optionsNVMarketing, setOptionsNVMarketing] = useState<string[]>([]);
    const [optionsNVVanDon, setOptionsNVVanDon] = useState<string[]>([]);
    const [optionsKetQuaCheck, setOptionsKetQuaCheck] = useState<string[]>([]);
    const [optionsTrangThaiGiaoHang, setOptionsTrangThaiGiaoHang] = useState<string[]>([]);
    const [optionsMatHang, setOptionsMatHang] = useState<string[]>([]);
    const [optionsKhuVuc, setOptionsKhuVuc] = useState<string[]>([]);
    const [optionsTrangThaiThuTien, setOptionsTrangThaiThuTien] = useState<string[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);

    // Quick Filter Active State - DateRangePicker handles this internally now
    // const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

    // Fetch Logic
    const fetchWithRetry = async (url: string, retries = 3, delayMs = 500) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Process Auth Data from localStorage
            const userJson = localStorage.getItem("user");
            const currentUser = userJson ? JSON.parse(userJson) : null;

            let allowedNames: Set<string> | null = null;
            let emp: HRItem | null = null;
            let boPhan: string | null = null;

            if (currentUser) {
                const hrResponse = await fetchWithRetry(HR_URL);
                const hrData = Array.isArray(hrResponse) ? hrResponse : Object.values(hrResponse || {}).filter(i => i && typeof i === 'object');

                // Get Email from currentUser object
                const userEmail = (currentUser['Email'] || currentUser['email'] || '').toString().trim().toLowerCase();

                const foundEmployee = hrData.find((row: any) => {
                    const rowEmail = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
                    return rowEmail === userEmail;
                });

                if (foundEmployee) {
                    emp = foundEmployee as HRItem;
                    const viTri = (emp['Vị_trí'] ?? emp['Vị trí'] ?? emp['Vi_tri'] ?? emp['Position'] ?? '').toString().trim();
                    const team = (emp['Team'] ?? '').toString().trim();
                    const hoVaTen = (emp['Họ_và_tên'] ?? emp['Họ Và Tên'] ?? emp['Họ và tên'] ?? emp['Tên'] ?? emp['Name'] ?? '').toString().trim();
                    const bp = (emp['Bộ_phận'] ?? emp['Bộ phận'] ?? emp['Bo_phan'] ?? '').toString().trim();
                    const chiNhanh = (emp['chi_nhánh'] ?? emp['chi nhánh'] ?? emp['Chi_nhanh'] ?? '').toString().trim();

                    boPhan = (bp === 'CSKH') ? 'Sale' : bp;
                    setCurrentEmployee(emp);
                    setCurrentBoPhan(boPhan);
                    setGreeting(`Xin chào ${hoVaTen}${bp ? ` - ${bp}` : ''}`);

                    // Authorization Logic
                    const isSaleLeader = viTri === 'Sale Leader';
                    const isLeader = /leader/i.test(viTri) && !isSaleLeader;

                    const set = new Set<string>();
                    if (isSaleLeader && chiNhanh) {
                        hrData.forEach((e: any) => {
                            const eCN = (e['chi_nhánh'] ?? e['chi nhánh'] ?? e['Chi_nhanh'] ?? '').toString().trim();
                            if (eCN.toLowerCase() === chiNhanh.toLowerCase()) {
                                const name = (e['Họ_và_tên'] ?? e['Họ Và Tên'] ?? e['Tên'] ?? e['Name'] ?? '').toString().trim();
                                if (name) set.add(name);
                            }
                        });
                    } else if (isLeader) {
                        hrData.forEach((e: any) => {
                            const eTeam = (e['Team'] ?? '').toString().trim();
                            if (eTeam === team && eTeam && eTeam !== 'Đã nghỉ') {
                                const name = (e['Họ_và_tên'] ?? e['Họ Và Tên'] ?? e['Họ và tên'] ?? e['Tên'] ?? e['Name'] ?? '').toString().trim();
                                if (name) set.add(name);
                            }
                        });
                    } else {
                        if (hoVaTen) set.add(hoVaTen);
                    }
                    allowedNames = set.size ? set : null;
                } else {
                    setGreeting(`Không tìm thấy Email: ${userEmail}`);
                }
            } else {
                // Admin mode or no ID
            }
            setAllowedStaffNames(allowedNames);

            // 2. Fetch F3 Data
            const f3Response = await fetchWithRetry(F3_URL);
            let rawData: F3Item[] = [];
            if (Array.isArray(f3Response)) {
                rawData = f3Response.filter(item => item && typeof item === 'object');
            } else if (typeof f3Response === 'object' && f3Response !== null) {
                rawData = Object.values(f3Response).filter(item => item && typeof item === 'object') as F3Item[];
            }
            setAllData(rawData);

            // 3. Populate Filters
            populateFilterOptions(rawData, allowedNames, boPhan, emp);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const populateFilterOptions = (data: F3Item[], allowedNames: Set<string> | null, boPhan: string | null, emp: HRItem | null) => {
        const extractOptions = (fieldVariants: string[], checkAuth = false, authBoPhan = '') => {
            const values = new Set<string>();
            data.forEach(row => {
                const val = getRowValue(row, ...fieldVariants);
                if (val) {
                    const sVal = String(val).trim();
                    if (checkAuth && allowedNames && emp) {
                        // If this dropdown corresponds to the user's department, restrict options
                        const isMatchingBoPhan = boPhan && authBoPhan && (authBoPhan === boPhan || (authBoPhan === 'Vận Đơn' && boPhan === 'Vận Hành'));
                        if (isMatchingBoPhan) {
                            if (allowedNames.has(sVal)) values.add(sVal);
                        } else {
                            // Non-matching department: if limited view, maybe hide or show? Logic says show all or empty logic handled in filter
                            // Original code: if limited and NOT matching department -> hide dropdown visually.
                            // Here we'll just add it, but the UI might hide it.
                            values.add(sVal);
                        }
                    } else {
                        values.add(sVal);
                    }
                }
            });
            return Array.from(values).sort();
        }

        setOptionsNVSale(extractOptions(['Nhân_viên_Sale', 'Nhân viên Sale'], true, 'Sale'));
        setOptionsNVMarketing(extractOptions(['Nhân_viên_Marketing', 'Nhân viên Marketing'], true, 'MKT'));
        setOptionsNVVanDon(extractOptions(['NV_Vận_đơn', 'NV Vận đơn'], true, 'Vận Đơn'));
        setOptionsKetQuaCheck(extractOptions(['Kết_quả_Check', 'Kết quả Check']));
        setOptionsTrangThaiGiaoHang(extractOptions(['Trạng_thái_giao_hàng', 'Trạng thái giao hàng NB', 'Trạng thái giao hàng']));
        setOptionsMatHang(extractOptions(['Mặt_hàng', 'Mặt hàng']));
        setOptionsKhuVuc(extractOptions(['Khu_vực', 'Khu vực']));
        setOptionsTrangThaiThuTien(extractOptions(['Trạng_thái_thu_tiền', 'Trạng thái thu tiền']));

        // Auto-select if NV
        if (emp && allowedNames && boPhan) {
            const viTri = String(emp['Vị trí'] || '').trim();
            const hoVaTen = String(emp['Họ và tên'] || emp['Họ Và Tên'] || '').trim();
            if ((viTri === 'NV' || viTri === '') && hoVaTen) {
                if (boPhan === 'Sale') setFilterNVSale([hoVaTen]);
                if (boPhan === 'MKT') setFilterNVMarketing([hoVaTen]);
                if ((boPhan === 'Vận Đơn' || boPhan === 'Vận Hành')) setFilterNVVanDon([hoVaTen]);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [searchParams]);

    // Apply Filters
    useEffect(() => {
        if (!allData.length) return;

        let result = allData;

        // 1. Auth/Permission Filter (Highest Priority)
        if (currentEmployee && allowedStaffNames && currentBoPhan) {
            const viTri = String(currentEmployee['Vị_trí'] ?? currentEmployee['Vị trí'] ?? '').trim();
            const hoVaTen = String(currentEmployee['Họ_và_tên'] ?? currentEmployee['Họ Và Tên'] ?? '').trim();

            if (viTri === 'NV' || viTri === '') {
                result = result.filter(row => {
                    if (currentBoPhan === 'Sale') return String(getRowValue(row, 'Nhân_viên_Sale', 'Nhân viên Sale')).trim() === hoVaTen;
                    if (currentBoPhan === 'MKT') return String(getRowValue(row, 'Nhân_viên_Marketing', 'Nhân viên Marketing')).trim() === hoVaTen;
                    if ((currentBoPhan === 'Vận Đơn' || currentBoPhan === 'Vận Hành')) return String(getRowValue(row, 'NV_Vận_đơn', 'NV Vận đơn')).trim() === hoVaTen;
                    return false;
                });
            } else if (['Leader', 'Sale Leader'].includes(viTri)) {
                result = result.filter(row => {
                    let val = '';
                    if (currentBoPhan === 'Sale') val = String(getRowValue(row, 'Nhân_viên_Sale', 'Nhân viên Sale')).trim();
                    if (currentBoPhan === 'MKT') val = String(getRowValue(row, 'Nhân_viên_Marketing', 'Nhân viên Marketing')).trim();
                    if ((currentBoPhan === 'Vận Đơn' || currentBoPhan === 'Vận Hành')) val = String(getRowValue(row, 'NV_Vận_đơn', 'NV Vận đơn')).trim();
                    return val && allowedStaffNames.has(val);
                });
            }
        }

        // 2. Search Term
        if (searchTerm) {
            const lowerTerms = searchTerm.toLowerCase();
            result = result.filter(row => {
                const text = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
                return text.includes(lowerTerms);
            });
        }

        // 3. Date Filter
        if (startDate || endDate) {
            result = result.filter(row => {
                const dStr = getRowValue(row, 'Ngày_lên_đơn', 'Ngày lên đơn', 'Thời gian lên đơn');
                if (!dStr) return false;
                try {
                    const d = new Date(dStr);
                    if (isNaN(d.getTime())) return false;

                    if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        if (d < start) return false;
                    }
                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        if (d > end) return false;
                    }
                    return true;
                } catch { return false; }
            });
        }

        // 4. Dropdown Filters (NOW ALL MULTI-SELECT)
        const applyMultiDropdown = (selected: string[], ...fields: string[]) => {
            if (selected.length > 0) {
                result = result.filter(row => {
                    const v = String(getRowValue(row, ...fields)).trim() || '__EMPTY__';
                    return selected.includes(v);
                });
            }
        }

        applyMultiDropdown(filterNVSale, 'Nhân_viên_Sale', 'Nhân viên Sale');
        applyMultiDropdown(filterNVMarketing, 'Nhân_viên_Marketing', 'Nhân viên Marketing');
        applyMultiDropdown(filterNVVanDon, 'NV_Vận_đơn', 'NV Vận đơn');
        applyMultiDropdown(filterKetQuaCheck, 'Kết_quả_Check', 'Kết quả Check');
        applyMultiDropdown(filterTrangThaiGiaoHang, 'Trạng_thái_giao_hàng', 'Trạng thái giao hàng NB', 'Trạng thái giao hàng');
        applyMultiDropdown(filterMatHang, 'Mặt_hàng', 'Mặt hàng');
        applyMultiDropdown(filterKhuVuc, 'Khu_vực', 'Khu vực');
        applyMultiDropdown(filterTrangThaiThuTien, 'Trạng_thái_thu_tiền', 'Trạng thái thu tiền');

        setFilteredData(result);
        setCurrentPage(1); // Reset pagination on filter change
    }, [
        allData, searchTerm, startDate, endDate,
        filterNVSale, filterNVMarketing, filterNVVanDon, filterKetQuaCheck, filterTrangThaiGiaoHang,
        filterMatHang, filterKhuVuc, filterTrangThaiThuTien,
        currentEmployee, allowedStaffNames, currentBoPhan
    ]);

    // Stats Calculation
    const stats = useMemo(() => {
        const uniqueOrders = new Set();
        let totalAmount = 0;
        let totalShip = 0;
        let totalDoiSoat = 0;
        let count = 0;

        filteredData.forEach(row => {
            const code = String(getRowValue(row, 'Mã_đơn_hàng', 'Mã đơn hàng') || '').trim();
            if (code && !uniqueOrders.has(code)) {
                uniqueOrders.add(code);
                count++;
                totalAmount += Number(getRowValue(row, 'Tổng_tiền_VNĐ', 'Tổng tiền VNĐ', 'Tổng Tiền VNĐ', 'Tổng_tiền_VND', 'Tổng tiền') || 0);
                totalShip += Number(getRowValue(row, 'Phí_ship', 'Phí ship') || 0);
                totalDoiSoat += Number(getRowValue(row, 'Tiền_Việt_đã_đối_soát', 'Tiền Việt đã đối soát') || 0);
            }
        });
        return { count, totalAmount, totalShip, totalDoiSoat };
    }, [filteredData]);

    // Excel Export
    const handleExport = () => {
        if (!filteredData.length) return;

        const headers = [
            'STT', 'Mã đơn hàng', 'Mã Tracking', 'Ngày lên đơn', 'Name*',
            'Nhân viên Sale', 'Nhân viên Marketing', 'NV Vận đơn', 'Kết quả Check',
            'Trạng thái giao hàng NB', 'Đơn vị vận chuyển', 'Trạng thái thu tiền',
            'Mặt hàng', 'Khu vực', 'Tổng tiền VNĐ', 'Phí ship', 'Tiền Việt đã đối soát'
        ];

        const data = filteredData.map((row, idx) => [
            idx + 1,
            getRowValue(row, 'Mã_đơn_hàng', 'Mã đơn hàng'),
            getRowValue(row, 'Mã_Tracking', 'Mã Tracking'),
            formatDate(getRowValue(row, 'Ngày_lên_đơn', 'Ngày lên đơn', 'Thời gian lên đơn')),
            getRowValue(row, 'Name', 'Name*', 'Tên lên đơn'),
            getRowValue(row, 'Nhân_viên_Sale', 'Nhân viên Sale'),
            getRowValue(row, 'Nhân_viên_Marketing', 'Nhân viên Marketing'),
            getRowValue(row, 'NV_Vận_đơn', 'NV Vận đơn'),
            getRowValue(row, 'Kết_quả_Check', 'Kết quả Check'),
            getRowValue(row, 'Trạng_thái_giao_hàng', 'Trạng thái giao hàng NB', 'Trạng thái giao hàng'),
            getRowValue(row, 'Đơn_vị_vận_chuyển', 'Đơn vị vận chuyển'),
            getRowValue(row, 'Trạng_thái_thu_tiền', 'Trạng thái thu tiền'),
            getRowValue(row, 'Mặt_hàng', 'Mặt hàng'),
            getRowValue(row, 'Khu_vực', 'Khu vực'),
            Number(getRowValue(row, 'Tổng_tiền_VNĐ', 'Tổng tiền VNĐ', 'Tổng Tiền VNĐ') || 0),
            Number(getRowValue(row, 'Phí_ship', 'Phí ship') || 0),
            Number(getRowValue(row, 'Tiền_Việt_đã_đối_soát', 'Tiền Việt đã đối soát') || 0)
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "F3_Data");
        const now = new Date();
        const fname = `F3_Data_${now.getTime()}.xlsx`;
        XLSX.writeFile(wb, fname);
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <MainLayout>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold tracking-tight text-[#2d7c2d] flex items-center gap-2">
                            Dữ liệu F3 - Xem toàn bộ
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={loadData} disabled={loading}>
                                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </Button>
                            <Button className="bg-[#6c757d] hover:bg-[#5a6268]" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Xuất Excel
                            </Button>
                        </div>
                    </div>
                    {greeting && (
                        <div className="text-sm font-medium text-[#2d7c2d]">{greeting}</div>
                    )}
                    {loading && <div className="text-sm text-muted-foreground">Đang tải dữ liệu...</div>}
                    {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">{error}</div>}
                </div>

                {/* Stats */}
                <Card className="bg-[#e8f5e9] border-[#c8e6c9]">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tổng số đơn</p>
                                <p className="text-xl font-bold text-[#1b5e20]">{stats.count.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tổng tiền VNĐ</p>
                                <p className="text-xl font-bold text-[#1b5e20]">{formatCurrency(stats.totalAmount)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tổng Phí ship</p>
                                <p className="text-xl font-bold text-[#1b5e20]">{formatCurrency(stats.totalShip)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tiền Việt đã đối soát</p>
                                <p className="text-xl font-bold text-[#1b5e20]">{formatCurrency(stats.totalDoiSoat)}</p>
                            </div>
                        </div>
                        <div className="mt-2 text-center text-xs text-muted-foreground border-t border-[#c8e6c9] pt-2">
                            Hiển thị: {filteredData.length.toLocaleString()} / {allData.length.toLocaleString()} bản ghi
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {/* Search & Date */}
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[300px]">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm trong tất cả các cột..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <DateRangePicker
                                    onUpdate={(values) => {
                                        if (values.range.from) {
                                            const startStr = values.range.from.toISOString().split('T')[0];
                                            setStartDate(startStr);
                                            // Handle 'to' date
                                            if (values.range.to) {
                                                const endStr = values.range.to.toISOString().split('T')[0];
                                                setEndDate(endStr);
                                            } else {
                                                // If to is undefined, maybe just set to start or leave open?
                                                // Logic in filter expects endDate to act as <=.
                                                // If user selects single day range, to is same as from.
                                                setEndDate(startStr);
                                            }
                                        } else {
                                            setStartDate("");
                                            setEndDate("");
                                        }
                                    }}
                                    initialDateFrom={startDate || undefined}
                                    initialDateTo={endDate || undefined}
                                    align="start"
                                    showCompare={false}
                                />
                            </div>
                        </div>

                        {/* Dropdowns */}
                        <div className="flex flex-wrap gap-2">
                            <MultiSelectFilter
                                placeholder="Nhân viên Sale"
                                value={filterNVSale}
                                onChange={setFilterNVSale}
                                options={optionsNVSale}
                                visible={!currentEmployee || !allowedStaffNames || (currentBoPhan === 'Sale' || !currentBoPhan)}
                            />
                            <MultiSelectFilter
                                placeholder="Marketing"
                                value={filterNVMarketing}
                                onChange={setFilterNVMarketing}
                                options={optionsNVMarketing}
                                visible={!currentEmployee || !allowedStaffNames || (currentBoPhan === 'MKT' || !currentBoPhan)}
                            />
                            <MultiSelectFilter
                                placeholder="NV Vận đơn"
                                value={filterNVVanDon}
                                onChange={setFilterNVVanDon}
                                options={optionsNVVanDon}
                                visible={!currentEmployee || !allowedStaffNames || (['Vận Đơn', 'Vận Hành'].includes(currentBoPhan || '') || !currentBoPhan)}
                            />
                            <MultiSelectFilter
                                placeholder="Kết quả Check"
                                value={filterKetQuaCheck}
                                onChange={setFilterKetQuaCheck}
                                options={optionsKetQuaCheck}
                            />
                            <MultiSelectFilter
                                placeholder="Trạng thái GH"
                                value={filterTrangThaiGiaoHang}
                                onChange={setFilterTrangThaiGiaoHang}
                                options={optionsTrangThaiGiaoHang}
                            />
                            <MultiSelectFilter
                                placeholder="Sản phẩm"
                                value={filterMatHang}
                                onChange={setFilterMatHang}
                                options={optionsMatHang}
                            />
                            <MultiSelectFilter
                                placeholder="Thị trường"
                                value={filterKhuVuc}
                                onChange={setFilterKhuVuc}
                                options={optionsKhuVuc}
                            />
                            <MultiSelectFilter
                                placeholder="Trạng thái thu tiền"
                                value={filterTrangThaiThuTien}
                                onChange={setFilterTrangThaiThuTien}
                                options={optionsTrangThaiThuTien}
                            />
                        </div>


                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#2d7c2d] hover:bg-[#2d7c2d]">
                                    {['STT', 'Mã đơn hàng', 'Mã Tracking', 'Ngày lên đơn', 'Name*', 'Nhân viên Sale', 'Nhân viên Marketing', 'NV Vận đơn', 'Kết quả Check', 'Trạng thái giao hàng NB', 'Đơn vị vận chuyển', 'Trạng thái thu tiền', 'Mặt hàng', 'Khu vực', 'Tổng tiền VNĐ', 'Phí ship', 'Tiền Việt đã đối soát'].map((head, i) => (
                                        <TableHead key={i} className="text-white whitespace-nowrap h-10 py-1 font-bold text-[11px]">
                                            {head}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={17} className="text-center py-8 text-muted-foreground">
                                            Không có dữ liệu.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagedData.map((row, index) => {
                                        const globalIdx = (currentPage - 1) * pageSize + index + 1;
                                        const checkStatus = getRowValue(row, 'Kết_quả_Check', 'Kết quả Check') || '';
                                        let badgeVar: "default" | "secondary" | "destructive" | "outline" = "outline";
                                        if (checkStatus.toLowerCase().includes('ok')) badgeVar = "default"; // green-ish usually but default is black/primary
                                        // We might need custom colors for badges to match original
                                        const checkStatusLower = checkStatus.toLowerCase();
                                        let badgeClass = "";
                                        if (checkStatusLower.includes('ok')) badgeClass = "bg-[#c8e6c9] text-[#2e7d32] hover:bg-[#c8e6c9] border-none text-[10px] px-1.5 py-0";
                                        else if (checkStatusLower.includes('hủy') || checkStatusLower.includes('huy')) badgeClass = "bg-[#ffcdd2] text-[#c62828] hover:bg-[#ffcdd2] border-none text-[10px] px-1.5 py-0";
                                        else if (checkStatus) badgeClass = "bg-[#fff9c4] text-[#f57f17] hover:bg-[#fff9c4] border-none text-[10px] px-1.5 py-0";

                                        return (
                                            <TableRow key={index} className="hover:bg-[#eff5fb] text-xs">
                                                <TableCell className="text-center font-medium">{globalIdx}</TableCell>
                                                <TableCell>{getRowValue(row, 'Mã_đơn_hàng', 'Mã đơn hàng')}</TableCell>
                                                <TableCell>{getRowValue(row, 'Mã_Tracking', 'Mã Tracking')}</TableCell>
                                                <TableCell>{formatDate(getRowValue(row, 'Ngày_lên_đơn', 'Ngày lên đơn', 'Thời gian lên đơn'))}</TableCell>
                                                <TableCell>{getRowValue(row, 'Name', 'Name*', 'Tên lên đơn')}</TableCell>
                                                <TableCell>{getRowValue(row, 'Nhân_viên_Sale', 'Nhân viên Sale')}</TableCell>
                                                <TableCell>{getRowValue(row, 'Nhân_viên_Marketing', 'Nhân viên Marketing')}</TableCell>
                                                <TableCell>{getRowValue(row, 'NV_Vận_đơn', 'NV Vận đơn')}</TableCell>
                                                <TableCell>
                                                    {checkStatus && <Badge variant={badgeVar} className={badgeClass}>{checkStatus}</Badge>}
                                                </TableCell>
                                                <TableCell>{getRowValue(row, 'Trạng_thái_giao_hàng', 'Trạng thái giao hàng NB', 'Trạng thái giao hàng')}</TableCell>
                                                <TableCell>{getRowValue(row, 'Đơn_vị_vận_chuyển', 'Đơn vị vận chuyển')}</TableCell>
                                                <TableCell>{getRowValue(row, 'Trạng_thái_thu_tiền', 'Trạng thái thu tiền')}</TableCell>
                                                <TableCell>{getRowValue(row, 'Mặt_hàng', 'Mặt hàng')}</TableCell>
                                                <TableCell>{getRowValue(row, 'Khu_vực', 'Khu vực')}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(getRowValue(row, 'Tổng_tiền_VNĐ', 'Tổng tiền VNĐ', 'Tổng Tiền VNĐ'))}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(getRowValue(row, 'Phí_ship', 'Phí ship'))}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(getRowValue(row, 'Tiền_Việt_đã_đối_soát', 'Tiền Việt đã đối soát'))}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Số dòng/trang:</span>
                            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1) }}>
                                <SelectTrigger className="w-[70px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="200">200</SelectItem>
                                    <SelectItem value="500">500</SelectItem>
                                </SelectContent>
                            </Select>
                            <span>Trang {currentPage} / {totalPages || 1}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>Đầu</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Trước</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sau</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Cuối</Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
