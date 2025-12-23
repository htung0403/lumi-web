export interface UserData {
    Email?: string;
    email?: string;
    Vị_trí?: string;
    'Vị trí'?: string;
    Vi_tri?: string;
    Bộ_phận?: string;
    'Bộ phận'?: string;
    Bo_phan?: string;
    [key: string]: any;
}

export function getModuleAccess(moduleKey: string, user: UserData | null): boolean {
    if (!user) return false;

    const userRole = (user['Vị_trí'] || user['Vị trí'] || user['Vi_tri'] || "Thành viên").toString();
    const userBoPhan = (user['Bộ_phận'] || user['Bộ phận'] || user['Bo_phan'] || "").toString();
    const userEmail = (user['Email'] || user['email'] || "").toString().toLowerCase();

    // Admin always has access
    if (userEmail === import.meta.env.VITE_ADMIN_MAIL || /admin/i.test(userRole)) return true;

    // Get dynamic permissions from localStorage
    const saved = localStorage.getItem('module_permissions');
    const permissions = saved ? JSON.parse(saved) : {};
    const allowedBlocks = permissions[moduleKey] || [];

    if (allowedBlocks.length === 0) {
        // Fallback to hardcoded logic if no dynamic permissions set
        const perms = getAppPermissions(user);
        if (moduleKey === 'dashboard' || moduleKey === 'reports' || moduleKey === 'goals') return perms.isCEO;
        if (moduleKey === 'crm') return perms.isCSKH;
        if (moduleKey === 'orders' || moduleKey === 'new-order') return perms.isSaleOrder;
        if (moduleKey === 'hr') return perms.isHR;
        if (moduleKey === 'finance') return perms.isKeToan;
        if (moduleKey === 'marketing') return perms.isMKT;
        if (moduleKey === 'settings') return perms.isAdmin;
        return false;
    }

    // Check if user's block is in the allowed list
    const userBlocks: string[] = [];
    if (/ceo/i.test(userRole) || /ceo/i.test(userBoPhan) || /giám đốc/i.test(userRole)) userBlocks.push('CEO');
    if (/cskh/i.test(userBoPhan) || /cskh/i.test(userRole)) userBlocks.push('CSKH');
    if (/sale/i.test(userBoPhan) || /sale/i.test(userRole) || /vận đơn/i.test(userBoPhan) || /vận hành/i.test(userBoPhan)) userBlocks.push('SaleOrder');
    if (/hr/i.test(userBoPhan) || /nhân sự/i.test(userBoPhan) || /hr/i.test(userRole)) userBlocks.push('HR');
    if (/kế toán/i.test(userBoPhan) || /tài chính/i.test(userBoPhan) || /kế toán/i.test(userRole) || /finance/i.test(userBoPhan)) userBlocks.push('KeToan');
    if (/mkt/i.test(userBoPhan) || /marketing/i.test(userBoPhan) || /mkt/i.test(userRole)) userBlocks.push('MKT');

    return userBlocks.some(block => allowedBlocks.includes(block));
}

export function getAppPermissions(user: UserData | null) {
    if (!user) return {
        isAdmin: false,
        isCEO: false,
        isCSKH: false,
        isSaleOrder: false,
        isHR: false,
        isKeToan: false,
        isMKT: false
    };

    const userRole = (user['Vị_trí'] || user['Vị trí'] || user['Vi_tri'] || "Thành viên").toString();
    const userBoPhan = (user['Bộ_phận'] || user['Bộ phận'] || user['Bo_phan'] || "").toString();
    const userEmail = (user['Email'] || user['email'] || "").toString().toLowerCase();

    const isAdmin = userEmail === import.meta.env.VITE_ADMIN_MAIL || /admin/i.test(userRole);
    const isCEO = /ceo/i.test(userRole) || /ceo/i.test(userBoPhan) || /giám đốc/i.test(userRole);
    const isCSKH = /cskh/i.test(userBoPhan) || /cskh/i.test(userRole);
    const isSaleOrder = /sale/i.test(userBoPhan) || /sale/i.test(userRole) || /vận đơn/i.test(userBoPhan) || /vận hành/i.test(userBoPhan);
    const isHR = /hr/i.test(userBoPhan) || /nhân sự/i.test(userBoPhan) || /hr/i.test(userRole);
    const isKeToan = /kế toán/i.test(userBoPhan) || /tài chính/i.test(userBoPhan) || /kế toán/i.test(userRole) || /finance/i.test(userBoPhan);
    const isMKT = /mkt/i.test(userBoPhan) || /marketing/i.test(userBoPhan) || /mkt/i.test(userRole);

    return { isAdmin, isCEO, isCSKH, isSaleOrder, isHR, isKeToan, isMKT };
}
