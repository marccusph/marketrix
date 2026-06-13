import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-bg p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-gray-900">Marke</span>
            <span className="text-orange-500">trix</span>
          </h1>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Co-piloto de Estratégia
        </span>
      </div>
    </header>
  );
}
