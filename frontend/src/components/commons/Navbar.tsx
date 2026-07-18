import { RotateCcw, Share2 } from "lucide-react";
import { Button } from "../ui/button";

export const Navbar = () => (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-white tracking-tight">Aether UI</div>
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
                <a href="#" className="text-white border-b-2 border-white pb-1">Explore</a>
                <a href="#" className="hover:text-white transition-colors">Templates</a>
                <a href="#" className="hover:text-white transition-colors">Docs</a>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white"><RotateCcw size={18} /></button>
            <button className="text-slate-400 hover:text-white"><Share2 size={18} /></button>
            <div className="w-px h-4 bg-slate-800 mx-2"></div>
            <Button>Design Now</Button>
        </div>
    </nav>
);