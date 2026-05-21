"use client"

import { useState, useEffect } from "react"
import { Sparkles, Clock, Flame, ThumbsUp, Eye, Play, BookOpen, X } from "lucide-react"
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore"
import { db, auth } from "@/src/lib/firebaseConfig"
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
// LÓGICA GLOBAL PARA LIKES ÚNICOS (USADA EN DASHBOARD Y MODAL)
// ============================================================
const darLikeReal = async (contenidoId: string): Promise<number> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    alert("Inicia sesión para dar like");
    return 0; // 0 significa que no hubo cambio
  }

  const likeRef = doc(db, "likes", `${userId}_${contenidoId}`);
  const contenidoRef = doc(db, "contenidos", contenidoId);
  const likeSnap = await getDoc(likeRef);
  
  if (likeSnap.exists()) {
    // Si ya existe, lo quitamos
    await deleteDoc(likeRef);
    await updateDoc(contenidoRef, { likes: increment(-1) });
    return -1; // Devolvemos -1 para restar en la UI
  } else {
    // Si no existe, lo agregamos
    await setDoc(likeRef, { userId, contenidoId, fecha: serverTimestamp() });
    await updateDoc(contenidoRef, { likes: increment(1) });
    return 1; // Devolvemos 1 para sumar en la UI
  }
};

