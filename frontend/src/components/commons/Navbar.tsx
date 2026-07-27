import { RotateCcw, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { authSessionCleared } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

export const Navbar = () => {
    const dispatch = useAppDispatch()
    const session = useAppSelector((state) => state.auth.session)

    const handleAuthAction = () => {
        if (session) {
            dispatch(authSessionCleared())
            window.location.href = "/"
            return
        }

        window.location.href = "/auth"
    }

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <div className="text-xl font-bold text-white tracking-tight">Sappy AI</div>
                <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">

                    {session ? (
                        <a href="/settings" className="hover:text-white transition-colors">Settings</a>
                    ) : null}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {/* <button className="text-slate-400 hover:text-white"><RotateCcw size={18} /></button> */}
                <button className="text-slate-400 hover:text-white"><Share2 size={18} /></button>
                <div className="w-px h-4 bg-slate-800 mx-2"></div>
                <Button onClick={handleAuthAction}>
                    {session ? "Log out" : "Log in"}
                </Button>
            </div>
        </nav>
    )
};
