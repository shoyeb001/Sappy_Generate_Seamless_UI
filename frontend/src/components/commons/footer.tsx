import { Globe, Share2 } from "lucide-react";

export const Footer = () => (
    <footer className="border-t border-slate-800/60 bg-[#0B0F19] py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <div className="text-xl font-bold text-white mb-1">Aether UI</div>
                <p className="text-slate-500 text-xs">© 2024 Aether AI. Code for the future of design. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 font-medium">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">Changelog</a>
                <a href="#" className="hover:text-white transition">Community</a>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
                <button className="hover:text-white transition"><Globe size={18} /></button>
                <button className="hover:text-white transition"><Share2 size={18} /></button>
            </div>
        </div>
    </footer>
);