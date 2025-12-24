import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
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
    Check,
    Settings2,
    Edit,
    Trash2
} from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"
import { useDebounce } from "@/hooks/use-debounce"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { Skeleton } from "@/components/ui/skeleton"

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
function parseSafeNumber(value: any): number {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return value;
    // Clean string: remove non-digit characters except for maybe the first dot/comma if we want decimals, 
    // but for VND we usually don't have decimals in the raw data strings.
    // If it's something like "1.200.000" or "1,200,000", we should remove all separators.
    const cleaned = String(value).replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

function formatCurrency(value: any) {
    const num = parseSafeNumber(value);
    if (num === 0) return '0 ₫';
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

const TABLE_COLUMNS = [
    { id: 'stt', label: 'STT' },
    { id: 'ma_don', label: 'Mã đơn hàng' },
    { id: 'tracking', label: 'Mã Tracking' },
    { id: 'ngay_len_don', label: 'Ngày lên đơn' },
    { id: 'name', label: 'Name*' },
    { id: 'sale', label: 'Nhân viên Sale' },
    { id: 'mkt', label: 'Nhân viên Marketing' },
    { id: 'van_don', label: 'NV Vận đơn' },
    { id: 'check', label: 'Kết quả Check' },
    { id: 'giao_hang', label: 'Trạng thái giao hàng NB' },
    { id: 'dvvc', label: 'Đơn vị vận chuyển' },
    { id: 'thu_tien', label: 'Trạng thái thu tiền' },
    { id: 'mat_hang', label: 'Mặt hàng' },
    { id: 'khu_vuc', label: 'Khu vực' },
    { id: 'tong_tien', label: 'Tổng tiền VNĐ' },
    { id: 'phi_ship', label: 'Phí ship' },
    { id: 'doi_soat', label: 'Tiền Việt đã đối soát' },
    { id: 'actions', label: 'Thao tác' },
];

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
                <Button variant="outline" size="sm" className="h-9 text-xs justify-between min-w-[170px]">
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

export function ChinhSuaDon() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allData, setAllData] = useState<F3Item[]>([]);

    // User/Auth State
    const [greeting, setGreeting] = useState("");
    const [currentEmployee, setCurrentEmployee] = useState<HRItem | null>(null);
    const [allowedStaffNames, setAllowedStaffNames] = useState<Set<string> | null>(null);
    const [currentBoPhan, setCurrentBoPhan] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
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

    // Column Visibility State - using different key than QuanLyOrder to include 'actions' by default
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        const saved = localStorage.getItem('edit-order-table-columns');
        return saved ? JSON.parse(saved) : TABLE_COLUMNS.map(c => c.id);
    });

    useEffect(() => {
        localStorage.setItem('edit-order-table-columns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const toggleColumn = (id: string) => {
        setVisibleColumns(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

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
                const userEmail = (currentUser['Email'] || currentUser['email'] || '').toString().trim().toLowerCase();

                // 1. Process Admin
                if (userEmail === 'admin@gmail.com') {
                    setCurrentEmployee(currentUser);
                    setCurrentBoPhan('Admin');
                    setGreeting(`Xin chào Admin - Toàn quyền hệ thống`);
                    setAllowedStaffNames(null);
                    // Skip HR for hardcoded admin
                } else {
                    const hrResponse = await fetchWithRetry(HR_URL);
                    const hrData = Array.isArray(hrResponse) ? hrResponse : Object.values(hrResponse || {}).filter(i => i && typeof i === 'object');

                    const foundEmployee = hrData.find((row: any) => {
                        const rowEmail = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
                        return rowEmail === userEmail;
                    });

                    if (foundEmployee) {
                        emp = foundEmployee as HRItem;
                        const viTri = (emp['Vị_trí'] ?? emp['Vị trí'] ?? emp['Vi_tri'] ?? emp['Position'] ?? '').toString().trim();
                        const team = (emp['Team'] ?? '').toString().trim();
                        const teamSaleMar = (emp['Team_Sale_mar'] ?? '').toString().trim();
                        const hoVaTen = (emp['Họ_và_tên'] ?? emp['Họ Và Tên'] ?? emp['Họ và tên'] ?? emp['Tên'] ?? emp['Name'] ?? '').toString().trim();
                        const bp = (emp['Bộ_phận'] ?? emp['Bộ phận'] ?? emp['Bo_phan'] ?? '').toString().trim();
                        const chiNhanh = (emp['chi_nhánh'] ?? emp['chi nhánh'] ?? emp['Chi_nhanh'] ?? '').toString().trim();

                        boPhan = (bp === 'CSKH') ? 'Sale' : bp;
                        setCurrentEmployee(emp);
                        setCurrentBoPhan(boPhan);
                        setGreeting(`Xin chào ${hoVaTen}${bp ? ` - ${bp}` : ''}`);

                        // Authorization Logic
                        const isLeader = /leader/i.test(viTri);
                        const namesSet = new Set<string>();

                        // Always add themselves
                        if (hoVaTen) namesSet.add(hoVaTen);

                        if (isLeader) {
                            hrData.forEach((e: any) => {
                                const eTeam = (e['Team'] ?? '').toString().trim();
                                const eTeamSaleMar = (e['Team_Sale_mar'] ?? '').toString().trim();
                                const eChiNhanh = (e['chi_nhánh'] ?? e['chi nhánh'] ?? e['Chi_nhanh'] ?? '').toString().trim();

                                const matchTeam = (team && eTeam === team) || (teamSaleMar && eTeamSaleMar === teamSaleMar);
                                const matchChiNhanh = viTri.includes('Sale Leader') && chiNhanh && eChiNhanh.toLowerCase() === chiNhanh.toLowerCase();

                                if (matchTeam || matchChiNhanh) {
                                    const name = (e['Họ_và_tên'] ?? e['Họ Và Tên'] ?? e['Họ và tên'] ?? e['Tên'] ?? e['Name'] ?? '').toString().trim();
                                    if (name) namesSet.add(name);
                                }
                            });
                        }
                        allowedNames = namesSet.size ? namesSet : null;
                    } else {
                        setGreeting(`Không tìm thấy Email: ${userEmail}`);
                    }
                }
            } else {
                // No user (should be handled by ProtectedRoute)
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

    // Apply Filters - Optimized with useMemo to avoid re-render waterfall
    const filteredData = useMemo(() => {
        if (!allData.length) return [];

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
            } else if (/leader/i.test(viTri)) {
                result = result.filter(row => {
                    let val = '';
                    if (currentBoPhan === 'Sale') val = String(getRowValue(row, 'Nhân_viên_Sale', 'Nhân viên Sale')).trim();
                    else if (currentBoPhan === 'MKT') val = String(getRowValue(row, 'Nhân_viên_Marketing', 'Nhân viên Marketing')).trim();
                    else if (['Vận Đơn', 'Vận Hành'].includes(currentBoPhan)) val = String(getRowValue(row, 'NV_Vận_đơn', 'NV Vận đơn')).trim();
                    return val && allowedStaffNames.has(val);
                });
            }
        }

        // 2. Search Term (Debounced)
        if (debouncedSearch) {
            const lowerTerms = debouncedSearch.toLowerCase();
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

        return result;
    }, [
        allData, debouncedSearch, startDate, endDate,
        filterNVSale, filterNVMarketing, filterNVVanDon, filterKetQuaCheck, filterTrangThaiGiaoHang,
        filterMatHang, filterKhuVuc, filterTrangThaiThuTien,
        currentEmployee, allowedStaffNames, currentBoPhan
    ]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, startDate, endDate, filterNVSale, filterNVMarketing, filterNVVanDon, filterKetQuaCheck, filterTrangThaiGiaoHang, filterMatHang, filterKhuVuc, filterTrangThaiThuTien]);

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
                totalAmount += parseSafeNumber(getRowValue(row, 'Tổng_tiền_VNĐ', 'Tổng tiền VNĐ', 'Tổng Tiền VNĐ', 'Tổng_tiền_VND', 'Tổng tiền'));
                totalShip += parseSafeNumber(getRowValue(row, 'Phí_ship', 'Phí ship'));
                totalDoiSoat += parseSafeNumber(getRowValue(row, 'Tiền_Việt_đã_đối_soát', 'Tiền Việt đã đối soát'));
            }
        });
        return { count, totalAmount, totalShip, totalDoiSoat };
    }, [filteredData]);

    // Excel Export
    const handleExport = () => {
        if (!filteredData.length) return;

        const activeCols = TABLE_COLUMNS.filter(c => visibleColumns.includes(c.id) && c.id !== 'actions');
        const headers = activeCols.map(c => c.label);

        const data = filteredData.map((row, idx) => {
            const rowData: any[] = [];
            activeCols.forEach(col => {
                switch (col.id) {
                    case 'stt': rowData.push(idx + 1); break;
                    case 'ma_don': rowData.push(getRowValue(row, 'Mã_đơn_hàng', 'Mã đơn hàng')); break;
                    case 'tracking': rowData.push(getRowValue(row, 'Mã_Tracking', 'Mã Tracking')); break;
                    case 'ngay_len_don': rowData.push(formatDate(getRowValue(row, 'Ngày_lên_đơn', 'Ngày lên đơn', 'Thời gian lên đơn'))); break;
                    case 'name': rowData.push(getRowValue(row, 'Name', 'Name*', 'Tên lên đơn')); break;
                    case 'sale': rowData.push(getRowValue(row, 'Nhân_viên_Sale', 'Nhân viên Sale')); break;
                    case 'mkt': rowData.push(getRowValue(row, 'Nhân_viên_Marketing', 'Nhân viên Marketing')); break;
                    case 'van_don': rowData.push(getRowValue(row, 'NV_Vận_đơn', 'NV Vận đơn')); break;
                    case 'check': rowData.push(getRowValue(row, 'Kết_quả_Check', 'Kết quả Check')); break;
                    case 'giao_hang': rowData.push(getRowValue(row, 'Trạng_thái_giao_hàng', 'Trạng thái giao hàng NB', 'Trạng thái giao hàng')); break;
                    case 'dvvc': rowData.push(getRowValue(row, 'Đơn_vị_vận_chuyển', 'Đơn vị vận chuyển')); break;
                    case 'thu_tien': rowData.push(getRowValue(row, 'Trạng_thái_thu_tiền', 'Trạng thái thu tiền')); break;
                    case 'mat_hang': rowData.push(getRowValue(row, 'Mặt_hàng', 'Mặt hàng')); break;
                    case 'khu_vuc': rowData.push(getRowValue(row, 'Khu_vực', 'Khu vực')); break;
                    case 'tong_tien': rowData.push(parseSafeNumber(getRowValue(row, 'Tổng_tiền_VNĐ', 'Tổng tiền VNĐ', 'Tổng Tiền VNĐ'))); break;
                    case 'phi_ship': rowData.push(parseSafeNumber(getRowValue(row, 'Phí_ship', 'Phí ship'))); break;
                    case 'doi_soat': rowData.push(parseSafeNumber(getRowValue(row, 'Tiền_Việt_đã_đối_soát', 'Tiền Việt đã đối soát'))); break;
                }
            });
            return rowData;
        });

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
                            Chỉnh sửa đơn hàng
                        </h1>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        Ẩn/Hiện cột
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2" align="end">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between px-2 py-1 mb-1 border-b">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">Cấu hình cột</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[10px] px-2"
                                                onClick={() => setVisibleColumns(TABLE_COLUMNS.map(c => c.id))}
                                            >
                                                Mặc định
                                            </Button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto px-1">
                                            {TABLE_COLUMNS.map(col => (
                                                <button
                                                    key={col.id}
                                                    onClick={() => toggleColumn(col.id)}
                                                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors text-left"
                                                >
                                                    <span>{col.label}</span>
                                                    {visibleColumns.includes(col.id) && (
                                                        <Check className="w-3 h-3 text-[#2d7c2d]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button variant="outline" size="sm" className="h-9" onClick={loadData} disabled={loading}>
                                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </Button>
                            <Button size="sm" className="h-9 bg-[#6c757d] hover:bg-[#5a6268]" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Xuất Excel
                            </Button>
                        </div>
                    </div>
                    {greeting && (
                        <div className="text-sm font-medium text-[#2d7c2d] mb-1">{greeting}</div>
                    )}
                    {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">{error}</div>}
                </div>

                {/* Stats */}
                <Card className="bg-[#e8f5e9] border-[#c8e6c9]">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tổng số đơn</p>
                                {loading ? <Skeleton className="h-7 w-20 mx-auto mt-1" /> : <p className="text-xl font-bold text-[#1b5e20]">{stats.count.toLocaleString()}</p>}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tổng tiền VNĐ</p>
                                {loading ? <Skeleton className="h-7 w-32 mx-auto mt-1" /> : <p className="text-xl font-bold text-[#1b5e20]">{formatCurrency(stats.totalAmount)}</p>}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tổng Phí ship</p>
                                {loading ? <Skeleton className="h-7 w-28 mx-auto mt-1" /> : <p className="text-xl font-bold text-[#1b5e20]">{formatCurrency(stats.totalShip)}</p>}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#2d7c2d] uppercase">Tiền Việt đã đối soát</p>
                                {loading ? <Skeleton className="h-7 w-32 mx-auto mt-1" /> : <p className="text-xl font-bold text-[#1b5e20]">{formatCurrency(stats.totalDoiSoat)}</p>}
                            </div>
                        </div>
                        <div className="mt-2 text-center text-xs text-muted-foreground border-t border-[#c8e6c9] pt-2">
                            {loading ? <Skeleton className="h-3 w-48 mx-auto" /> : `Hiển thị: ${filteredData.length.toLocaleString()} / ${allData.length.toLocaleString()} bản ghi`}
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
                                placeholder="NV Sale"
                                value={filterNVSale}
                                onChange={setFilterNVSale}
                                options={optionsNVSale}
                                visible={!currentEmployee || !allowedStaffNames || /leader/i.test(currentEmployee?.['Vị_trí'] || currentEmployee?.['Vị trí'] || '') || (currentBoPhan === 'Sale' || !currentBoPhan)}
                            />
                            <MultiSelectFilter
                                placeholder="NV Marketing"
                                value={filterNVMarketing}
                                onChange={setFilterNVMarketing}
                                options={optionsNVMarketing}
                                visible={!currentEmployee || !allowedStaffNames || /leader/i.test(currentEmployee?.['Vị_trí'] || currentEmployee?.['Vị trí'] || '') || (currentBoPhan === 'MKT' || !currentBoPhan)}
                            />
                            <MultiSelectFilter
                                placeholder="NV Vận đơn"
                                value={filterNVVanDon}
                                onChange={setFilterNVVanDon}
                                options={optionsNVVanDon}
                                visible={!currentEmployee || !allowedStaffNames || /leader/i.test(currentEmployee?.['Vị_trí'] || currentEmployee?.['Vị trí'] || '') || (['Vận Đơn', 'Vận Hành'].includes(currentBoPhan || '') || !currentBoPhan)}
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

                {/* Table Section */}
                {loading ? (
                    <SkeletonTable columns={visibleColumns.length} rows={10} />
                ) : (
                    <div className="rounded-md border bg-card">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[#2d7c2d] hover:bg-[#2d7c2d]">
                                        {TABLE_COLUMNS.filter(c => visibleColumns.includes(c.id)).map((head) => (
                                            <TableHead
                                                key={head.id}
                                                className={cn(
                                                    "text-white whitespace-nowrap h-10 py-1 font-bold text-[11px] text-center",
                                                    head.id === 'actions' && "sticky right-0 bg-[#2d7c2d] z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.15)] border-l-2 border-[#1e5c1e]"
                                                )}
                                            >
                                                {head.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-muted-foreground">
                                                Không có dữ liệu.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pagedData.map((row, index) => {
                                            const globalIdx = (currentPage - 1) * pageSize + index + 1;
                                            const checkStatus = getRowValue(row, 'Kết_quả_Check', 'Kết quả Check') || '';
                                            let badgeVar: "default" | "secondary" | "destructive" | "outline" = "outline";
                                            if (checkStatus.toLowerCase().includes('ok')) badgeVar = "default";

                                            const checkStatusLower = checkStatus.toLowerCase();
                                            let badgeClass = "";
                                            if (checkStatusLower.includes('ok')) badgeClass = "bg-[#c8e6c9] text-[#2e7d32] hover:bg-[#c8e6c9] border-none text-[10px] px-1.5 py-0";
                                            else if (checkStatusLower.includes('hủy') || checkStatusLower.includes('huy')) badgeClass = "bg-[#ffcdd2] text-[#c62828] hover:bg-[#ffcdd2] border-none text-[10px] px-1.5 py-0";
                                            else if (checkStatus) badgeClass = "bg-[#fff9c4] text-[#f57f17] hover:bg-[#fff9c4] border-none text-[10px] px-1.5 py-0";

                                            return (
                                                <TableRow key={index} className="hover:bg-[#eff5fb] text-xs group">
                                                    {visibleColumns.includes('stt') && <TableCell className="text-center font-medium">{globalIdx}</TableCell>}
                                                    {visibleColumns.includes('ma_don') && <TableCell>{getRowValue(row, 'Mã_đơn_hàng', 'Mã đơn hàng')}</TableCell>}
                                                    {visibleColumns.includes('tracking') && <TableCell>{getRowValue(row, 'Mã_Tracking', 'Mã Tracking')}</TableCell>}
                                                    {visibleColumns.includes('ngay_len_don') && <TableCell>{formatDate(getRowValue(row, 'Ngày_lên_đơn', 'Ngày lên đơn', 'Thời gian lên đơn'))}</TableCell>}
                                                    {visibleColumns.includes('name') && <TableCell>{getRowValue(row, 'Name', 'Name*', 'Tên lên đơn')}</TableCell>}
                                                    {visibleColumns.includes('sale') && <TableCell>{getRowValue(row, 'Nhân_viên_Sale', 'Nhân viên Sale')}</TableCell>}
                                                    {visibleColumns.includes('mkt') && <TableCell>{getRowValue(row, 'Nhân_viên_Marketing', 'Nhân viên Marketing')}</TableCell>}
                                                    {visibleColumns.includes('van_don') && <TableCell>{getRowValue(row, 'NV_Vận_đơn', 'NV Vận đơn')}</TableCell>}
                                                    {visibleColumns.includes('check') && (
                                                        <TableCell>
                                                            {checkStatus && <Badge variant={badgeVar} className={badgeClass}>{checkStatus}</Badge>}
                                                        </TableCell>
                                                    )}
                                                    {visibleColumns.includes('giao_hang') && <TableCell>{getRowValue(row, 'Trạng_thái_giao_hàng', 'Trạng thái giao hàng NB', 'Trạng thái giao hàng')}</TableCell>}
                                                    {visibleColumns.includes('dvvc') && <TableCell>{getRowValue(row, 'Đơn_vị_vận_chuyển', 'Đơn vị vận chuyển')}</TableCell>}
                                                    {visibleColumns.includes('thu_tien') && <TableCell>{getRowValue(row, 'Trạng_thái_thu_tiền', 'Trạng thái thu tiền')}</TableCell>}
                                                    {visibleColumns.includes('mat_hang') && <TableCell>{getRowValue(row, 'Mặt_hàng', 'Mặt hàng')}</TableCell>}
                                                    {visibleColumns.includes('khu_vuc') && <TableCell>{getRowValue(row, 'Khu_vực', 'Khu vực')}</TableCell>}
                                                    {visibleColumns.includes('tong_tien') && <TableCell className="text-right font-medium">{formatCurrency(getRowValue(row, 'Tổng_tiền_VNĐ', 'Tổng tiền VNĐ', 'Tổng Tiền VNĐ'))}</TableCell>}
                                                    {visibleColumns.includes('phi_ship') && <TableCell className="text-right">{formatCurrency(getRowValue(row, 'Phí_ship', 'Phí ship'))}</TableCell>}
                                                    {visibleColumns.includes('doi_soat') && <TableCell className="text-right">{formatCurrency(getRowValue(row, 'Tiền_Việt_đã_đối_soát', 'Tiền Việt đã đối soát'))}</TableCell>}
                                                    {visibleColumns.includes('actions') && (
                                                        <TableCell className="sticky right-0 bg-[#f8fafc] group-hover:bg-[#f1f5f9] shadow-[-6px_0_12px_rgba(0,0,0,0.08)] border-l-2 border-slate-200 py-1 px-2 z-10">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 transition-colors border border-transparent hover:border-blue-200"
                                                                    onClick={() => {
                                                                        const orderId = getRowValue(row, 'Mã_đơn_hàng', 'Mã đơn hàng');
                                                                        if (orderId) {
                                                                            navigate(`/don-hang/${encodeURIComponent(orderId)}`);
                                                                        }
                                                                    }}
                                                                    title="Sửa đơn hàng"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100/50 transition-colors border border-transparent hover:border-red-200"
                                                                    onClick={() => {
                                                                        const orderId = getRowValue(row, 'Mã_đơn_hàng', 'Mã đơn hàng');
                                                                        console.log('Delete order:', orderId);
                                                                        // TODO: Confirm and delete
                                                                    }}
                                                                    title="Xóa đơn hàng"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
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
                )}
            </div>
        </MainLayout>
    )
}
