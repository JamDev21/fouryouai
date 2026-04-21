import { Thread } from "../app/comunidad/page";
import { MessageSquare, Clock, User, ChevronRight } from "lucide-react";

export default function ThreadCard({ thread }: { thread: Thread }) {
  const fecha = thread.fecha?.seconds 
    ? new Date(thread.fecha.seconds * 1000).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    : "Ahora";

  return (
    <div className="group flex items-center justify-between p-4 rounded-2xl bg-[#12121a]/50 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <User size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-medium text-white/90 group-hover:text-white transition-colors">
            {thread.titulo}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-[11px] text-white/30">
            <span className="font-semibold text-purple-400/80">{thread.autor.nombre}</span>
            <span className="flex items-center gap-1"><Clock size={12} />{fecha}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-xs font-bold text-purple-400">
            <MessageSquare size={14} /> {thread.respuestasCount}
          </div>
          <span className="text-[8px] text-white/20 uppercase font-bold tracking-tighter">Respuestas</span>
        </div>
        <ChevronRight size={18} className="text-white/10 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}