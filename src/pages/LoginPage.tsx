import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn, User } from "lucide-react"

const HR_URL = import.meta.env.VITE_HR_URL;

export function LoginPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) {
            setError("Vui lòng nhập Email làm việc")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(HR_URL)
            if (!response.ok) throw new Error("Không thể kết nối với máy chủ dữ liệu")

            const rawData = await response.json()
            // Firebase often returns an object map { "id1": {data}, "id2": {data} }
            const hrData = Array.isArray(rawData) ? rawData : Object.values(rawData || {}).filter(i => i && typeof i === 'object')

            const foundEmployee = hrData.find((row: any) => {
                const rowEmail = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
                return rowEmail === email.trim().toLowerCase();
            });

            if (foundEmployee) {
                // Save user info to localStorage
                localStorage.setItem("user", JSON.stringify(foundEmployee))
                // Navigate to home
                navigate("/")
            } else {
                setError("Email không tồn tại trong hệ thống nhân sự")
            }
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi đăng nhập")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{
                    backgroundImage: 'url("/login_bg_1766496151301.png")',
                    filter: 'blur(3px) brightness(0.4)'
                }}
            />

            {/* Animated Light Streaks - Decorative */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2d7c2d]/50 to-transparent rotate-12 animate-pulse" />
                <div className="absolute top-2/3 -right-1/4 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2d7c2d]/30 to-transparent -rotate-12 animate-pulse delay-700" />
            </div>

            <Card className="relative z-10 w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden group">
                {/* Top highlight bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2d7c2d] to-[#4ade80] opacity-80" />

                <CardHeader className="space-y-1 pb-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-[#2d7c2d]/20 rounded-2xl flex items-center justify-center mb-4 border border-[#2d7c2d]/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                        <User className="w-8 h-8 text-[#4ade80]" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Lumi Job</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">
                        Hệ thống quản lý vận hành nội bộ
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-300 ml-1">
                                Email làm việc
                            </Label>
                            <div className="relative group/input">
                                <LogIn className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within/input:text-[#4ade80] transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your-email@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 pl-10 h-11 focus:ring-[#2d7c2d] focus:border-[#2d7c2d] transition-all"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-[#2d7c2d] to-[#1e5a1e] hover:from-[#358a35] hover:to-[#226622] text-white font-bold shadow-lg shadow-[#2d7c2d]/20 border-none transition-all duration-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xác thực...
                                </>
                            ) : (
                                "Đăng nhập hệ thống"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-slate-500 italic">
                            Đăng nhập bằng Email đã đăng ký với bộ phận Nhân sự.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}} />
        </div>
    )
}
