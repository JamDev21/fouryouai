"use client"

import { useState, useEffect } from "react"
import { Sparkles, Clock, Flame, ThumbsUp, Eye, Play, BookOpen, X } from "lucide-react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/src/lib/firebaseConfig"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ContenidoElemento {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  etiquetas: string[];
  urlMedia: string;
  autorId: string;
  autorNombre: string;
  etiquetados: string[];
  colaboradores: string[];
  colaboradoresNombres?: string[];
  etiquetadosNombres?: string[];
  fechaCreacion: any;
  vistas: number;
  likes: number;
  autorAvatar?: string;
  autorOcupacion?: string;
}

// ============================================================
// MODAL CONSTRUIDO DESDE CERO — SIN SHADCN DIALOG
// ============================================================
function ContentModal({ content, onClose }: { content: ContenidoElemento; onClose: () => void }) {
  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    // Overlay
    <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
      {/* Contenedor del modal — altura fija, flex column */}
      <div
  className="relative w-full max-w-2xl border border-white/10 rounded-3xl text-gray-200 overflow-hidden flex flex-col shadow-2xl backdrop-blur-2xl"
  style={{
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Menos negro, más transparente
    height: "85vh",
    maxHeight: "85vh",
  }}
  onClick={(e) => e.stopPropagation()}
>
        {/* Botón cerrar — fijo en la esquina */}
        <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>

        {/* Zona scrolleable — flex-1 + minHeight:0 es la clave */}
        <div
  className="flex-1 overflow-y-auto p-6 md:p-8"
  style={{
    scrollbarWidth: "none", // Oculta scroll en Firefox
  }}
  // El pseudo-elemento para Chrome/Safari/Edge:
  // (Debes agregar esto en tu archivo CSS global o usar un estilo en línea)
>
  <style jsx>{`
    div::-webkit-scrollbar {
      display: none;
    }
  `}</style>
          {/* <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}> */}
            <div className="space-y-6">
            {/* Cabecera autor */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", paddingRight: "2rem" }}>
              <Avatar className="h-10 w-10 border border-purple-500/30">
                <AvatarImage src={content.autorAvatar} />
                <AvatarFallback className="bg-purple-900 text-purple-200 font-bold text-xs">
                  {content.autorNombre.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", margin: 0 }}>{content.autorNombre}</h3>
                <p style={{ fontSize: "0.75rem", color: "rgba(196,181,253,0.7)", margin: 0 }}>{content.autorOcupacion}</p>
              </div>
            </div>

            {/* Título y etiquetas */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", lineHeight: 1.3, paddingRight: "2rem", margin: 0 }}>
                {content.titulo}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.75rem" }}>
                {content.etiquetas.map((tag) => (
                  <Badge key={tag} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium px-2.5 py-0.5 rounded-md">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Media */}
            <div style={{ width: "100%", borderRadius: "1rem", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {content.tipo === "video" ? (
                <video src={content.urlMedia} controls autoPlay style={{ width: "100%", aspectRatio: "16/9", objectFit: "contain" }} />
              ) : (
                <img src={content.urlMedia} alt={content.titulo} style={{ width: "100%", maxHeight: "420px", objectFit: "contain", display: "block", margin: "0 auto" }} />
              )}
            </div>

            {/* Descripción */}
            <div style={{ backgroundColor: "rgba(0,0,0,0.4)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h4 style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgb(192,132,252)", marginBottom: "0.75rem", margin: "0 0 0.75rem 0" }}>
                Descripción Completa
              </h4>
              <p style={{ fontSize: "0.875rem", color: "rgb(209,213,219)", lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>
                {content.descripcion}
              </p>
            </div>

            {/* Colaboradores y Etiquetados */}
            {((content.colaboradoresNombres && content.colaboradoresNombres.length > 0) ||
              (content.etiquetadosNombres && content.etiquetadosNombres.length > 0)) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem" }}>
                {content.colaboradoresNombres && content.colaboradoresNombres.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ color: "rgb(156,163,175)", fontWeight: 600 }}>Colaboradores de este recurso:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", backgroundColor: "rgba(88,28,135,0.3)", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(168,85,247,0.2)" }}>
                      {content.colaboradoresNombres.map((nombre, i) => (
                        <span key={i} style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "0.25rem 0.5rem", borderRadius: "0.375rem", border: "1px solid rgba(255,255,255,0.1)", color: "rgb(233,213,255)" }}>{nombre}</span>
                      ))}
                    </div>
                  </div>
                )}
                {content.etiquetadosNombres && content.etiquetadosNombres.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ color: "rgb(156,163,175)", fontWeight: 600 }}>Personas Etiquetadas:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", backgroundColor: "rgba(49,46,129,0.3)", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {content.etiquetadosNombres.map((nombre, i) => (
                        <span key={i} style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "0.25rem 0.5rem", borderRadius: "0.375rem", border: "1px solid rgba(255,255,255,0.1)", color: "rgb(199,210,254)" }}>{nombre}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export function ContentFeed() {
  const [activeTab, setActiveTab] = useState<"para-ti" | "trending" | "recientes">("para-ti")
  const [contenidos, setContenidos] = useState<ContenidoElemento[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<ContenidoElemento | null>(null)

  useEffect(() => {
    const cargarFeedReal = async () => {
      setLoading(true)
      try {
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"))
        const mapaUsuarios: Record<string, { nombre: string; avatar?: string; ocupacion?: string }> = {}
        
        usuariosSnapshot.forEach((doc) => {
          const data = doc.data()
          mapaUsuarios[doc.id] = {
            nombre: data.nombre || "Usuario de Fouryou",
            avatar: data.fotoPerfil || data.avatar || "",
            ocupacion: data.ocupacion || data.rol || "Estudiante"
          }
        })

        const contenidosQuery = query(collection(db, "contenidos"), orderBy("fechaCreacion", "desc"))
        const contenidosSnapshot = await getDocs(contenidosQuery)
        
        const listaContenidos: ContenidoElemento[] = contenidosSnapshot.docs.map((doc) => {
          const data = doc.data()
          const infoAutor = mapaUsuarios[data.autorId] || {}
          const colaboradoresIds: string[] = data.colaboradores || []
          const etiquetadosIds: string[] = data.etiquetados || []
          const colaboradoresNombres = colaboradoresIds.map(uid => mapaUsuarios[uid]?.nombre || `Usuario (${uid.substring(0, 4)})`)
          const etiquetadosNombres = etiquetadosIds.map(uid => mapaUsuarios[uid]?.nombre || `Usuario (${uid.substring(0, 4)})`)
          
          return {
            id: doc.id,
            titulo: data.titulo || "Sin título",
            descripcion: data.descripcion || "",
            tipo: data.tipo || "articulo",
            etiquetas: data.etiquetas || [],
            urlMedia: data.urlMedia || "",
            autorId: data.autorId || "",
            autorNombre: data.autorNombre || "Usuario Anónimo",
            etiquetados: etiquetadosIds,
            colaboradores: colaboradoresIds,
            colaboradoresNombres,
            etiquetadosNombres,
            fechaCreacion: data.fechaCreacion,
            vistas: data.vistas || 0,
            likes: data.likes || 0,
            autorAvatar: infoAutor.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.autorId}`,
            autorOcupacion: infoAutor.ocupacion || "Miembro de la Comunidad"
          }
        })

        setContenidos(listaContenidos)
      } catch (error) {
        console.error("Error al construir el feed dinámico:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarFeedReal()
  }, [activeTab])

  return (
    <div className="space-y-6">
      {/* Pestañas */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <Button onClick={() => setActiveTab("para-ti")} className={`gap-2 rounded-xl px-5 font-medium transition-all ${activeTab === "para-ti" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} variant={activeTab === "para-ti" ? "default" : "ghost"}>
          <Sparkles className="h-4 w-4" /> Para ti
        </Button>
        <Button onClick={() => setActiveTab("trending")} className={`gap-2 rounded-xl px-5 font-medium transition-all ${activeTab === "trending" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} variant={activeTab === "trending" ? "default" : "ghost"}>
          <Flame className="h-4 w-4" /> Trending
        </Button>
        <Button onClick={() => setActiveTab("recientes")} className={`gap-2 rounded-xl px-5 font-medium transition-all ${activeTab === "recientes" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} variant={activeTab === "recientes" ? "default" : "ghost"}>
          <Clock className="h-4 w-4" /> Recientes
        </Button>
      </div>

      {/* Grid del Feed */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-4 rounded-2xl border border-white/5 bg-[#11111a] p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-3 w-32 bg-white/10" />
                </div>
              </div>
              <Skeleton className="h-40 w-full rounded-xl bg-white/10" />
            </div>
          ))}
        </div>
      ) : contenidos.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-2xl bg-[#11111a]/30">
          <p className="text-gray-500 text-sm">Aún no hay recursos guardados en la base de datos.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {contenidos.map((item) => (
            <div key={item.id} onClick={() => setSelectedContent(item)} className="group cursor-pointer rounded-2xl border border-white/5 bg-[#11111a] p-5 shadow-xl transition-all duration-300 hover:border-purple-500/30 hover:bg-[#151522] hover:shadow-purple-500/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-9 w-9 border border-purple-500/20">
                    <AvatarImage src={item.autorAvatar} alt={item.autorNombre} />
                    <AvatarFallback className="bg-purple-950 text-purple-300 font-bold text-xs">{item.autorNombre.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-white truncate">{item.autorNombre}</h4>
                    <p className="text-xs text-gray-400 truncate">{item.autorOcupacion}</p>
                  </div>
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 border border-white/5 mb-4">
                  {item.tipo === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-purple-950/20 z-10 group-hover:scale-105 transition-transform duration-300">
                      <div className="p-3 rounded-full bg-purple-600/90 text-white shadow-xl shadow-purple-600/30"><Play size={20} fill="white" /></div>
                    </div>
                  )}
                  <img src={item.urlMedia} alt={item.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => {(e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=340&fit=crop"}} />
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors mb-2">{item.titulo}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">{item.descripcion}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex flex-wrap gap-1">
                  {item.etiquetas.slice(0, 3).map((tag) => (
                    <Badge key={tag} className="bg-purple-500/10 text-purple-300 border-none hover:bg-purple-500/20 text-[10px] py-0 px-2 rounded-md">#{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 hover:text-purple-400"><ThumbsUp size={13} /> {item.likes}</span>
                    <span className="flex items-center gap-1"><Eye size={13} /> {item.vistas}</span>
                  </div>
                  {item.tipo === "video" ? (
                    <span className="text-[10px] font-semibold text-purple-400 flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-full"><Play size={10} fill="currentColor" /> Video</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full"><BookOpen size={10} /> Artículo</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal personalizado sin shadcn */}
      {selectedContent && (
        <ContentModal content={selectedContent} onClose={() => setSelectedContent(null)} />
      )}
    </div>
  )
}