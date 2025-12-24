import React, { useState } from "react"
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
    Shield,
    Check,
    Edit
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

interface AppItem {
    id: string;
    permId?: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    path: string;
    alwaysVisible?: boolean;
    adminOnly?: boolean;
}

interface MenuSection {
    title: string;
    apps: AppItem[];
}

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

    const SECTIONS: MenuSection[] = [
        {
            title: 'Phân tích & Báo cáo',
            apps: [
                { id: 'dashboard', label: 'Dashboard báo cáo', icon: <BarChart3 className="w-6 h-6" />, color: 'bg-orange-500', path: '#' },
            ]
        },
        {
            title: 'Khách hàng & CRM',
            apps: [
                { id: 'crm', label: 'Quản lý CRM/CSKH', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500', path: '#' },
            ]
        },
        {
            title: 'Quản lý Sale & Order',
            apps: [
                { id: 'orders', label: 'Danh sách đơn', icon: <List className="w-6 h-6" />, color: 'bg-indigo-500', path: '/orders' },
                { id: 'orders_edit', permId: 'orders', label: 'Chỉnh sửa đơn', icon: <Edit className="w-6 h-6" />, color: 'bg-sky-500', path: '/chinh-sua-don' },
                { id: 'new-order', label: 'Nhập đơn mới', icon: <PlusCircle className="w-6 h-6" />, color: 'bg-violet-500', path: '/nhap-don' },
            ]
        },
        {
            title: 'Quản lý Nhân sự',
            apps: [
                { id: 'hr', label: 'Quản lý nhân sự', icon: <Briefcase className="w-6 h-6" />, color: 'bg-pink-500', path: '/nhan-su' },
            ]
        },
        {
            title: 'Quản lý Tài chính',
            apps: [
                { id: 'finance', label: 'Quản lý tài chính', icon: <DollarSign className="w-6 h-6" />, color: 'bg-purple-500', path: '#' },
            ]
        },
        {
            title: 'Marketing',
            apps: [
                { id: 'marketing', label: 'Quản lý marketing', icon: <Megaphone className="w-6 h-6" />, color: 'bg-rose-500', path: '#' },
            ]
        },
        {
            title: 'Hệ thống',
            apps: [
                { id: 'settings', label: 'Cài đặt hệ thống', icon: <Settings className="w-6 h-6" />, color: 'bg-slate-500', path: '#', adminOnly: true },
            ]
        }
    ]

    const filteredSections = SECTIONS.map(section => ({
        ...section,
        apps: section.apps.filter(app => {
            if (app.alwaysVisible) return true;
            if (app.adminOnly) return isAdmin;
            return getModuleAccess(app.permId || app.id, user);
        })
    })).filter(section => section.apps.length > 0);

    return (
        <MainLayout>
            <div className="w-full mx-auto space-y-6 pb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#2d7c2d]/10 p-2 rounded-xl">
                        <LayoutGrid className="w-6 h-6 text-[#2d7c2d]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Menu chức năng</h1>
                    </div>
                </div>

                {filteredSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">{section.title}</h2>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {section.apps.map((app) => (
                                <div key={app.id} className="relative group">
                                    <button
                                        onClick={() => app.path !== '#' && navigate(app.path)}
                                        className="w-full flex items-center p-3 rounded-xl border bg-card hover:shadow-md hover:border-[#2d7c2d]/50 hover:bg-[#2d7c2d]/[0.02] transition-all duration-200 gap-3 group/btn text-left"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white transition-all duration-200 group-hover/btn:scale-105 shadow-sm",
                                            app.color
                                        )}>
                                            {app.icon && typeof app.icon === 'object' && 'props' in app.icon ?
                                                // @ts-ignore
                                                React.cloneElement(app.icon, { className: "w-5 h-5" }) :
                                                app.icon
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[13px] font-semibold text-foreground group-hover/btn:text-[#2d7c2d] transition-colors block truncate">
                                                {app.label}
                                            </span>
                                            <p className="text-[10px] text-muted-foreground truncate opacity-70">
                                                {app.path === '#' ? 'Sắp ra mắt' : 'Mở ứng dụng'}
                                            </p>
                                        </div>
                                    </button>

                                    {isAdmin && !app.alwaysVisible && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:bg-[#2d7c2d] hover:text-white"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-3 rounded-xl shadow-2xl border-border/50" side="top" align="center">
                                                <div className="space-y-2">
                                                    <div className="px-1">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Thiết lập quyền</p>
                                                        <p className="text-sm font-bold text-foreground truncate">{app.label}</p>
                                                    </div>
                                                    <div className="h-px bg-border/50 my-2" />
                                                    <div className="space-y-1">
                                                        {BLOCKS.map(block => {
                                                            const permId = app.permId || app.id;
                                                            return (
                                                                <button
                                                                    key={block.id}
                                                                    onClick={() => togglePermission(permId, block.id)}
                                                                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg hover:bg-[#2d7c2d]/5 transition-colors text-left group/item"
                                                                >
                                                                    <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">{block.label}</span>
                                                                    {(permissions[permId] || []).includes(block.id) && (
                                                                        <div className="w-5 h-5 rounded-full bg-[#2d7c2d]/10 flex items-center justify-center">
                                                                            <Check className="w-3 h-3 text-[#2d7c2d]" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="mt-3 p-2.5 bg-muted/30 rounded-lg border border-border/50">
                                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                                            * Phân quyền cho <strong>{app.permId || app.id}</strong>. Nếu không chọn mục nào, hệ thống sử dụng mặc định.
                                                        </p>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    )
}

