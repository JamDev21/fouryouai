"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Calendar } from "lucide-react";
import type { Thread } from "../types/foro";

interface Props {
  thread: Thread;
}

export default function ThreadCard({ thread }: Props) {
  const router = useRouter();

  const fecha = thread.fecha?.toDate 
    ? thread.fecha.toDate().toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) 
    : "Reciente";

  const avatar =
    thread.autor?.avatarUrl?.trim()
      ? thread.autor.avatarUrl
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          thread.autor?.nombre ?? "?"
        )}&backgroundColor=7c3aed&fontSize=38&fontWeight=600&textColor=ffffff`;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/comunidad/${thread.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/comunidad/${thread.id}`)}
      className="group flex items-start gap-4 rounded-2xl p-4 cursor-pointer bg-white/[0.03] border border-white/[0.06] transition-all duration-200 hover:bg-white/[0.06] hover:border-purple-500/40 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15),0_4px_24px_rgba(139,92,246,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
    >
      <img
        src={avatar}
        alt={thread.autor?.nombre ?? "Usuario"}
        width={40}
        height={40}
        className="shrink-0 mt-0.5 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-purple-500/30 transition-all duration-200"
      />

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-white/90 group-hover:text-purple-300 transition-colors duration-150" style={{ fontFamily: "'Syne', sans-serif" }}>
          {thread.titulo}
        </h3>
        <p className="text-xs text-white/40 mt-1 truncate">
          {thread.autor?.nombre}
        </p>

        {thread.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {thread.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/[0.05] border border-white/[0.08] text-white/40">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2 text-[11px] text-white/30 pt-0.5">
        <span className="flex items-center gap-1.5">
          <Calendar size={11} />
          {fecha}
        </span>
        <span className="flex items-center gap-1.5 text-purple-400/70 group-hover:text-purple-400 transition-colors duration-150">
          <MessageCircle size={11} />
          {thread.respuestasCount ?? 0} resp.
        </span>
      </div>
    </article>
  );
}