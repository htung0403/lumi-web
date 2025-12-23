import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    LayoutGrid,
    BarChart3,
    Users,
    Briefcase,
    DollarSign,
    Megaphone,
    Settings,
    List,
    PlusCircle,
    Target,
    Shield,
    Check
} from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { getAppPermissions, getModuleAccess } from "@/lib/auth-utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const BLOCKS = [
    { id: 'CEO', label: 'Khối CEO (Sếp)' },
    { id: 'CSKH', label: 'Khối CSKH' },
    { id: 'SaleOrder', label: 'Khối Sale & Vận đơn' },
    { id: 'HR', label: 'Khối HR & Nhân sự' },
    { id: 'KeToan', label: 'Khối Tài chính/Kế toán' },
    { id: 'MKT', label: 'Khối Marketing' },
];

export function Menu() {
    const navigate = useNavigate()
    const [permissions, setPermissions] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem('module_permissions');
        return saved ? JSON.parse(saved) : {};
    });

    const userJson = localStorage.getItem("user")
    const user = userJson ? JSON.parse(userJson) : null
    const { isAdmin } = getAppPermissions(user)

    const togglePermission = (moduleId: string, blockId: string) => {
        setPermissions(prev => {
            const current = prev[moduleId] || [];
            const updated = current.includes(blockId)
                ? current.filter(id => id !== blockId)
                : [...current, blockId];

            const newPerms = { ...prev, [moduleId]: updated };
            localStorage.setItem('module_permissions', JSON.stringify(newPerms));
            return newPerms;
        });
    };

    const apps = [
        { id: 'dashboard', label: 'Tổng quan', icon: <LayoutGrid className="w-6 h-6" />, color: 'bg-emerald-500', path: '/' },
        { id: 'reports', label: 'Dashboard báo cáo', icon: <BarChart3 className="w-6 h-6" />, color: 'bg-orange-500', path: '#' },
        { id: 'goals', label: 'Mục tiêu', icon: <Target className="w-6 h-6" />, color: 'bg-amber-500', path: '#' },
        { id: 'crm', label: 'Khách hàng (CRM)', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500', path: '#' },
        { id: 'orders', label: 'Danh sách đơn', icon: <List className="w-6 h-6" />, color: 'bg-indigo-500', path: '/orders' },
        { id: 'new-order', label: 'Nhập đơn mới', icon: <PlusCircle className="w-6 h-6" />, color: 'bg-violet-500', path: '/nhap-don' },
        { id: 'hr', label: 'Nhân viên (HR)', icon: <Briefcase className="w-6 h-6" />, color: 'bg-pink-500', path: '#' },
        { id: 'finance', label: 'Tài chính', icon: <DollarSign className="w-6 h-6" />, color: 'bg-purple-500', path: '#' },
        { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-6 h-6" />, color: 'bg-rose-500', path: '#' },
        { id: 'settings', label: 'Cài đặt', icon: <Settings className="w-6 h-6" />, color: 'bg-slate-500', path: '#' },
    ].filter(app => getModuleAccess(app.id, user))

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-muted p-1.5 rounded-lg">
                        <LayoutGrid className="w-5 h-5 text-muted-foreground mr-0" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">
                        Tất cả ứng dụng <span className="text-muted-foreground font-normal ml-2 text-sm">({apps.length} ứng dụng)</span>
                    </h1>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {apps.map((app) => (
                        <div key={app.id} className="relative group max-w-[140px]">
                            <button
                                onClick={() => app.path !== '#' && navigate(app.path)}
                                className="w-full flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary transition-all duration-200 gap-3 aspect-square"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-110 shadow-sm",
                                    app.color
                                )}>
                                    {app.icon}
                                </div>
                                <span className="text-[11px] font-medium text-center leading-tight">
                                    {app.label}
                                </span>
                            </button>

                            {isAdmin && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-primary hover:text-white"
                                        >
                                            <Shield className="w-3.5 h-3.5" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-2" side="right" align="start">
                                        <div className="space-y-1">
                                            <p className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                Quyền truy cập: {app.label}
                                            </p>
                                            <div className="h-px bg-border my-1" />
                                            {BLOCKS.map(block => (
                                                <button
                                                    key={block.id}
                                                    onClick={() => togglePermission(app.id, block.id)}
                                                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors text-left"
                                                >
                                                    <span>{block.label}</span>
                                                    {(permissions[app.id] || []).includes(block.id) && (
                                                        <Check className="w-3 h-3 text-primary" />
                                                    )}
                                                </button>
                                            ))}
                                            <p className="px-2 py-1.5 text-[10px] text-muted-foreground bg-muted/50 rounded italic">
                                                * Nếu không chọn mục nào, hệ thống sẽ sử dụng phân quyền mặc định.
                                            </p>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    )
}
