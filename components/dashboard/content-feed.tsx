"use client";

import { usePersonalizedFeed } from "../../hooks/usePersonalizedFeed";
import {
  Sparkles,
  Calendar,
  Tag,
  AlertCircle,
  Flame,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse border border-white/5 bg-white/5">
      <div className="w-full h-40 bg-white/10" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 w-1/3 rounded-full bg-white/10" />
        <div className="h-4 w-4/5 rounded-full bg-white/15" />
        <div className="h-3 w-full rounded-full bg-white/5" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-16 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function ContentCard({
  contenido,
  intereses,
}: {
  contenido: any;
  intereses: string[];
}) {
  const fecha = contenido.fechaCreacion?.seconds
    ? new Date(contenido.fechaCreacion.seconds * 1000).toLocaleDateString(
        "es-MX",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      )
    : "Reciente";

  const esRelevante = (contenido.relevancia ?? 0) > 0;

  return (
    <div
      className={`group rounded-2xl border transition-all duration-200 hover:-translate-y-1 bg-white/5 ${
        esRelevante
          ? "border-violet-500/30 shadow-lg shadow-violet-500/5"
          : "border-white/5"
      }`}
    >
      {contenido.imagen ? (
        <img
          src={contenido.imagen}
          alt={contenido.titulo}
          className="w-full h-40 object-cover rounded-t-2xl"
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-violet-500/5 rounded-t-2xl">
          <Sparkles size={28} className="text-violet-500/20" />
        </div>
      )}

      <div className="p-4">
        {esRelevante && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 font-bold uppercase tracking-wider">
              <Sparkles size={9} /> Match
            </span>
          </div>
        )}

        <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-white mb-2 group-hover:text-violet-300 transition-colors">
          {contenido.titulo}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {contenido.tags?.map((tag: string) => {
            const isMatch = intereses.some(
              (i) =>
                i === tag.toLowerCase() ||
                i.includes(tag.toLowerCase()) ||
                tag.toLowerCase().includes(i),
            );
            return (
              <span
                key={tag}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                  isMatch
                    ? "bg-violet-500/20 border border-violet-500/30 text-violet-200"
                    : "bg-white/5 border border-white/5 text-white/30"
                }`}
              >
                {isMatch && <Tag size={8} />}#{tag}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-white/20">
          <span className="truncate max-w-[100px]">
            {contenido.autor || "Fouryouai"}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar size={10} /> {fecha}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ContentFeed() {
  const { contenidos, intereses, loading, error } = usePersonalizedFeed();

  const relevantes = contenidos.filter((c) => (c.relevancia ?? 0) > 0);
  const otrosConts = contenidos.filter((c) => (c.relevancia ?? 0) === 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button className="gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 font-medium text-white shadow-lg shadow-violet-500/25 transition-all">
          <Sparkles className="h-4 w-4" />
          Para ti
        </Button>
        <Button
          variant="ghost"
          className="gap-2 rounded-xl text-muted-foreground hover:bg-violet-500/10 hover:text-violet-300"
        >
          <Flame className="h-4 w-4" />
          Trending
        </Button>
        <Button
          variant="ghost"
          className="gap-2 rounded-xl text-muted-foreground hover:bg-violet-500/10 hover:text-violet-300"
        >
          <Clock className="h-4 w-4" />
          Recientes
        </Button>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-12">
          {relevantes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-violet-400" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Basado en tus intereses
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relevantes.map((c) => (
                  <ContentCard key={c.id} contenido={c} intereses={intereses} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                {relevantes.length > 0
                  ? "Más contenidos"
                  : "Todos los contenidos"}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otrosConts.map((c) => (
                <ContentCard key={c.id} contenido={c} intereses={intereses} />
              ))}
            </div>
          </section>

          {contenidos.length === 0 && (
            <div className="py-20 text-center text-white/20">
              No hay contenidos disponibles.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