// ============================================================
// MODAL CONSTRUIDO DESDE CERO
// ============================================================
function ContentModal({ content, onClose }: { content: ContenidoElemento; onClose: () => void }) {
  const [likes, setLikes] = useState(content.likes);
  const [isLiking, setIsLiking] = useState(false); // Para evitar doble clic rápido
  
  // Función manejadora del like dentro del modal
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);

    try {
      const cambio = await darLikeReal(content.id);
      setLikes(prev => prev + cambio); // Suma o resta al instante en el modal
    } catch (error) {
      console.error("Error al dar like:", error);
    } finally {
      setIsLiking(false);
    }
  };
  
  // Bloquear scroll y registrar vista
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    const registrarVista = async () => {
      try {
        const contenidoRef = doc(db, "contenidos", content.id);
        await updateDoc(contenidoRef, { vistas: increment(1) });
      } catch (error) { console.error("Error vista:", error); }
    };
    registrarVista();

    return () => { document.body.style.overflow = "" };
  }, [content.id]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl border border-white/10 rounded-3xl text-gray-200 overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", height: "85vh", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
          <X size={18} />
        </button>

        <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: "none" }}>
          <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
          
          <div className="space-y-6">
            
            {/* Cabecera del Modal (Autor y Botón Like) */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 pr-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-purple-500/30">
                  <AvatarImage src={content.autorAvatar} />
                  <AvatarFallback>{content.autorNombre.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-white">{content.autorNombre}</h3>
                  <p className="text-xs text-purple-300/70">{content.autorOcupacion}</p>
                </div>
              </div>
              <Button onClick={handleLike} disabled={isLiking} variant="ghost" className="flex items-center gap-2 text-purple-400 hover:bg-purple-900/20">
                <ThumbsUp size={18} />
                <span className="font-bold">{likes}</span>
              </Button>
            </div>

            {/* Resto del contenido del modal */}
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight pr-6">{content.titulo}</h2>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {content.etiquetas.map((tag) => (
                  <Badge key={tag} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium px-2.5 py-0.5 rounded-md">#{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="w-full rounded-2xl overflow-hidden bg-black/80 border border-white/5 shadow-inner">
              {content.tipo === "video" ? (
                <video src={content.urlMedia} controls autoPlay className="w-full aspect-video object-contain" />
              ) : (
                <img src={content.urlMedia} alt={content.titulo} className="w-full max-h-[420px] object-contain mx-auto" />
              )}
            </div>

            <div className="space-y-3 bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Descripción Completa</h4>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{content.descripcion}</p>
            </div>

            {/* Colaboradores y Etiquetados */}
            {((content.colaboradoresNombres && content.colaboradoresNombres.length > 0) || (content.etiquetadosNombres && content.etiquetadosNombres.length > 0)) && (
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-white/10 text-xs">
                {content.colaboradoresNombres && content.colaboradoresNombres.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-gray-400 font-semibold">Colaboradores:</span>
                    <div className="flex flex-wrap gap-1 bg-purple-900/30 p-3 rounded-xl border border-purple-500/20">
                      {content.colaboradoresNombres.map((nombre, i) => (
                        <span key={i} className="bg-black/50 px-2 py-1 rounded-md border border-white/10 text-purple-200">{nombre}</span>
                      ))}
                    </div>
                  </div>
                )}
                {content.etiquetadosNombres && content.etiquetadosNombres.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-gray-400 font-semibold">Etiquetados:</span>
                    <div className="flex flex-wrap gap-1 bg-indigo-900/30 p-3 rounded-xl border border-indigo-500/20">
                      {content.etiquetadosNombres.map((nombre, i) => (
                        <span key={i} className="bg-black/50 px-2 py-1 rounded-md border border-white/10 text-indigo-200">{nombre}</span>
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

// ============================================================
// COMPONENTE PRINCIPAL DEL DASHBOARD
// ============================================================
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
            colaboradoresNombres: colaboradoresIds.map(uid => mapaUsuarios[uid]?.nombre || `Usuario (${uid.substring(0, 4)})`),
            etiquetadosNombres: etiquetadosIds.map(uid => mapaUsuarios[uid]?.nombre || `Usuario (${uid.substring(0, 4)})`),
            fechaCreacion: data.fechaCreacion,
            vistas: data.vistas || 0,
            likes: data.likes || 0,
            autorAvatar: infoAutor.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.autorId}`,
            autorOcupacion: infoAutor.ocupacion || "Miembro de la Comunidad"
          }
        })

        setContenidos(listaContenidos)
      } catch (error) {
        console.error("Error al cargar:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarFeedReal()
  }, [activeTab])

  // Función manejadora del like desde la tarjeta en el dashboard
  const handleLikeCard = async (e: React.MouseEvent, contenidoId: string) => {
    e.stopPropagation(); // Evita abrir el modal
    const cambio = await darLikeReal(contenidoId);
    
    // Actualización local rápida para que se vea reflejado en la lista
    if (cambio !== 0) {
      setContenidos(prev => prev.map(item => 
        item.id === contenidoId ? { ...item, likes: item.likes + cambio } : item
      ));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <Button onClick={() => setActiveTab("para-ti")} className={`gap-2 rounded-xl px-5 font-medium transition-all ${activeTab === "para-ti" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} variant={activeTab === "para-ti" ? "default" : "ghost"}><Sparkles className="h-4 w-4" /> Para ti</Button>
        <Button onClick={() => setActiveTab("trending")} className={`gap-2 rounded-xl px-5 font-medium transition-all ${activeTab === "trending" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} variant={activeTab === "trending" ? "default" : "ghost"}><Flame className="h-4 w-4" /> Trending</Button>
        <Button onClick={() => setActiveTab("recientes")} className={`gap-2 rounded-xl px-5 font-medium transition-all ${activeTab === "recientes" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25" : "text-gray-400 hover:bg-white/5 hover:text-white"}`} variant={activeTab === "recientes" ? "default" : "ghost"}><Clock className="h-4 w-4" /> Recientes</Button>
      </div>

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
          <p className="text-gray-500 text-sm">Aún no hay recursos guardados.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {contenidos.map((item) => (
            <div key={item.id} onClick={() => setSelectedContent(item)} className="group cursor-pointer rounded-2xl border border-white/5 bg-[#11111a] p-5 shadow-xl transition-all duration-300 hover:border-purple-500/30 hover:bg-[#151522] hover:shadow-purple-500/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-9 w-9 border border-purple-500/20">
                    <AvatarImage src={item.autorAvatar} />
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
                    <button 
                      onClick={(e) => handleLikeCard(e, item.id)}
                      className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                    >
                      <ThumbsUp size={13} /> {item.likes}
                    </button>
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

      {selectedContent && (
        <ContentModal content={selectedContent} onClose={() => setSelectedContent(null)} />
      )}
    </div>
  )
}