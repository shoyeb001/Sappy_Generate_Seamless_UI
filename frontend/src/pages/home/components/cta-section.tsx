import { Button } from "@/components/ui/button";

export const CtaSection = () => (
    <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-700/50 p-12 text-center relative overflow-hidden shadow-2xl">
            {/* Soft background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Ready to transcend <br /> standard design?</h2>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                    Join 50,000+ designers and engineers building the future of the web with Aether UI. Get started for free today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button className="w-full sm:w-auto px-8 h-12 text-base">Create My First App</Button>
                    <Button variant="outline" className="w-full sm:w-auto px-8 h-12 text-base bg-slate-900/50">Watch Demo</Button>
                </div>
                <p className="text-slate-500 text-xs mt-6">No credit card required • Unlimited local exports</p>
            </div>
        </div>
    </section>
);