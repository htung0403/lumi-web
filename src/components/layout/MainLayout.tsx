import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    ChevronsLeft,
    Menu,
    Bell,
    LayoutGrid,
    BarChart3,
    Users,
    ShoppingCart,
    Briefcase,
    DollarSign,
    Megaphone,
    User,
    Settings,
    LogOut,
    PlusCircle,
    ChevronDown,
    List
} from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import { useLocation, useNavigate } from "react-router-dom"
import { getAppPermissions, getModuleAccess } from "@/lib/auth-utils"

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar-collapsed")
        return saved ? JSON.parse(saved) : false
    })
    const [isHovered, setIsHovered] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    // Get user from localStorage
    const userJson = localStorage.getItem("user")
    const user = userJson ? JSON.parse(userJson) : null
    const userName = user?.['Họ_và_tên'] || user?.['Họ và tên'] || user?.['Tên'] || "Người dùng"
    const userInitials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    const userRole = (user?.['Vị_trí'] || user?.['Vị trí'] || user?.['Vi_tri'] || "Thành viên").toString()
    const userTeam = user?.['Team_Sale_mar'] || user?.['Team'] || ""

    // RBAC logic from shared utility
    const { isAdmin } = getAppPermissions(user);

    const handleLogout = () => {
        localStorage.removeItem("user")
        navigate("/login")
    }

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed))
    }, [isCollapsed])

    const effectiveCollapsed = isCollapsed && !isHovered

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar Container - its width determines the main content area */}
            <aside
                className={cn(
                    "transition-all duration-200 ease-in-out flex flex-col relative h-screen sticky top-0 z-20 shrink-0",
                    isCollapsed ? "w-16" : "w-64"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Visual Sidebar - handles the background and transition */}
                <div
                    className={cn(
                        "bg-card border-r flex flex-col h-full transition-all duration-200 ease-in-out shadow-sm",
                        isCollapsed ? (isHovered ? "w-64 absolute left-0 top-0 shadow-xl" : "w-16") : "w-full"
                    )}
                >
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center justify-center border-b px-4 shrink-0 overflow-hidden">
                        {effectiveCollapsed ? (
                            <div className="font-bold text-xl bg-[#2d7c2d] text-white min-w-8 h-8 rounded flex items-center justify-center">L</div>
                        ) : (
                            <div className="font-bold text-xl text-[#2d7c2d] whitespace-nowrap">Lumi Job</div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto scrollbar-hide">
                        <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="Tất cả" isCollapsed={effectiveCollapsed} path="/" active={location.pathname === "/"} />

                        {getModuleAccess('dashboard', user) && (
                            <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard báo cáo" isCollapsed={effectiveCollapsed} />
                        )}

                        {getModuleAccess('goals', user) && (
                            <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Mục tiêu" isCollapsed={effectiveCollapsed} />
                        )}

                        {getModuleAccess('crm', user) && (
                            <NavItem icon={<Users className="w-5 h-5" />} label="Quản lý CRM/CSKH" isCollapsed={effectiveCollapsed} />
                        )}

                        {(getModuleAccess('orders', user) || getModuleAccess('new-order', user)) && (
                            <NavGroup
                                icon={<ShoppingCart className="w-5 h-5" />}
                                label="Quản lý Sale & Order"
                                isCollapsed={effectiveCollapsed}
                                active={location.pathname === "/orders" || location.pathname === "/nhap-don"}
                            >
                                {getModuleAccess('orders', user) && (
                                    <NavItem
                                        icon={<List className="w-4 h-4" />}
                                        label="Danh sách đơn"
                                        isCollapsed={effectiveCollapsed}
                                        path="/orders"
                                        active={location.pathname === "/orders"}
                                        isSubItem
                                    />
                                )}
                                {getModuleAccess('new-order', user) && (
                                    <NavItem
                                        icon={<PlusCircle className="w-4 h-4" />}
                                        label="Nhập đơn mới"
                                        isCollapsed={effectiveCollapsed}
                                        path="/nhap-don"
                                        active={location.pathname === "/nhap-don"}
                                        isSubItem
                                    />
                                )}
                            </NavGroup>
                        )}

                        {getModuleAccess('hr', user) && (
                            <NavItem icon={<Briefcase className="w-5 h-5" />} label="Quản lý nhân sự" isCollapsed={effectiveCollapsed} path="/nhan-su" active={location.pathname === "/nhan-su"} />
                        )}

                        {getModuleAccess('finance', user) && (
                            <NavItem icon={<DollarSign className="w-5 h-5" />} label="Quản lý tài chính" isCollapsed={effectiveCollapsed} />
                        )}

                        {getModuleAccess('marketing', user) && (
                            <NavItem icon={<Megaphone className="w-5 h-5" />} label="Quản lý marketing" isCollapsed={effectiveCollapsed} />
                        )}

                        {isAdmin && (
                            <NavItem icon={<Settings className="w-5 h-5" />} label="Cài đặt hệ thống" isCollapsed={effectiveCollapsed} />
                        )}
                    </nav>

                    {/* Collapse Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-3 top-20 rounded-full border bg-background shadow-md h-6 w-6 z-[30] hidden md:flex hover:bg-[#2d7c2d] hover:text-white"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
                    </Button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">Dashboard</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* ... header right ... */}
                        <Button variant="ghost" size="icon">
                            <Bell className="w-5 h-5" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt={userName} />
                                        <AvatarFallback className="bg-[#2d7c2d]/10 text-[#2d7c2d] text-xs font-bold">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{userName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {userRole}{userTeam ? ` - ${userTeam}` : ''}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Hồ sơ</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Cài đặt</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

function NavItem({ icon, label, isCollapsed, active = false, path, isSubItem = false }: { icon: React.ReactNode, label: string, isCollapsed: boolean, active?: boolean, path?: string, isSubItem?: boolean }) {
    const navigate = useNavigate()
    return (
        <Button
            variant="ghost"
            className={cn(
                "w-full justify-start transition-all duration-200",
                active
                    ? "bg-[#2d7c2d]/10 text-[#2d7c2d] font-semibold border-r-2 border-[#2d7c2d] rounded-r-none"
                    : "text-muted-foreground hover:bg-[#2d7c2d]/5 hover:text-[#2d7c2d]",
                isCollapsed ? "px-0 h-10 w-10 mx-auto" : cn("px-4 h-11", isSubItem && "pl-11 h-10 text-[13px]")
            )}
            title={isCollapsed ? label : undefined}
            onClick={() => path && navigate(path)}
        >
            <div className={cn("flex items-center w-full", isCollapsed && "justify-center")}>
                <div className="shrink-0">{icon}</div>
                <span className={cn(
                    "ml-3 truncate transition-all duration-200",
                    isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                )}>
                    {label}
                </span>
            </div>
        </Button>
    )
}

function NavGroup({ icon, label, isCollapsed, active, children }: { icon: React.ReactNode, label: string, isCollapsed: boolean, active?: boolean, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(active)

    if (isCollapsed) {
        return (
            <div className="flex flex-col gap-1 items-center">
                <Button
                    variant="ghost"
                    className={cn(
                        "h-10 w-10 p-0 transition-all",
                        active ? "bg-[#2d7c2d]/10 text-[#2d7c2d]" : "text-muted-foreground"
                    )}
                    title={label}
                >
                    {icon}
                </Button>
            </div>
        )
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start h-11 px-4 transition-all duration-200",
                        active && !isOpen ? "bg-[#2d7c2d]/5 text-[#2d7c2d]" : "text-muted-foreground hover:bg-[#2d7c2d]/5 hover:text-[#2d7c2d]"
                    )}
                >
                    <div className="flex items-center w-full">
                        <div className="shrink-0">{icon}</div>
                        <span className={cn(
                            "ml-3 flex-1 text-left truncate transition-all duration-200",
                            isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                        )}>
                            {label}
                        </span>
                        {!isCollapsed && (
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 ml-1 shrink-0", isOpen && "rotate-180")} />
                        )}
                    </div>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-1 mt-1 transition-all">
                {children}
            </CollapsibleContent>
        </Collapsible>
    )
}
