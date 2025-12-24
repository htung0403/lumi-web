import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowLeft,
    Save,
    Edit2,
    User,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Calendar,
    MapPin,
    CreditCard,
    Heart,
    RefreshCcw,
    Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

const EMPLOYEES_BASE_URL = "https://lumi-6dff7-default-rtdb.asia-southeast1.firebasedatabase.app/employees";

export function ChiTietNhanSu() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEdit, setIsEdit] = useState(location.state?.edit || false);
    const [formData, setFormData] = useState<Partial<Employee>>({});

    useEffect(() => {
        const fetchEmployee = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await fetch(`${EMPLOYEES_BASE_URL}/${id}.json`);
                if (!response.ok) throw new Error("Không thể tải thông tin nhân viên");
                const data = await response.json();
                if (data) {
                    const emp = { id, ...data };
                    setEmployee(emp);
                    setFormData(emp);
                } else {
                    toast.error("Không tìm thấy nhân viên");
                    navigate("/nhan-su");
                }
            } catch (error) {
                console.error(error);
                toast.error("Lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id, navigate]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            // Remove id from payload as it's the key
            const { id: _, ...payload } = formData as any;
            const response = await fetch(`${EMPLOYEES_BASE_URL}/${id}.json`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Cập nhật thất bại");

            setEmployee({ ...employee, ...formData } as Employee);
            setIsEdit(false);
            toast.success("Cập nhật thông tin thành công");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lưu dữ liệu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <RefreshCcw className="w-8 h-8 text-[#2d7c2d] animate-spin" />
                    <p className="text-muted-foreground">Đang tải hồ sơ nhân viên...</p>
                </div>
            </MainLayout>
        );
    }

    if (!employee) return null;

    const InfoRow = ({ icon: Icon, label, value, field, type = "text" }: { icon: any, label: string, value: any, field: keyof Employee, type?: string }) => {
        if (isEdit) {
            return (
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-muted-foreground">{label}</Label>
                    <div className="relative">
                        <Icon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9 h-9 text-sm"
                            type={type}
                            value={formData[field] || ""}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        />
                    </div>
                </div>
            )
        }
        return (
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-white rounded-md border shadow-sm">
                    <Icon className="w-4 h-4 text-[#2d7c2d]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">{label}</span>
                    <span className="text-sm font-medium text-slate-700">{value || "---"}</span>
                </div>
            </div>
        );
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 max-w-5xl mx-auto">
                {/* Top Nav */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/nhan-su")} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </Button>
                    <div className="flex items-center gap-2">
                        {!isEdit ? (
                            <Button size="sm" onClick={() => setIsEdit(true)} className="bg-[#2d7c2d] hover:bg-[#236123]">
                                <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa hồ sơ
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => {
                                    setIsEdit(false);
                                    setFormData(employee);
                                }}>
                                    Hủy bỏ
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#2d7c2d] hover:bg-[#236123]">
                                    {saving ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Lưu thay đổi
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Profile Card */}
                    <Card className="md:col-span-1 h-fit">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="relative group flex flex-col items-center w-full">
                                <Avatar className="w-32 h-32 border-4 border-slate-100 shadow-xl group-hover:border-[#2d7c2d]/20 transition-all">
                                    <AvatarImage src={formData.avatarUrl || employee.avatarUrl} />
                                    <AvatarFallback className="text-3xl font-bold bg-slate-100 text-[#2d7c2d]">
                                        {employee.ho_va_ten?.split(' ').slice(-1)[0]?.substring(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                {isEdit && (
                                    <div className="mt-4 space-y-2 w-full max-w-[200px]">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">URL Ảnh đại diện</Label>
                                        <Input
                                            className="h-8 text-[10px] text-center"
                                            placeholder="Dán link ảnh tại đây..."
                                            value={formData.avatarUrl || ""}
                                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-1">
                                <h1 className="text-xl font-bold text-slate-800">{employee.ho_va_ten}</h1>
                                <p className="text-sm font-medium text-[#2d7c2d]">{employee.vi_tri || "Nhân viên"}</p>
                            </div>

                            <div className="mt-6 w-full space-y-3">
                                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-dashed">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Trạng thái</span>
                                    <Badge className={cn(
                                        "text-[10px] h-5 border-none",
                                        employee.trang_thai?.toLowerCase().includes("thử việc") ? "bg-[#fff9c4] text-[#f57f17]" :
                                            employee.trang_thai?.toLowerCase().includes("chính thức") ? "bg-[#c8e6c9] text-[#2e7d32]" :
                                                "bg-slate-100 text-slate-600"
                                    )}>
                                        {employee.trang_thai || "Đang làm việc"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-dashed">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Giới tính</span>
                                    <span className="text-xs font-bold text-slate-700">{employee.gioi_tinh || "---"}</span>
                                </div>
                            </div>

                            {isEdit && (
                                <div className="mt-8 border-t pt-4 w-full">
                                    <Button variant="ghost" size="sm" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4 mr-2" /> Xóa tài khoản
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Form Tabs/Sections */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Công việc Section */}
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 text-slate-800">
                                    <Briefcase className="w-4 h-4 text-[#2d7c2d]" /> Thông tin công việc
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoRow icon={Briefcase} label="Vị trí" value={employee.vi_tri} field="vi_tri" />
                                <InfoRow icon={Building2} label="Bộ phận" value={employee.bo_phan} field="bo_phan" />
                                <InfoRow icon={MapPin} label="Chi nhánh" value={employee.chi_nhanh} field="chi_nhanh" />
                                {isEdit ? (
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground">Trạng thái</Label>
                                        <Select
                                            value={formData.trang_thai || ""}
                                            onValueChange={(v) => setFormData({ ...formData, trang_thai: v })}
                                        >
                                            <SelectTrigger className="h-9 text-sm">
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="THỬ VIỆC">THỬ VIỆC</SelectItem>
                                                <SelectItem value="CHÍNH THỨC">CHÍNH THỨC</SelectItem>
                                                <SelectItem value="NGHỈ VIỆC">NGHỈ VIỆC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <InfoRow icon={User} label="Trạng thái" value={employee.trang_thai} field="trang_thai" />
                                )}
                            </CardContent>
                        </Card>

                        {/* Liên hệ Section */}
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 text-slate-800">
                                    <Phone className="w-4 h-4 text-blue-600" /> Liên lạc & Cá nhân
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoRow icon={Phone} label="Số điện thoại" value={employee.sđt} field="sđt" />
                                <InfoRow icon={Mail} label="Email cá nhân" value={employee.email} field="email" type="email" />
                                <InfoRow icon={MapPin} label="Quê quán" value={employee.que_quan} field="que_quan" />
                                <InfoRow icon={Heart} label="Hôn nhân" value={employee.tinh_trang_hon_nhan} field="tinh_trang_hon_nhan" />
                            </CardContent>
                        </Card>

                        {/* Pháp lý Section */}
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 text-slate-800">
                                    <CreditCard className="w-4 h-4 text-orange-600" /> Hồ sơ pháp lý
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoRow icon={CreditCard} label="Số CCCD" value={employee.cccd} field="cccd" />
                                <InfoRow icon={Calendar} label="Ngày cấp" value={employee.ngay_cap} field="ngay_cap" />
                                <div className="sm:col-span-2">
                                    <InfoRow icon={MapPin} label="Nơi cấp" value={employee.noi_cap} field="noi_cap" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
