"use client"

import { useState, useEffect } from "react"
import { Clock, TrendingUp, MessageCircleQuestion, Plus, MessageSquare, X } from "lucide-react"
import { collection, getDocs, query, orderBy, where, limit, addDoc, serverTimestamp, onSnapshot, increment, updateDoc, doc, arrayUnion, arrayRemove} from "firebase/firestore"
import { db, auth } from "@/src/lib/firebaseConfig" // Asegúrate de importar 'auth'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation";

// Tipado actualizado para coincidir con tu BD
interface Hilo {
  id: string;
  titulo: string;
  descripcion: string;
  id_autor: string; 
  autorNombreResolvido?: string; 
  autorAvatarResolvido?: string;
  tags: string[];
  fechaCreacion: any;
  contadorRespuestas: number;
}

interface NuevoHiloModalProps {
  onClose: () => void;
  onHiloCreado: () => void; 
}

const enviarNotificacion = async ({ receptorId, tipo, emisorId, emisorNombre, contenidoId, mensaje }: any) => {
  // Evitamos que te llegue una notificación si tú mismo le das like a tu post
  if (!receptorId || receptorId === emisorId) return; 

  try {
    const notifRef = collection(db, "usuarios", receptorId, "notificaciones");
    await addDoc(notifRef, {
      tipo,
      emisorId,
      emisorNombre,
      contenidoId,
      mensaje,
      leida: false,
      fechaCreacion: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
  }
};

function NuevoHiloModal({ onClose, onHiloCreado }: NuevoHiloModalProps) {
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [tagsInput, setTagsInput] = useState("") 
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !descripcion.trim()) return
    setIsSubmitting(true)

    try {
      const arrayTags = tagsInput
        .split(",")
        .map(tag => tag.trim().toLowerCase().replace("#", ""))
        .filter(tag => tag.length > 0)

      const userId = auth.currentUser?.uid || "anonimo"

      await addDoc(collection(db, "foros_hilos"), {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        id_autor: userId, 
        tags: arrayTags,
        contadorRespuestas: 0, 
        fechaCreacion: serverTimestamp()
      })

      onHiloCreado() 
      onClose() 
    } catch (error) {
      console.error("Error al crear el hilo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-xl border border-white/10 rounded-3xl text-gray-200 overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        style={{ backgroundColor: "rgba(10, 10, 15, 0.85)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Publicar nuevo hilo</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Título del hilo</label>
            <input 
              type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)}
              placeholder="¿De qué trata tu discusión académica?"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción o contenido</label>
            <textarea 
              required rows={5} value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica detalladamente tu duda o aporta contexto para la comunidad..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Etiquetas (Tags)</label>
            <input 
              type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ej: ingenieria, react, machine-learning"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <p className="text-[11px] text-gray-500 pl-1">Separa las etiquetas usando comas (,)</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <Button type="button" onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl px-5">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl px-6 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50">
              {isSubmitting ? "Publicando..." : "Publicar hilo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


interface Respuesta {
  id: string;
  contenido: string;
  id_autor: string;
  autorNombreResolvido?: string;
  autorAvatarResolvido?: string;
  fechaCreacion: any;
  reacciones?: Record<string, string[]>; // 🟢 NUEVO: Mapa de emojis y usuarios
}

interface HiloDetalleModalProps {
  hilo: Hilo;
  onClose: () => void;
}

// Los emojis que la comunidad podrá usar
const EMOJIS_DISPONIBLES = ["🔥", "💡", "👏", "💯"];

function HiloDetalleModal({ hilo, onClose }: HiloDetalleModalProps) {
  const [respuestas, setRespuestas] = useState<Respuesta[]>([])
  const [nuevaRespuesta, setNuevaRespuesta] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapaUsuarios, setMapaUsuarios] = useState<Record<string, any>>({})

  // Bloquear scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  // Cargar usuarios y respuestas en tiempo real
  useEffect(() => {
    // 1. Descargamos las fotos de perfil actuales
    const cargarUsuarios = async () => {
      try {
        const snap = await getDocs(collection(db, "usuarios"));
        const mapa: Record<string, any> = {};
        snap.forEach(doc => {
          const data = doc.data();
          mapa[doc.id] = { 
            nombre: data.nombre || "Usuario", 
            avatar: data.fotoPerfil || data.avatar || "" 
          };
        });
        setMapaUsuarios(mapa);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    
    cargarUsuarios();

    // 2. Escuchamos solo las respuestas de ESTE hilo en tiempo real
    const qRespuestas = query(
      collection(db, "foros_respuestas"),
      where("id_hilo", "==", hilo.id),
      orderBy("fechaCreacion", "asc")
    );

    const unsubscribe = onSnapshot(qRespuestas, (snapshot) => {
      const listaRespuestas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Respuesta[];
      
      setRespuestas(listaRespuestas);
    });

    return () => unsubscribe();
  }, [hilo.id]);

  //  FUNCIÓN ACTUALIZADA: Manejador para publicar respuestas y detectar menciones
  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaRespuesta.trim()) return;
    setIsSubmitting(true);

    try {
      const userId = auth.currentUser?.uid || "anonimo";
      const miNombre = auth.currentUser?.displayName || "Un miembro de la comunidad";

      // 1. Detección de Menciones (Buscamos palabras que empiecen con @)
      // La Regex busca @ seguido de letras, números o guiones bajos
      const mencionesEncontradas = nuevaRespuesta.match(/@\w+/g) || [];
      const uidsMencionados: string[] = [];

      // Si hay menciones, cruzamos los nombres con nuestro mapaUsuarios para sacar sus UIDs
      if (mencionesEncontradas.length > 0) {
        // Limpiamos la arroba para tener solo los nombres: ["Carlos", "Elena"]
        const nombresPuros = mencionesEncontradas.map(m => m.substring(1));
        
        // Iteramos nuestro mapaUsuarios para ver si esos nombres existen
        Object.entries(mapaUsuarios).forEach(([uid, data]) => {
           if (nombresPuros.includes(data.nombre)) {
              // Evitamos auto-mencionarnos
              if (uid !== userId) {
                uidsMencionados.push(uid);
              }
           }
        });
      }

      // 2. Guardamos la respuesta en la colección (ahora con las menciones)
      await addDoc(collection(db, "foros_respuestas"), {
        contenido: nuevaRespuesta.trim(),
        id_autor: userId,
        id_hilo: hilo.id,
        fechaCreacion: serverTimestamp(),
        reacciones: {},
        menciones: uidsMencionados // 🟢 Guardamos el array de UIDs por si sirve en el futuro
      });

      // 3. Aumentamos el contador en el hilo original
      const hiloRef = doc(db, "foros_hilos", hilo.id);
      await updateDoc(hiloRef, {
        contadorRespuestas: increment(1)
      });

      // 4. DISPARAMOS NOTIFICACIONES
      // A) Notificamos a las personas que fueron mencionadas
      for (const receptorUid of uidsMencionados) {
        await enviarNotificacion({
          receptorId: receptorUid,
          tipo: "mencion",
          emisorId: userId,
          emisorNombre: miNombre,
          contenidoId: hilo.id, // Ojo: los mandamos al hilo para que lo abran
          mensaje: "te mencionó en un hilo de comunidad."
        });
      }

      // B) Notificamos al autor original del hilo que alguien respondió
      // (Solo si no es el mismo autor respondiendo a su propio hilo y si no lo acabamos de mencionar)
      if (hilo.id_autor && hilo.id_autor !== userId && !uidsMencionados.includes(hilo.id_autor)) {
        await enviarNotificacion({
          receptorId: hilo.id_autor,
          tipo: "comentario",
          emisorId: userId,
          emisorNombre: miNombre,
          contenidoId: hilo.id,
          mensaje: "respondió a tu hilo."
        });
      }

      setNuevaRespuesta(""); // Limpiamos el input
    } catch (error) {
      console.error("Error al publicar respuesta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 FUNCIÓN ACTUALIZADA: Manejador de Reacciones (Estilo Facebook - Única opción)
  const handleReaccion = async (respuestaId: string, emojiSeleccionado: string, reaccionesActuales: Record<string, string[]> = {}) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Inicia sesión para reaccionar.");
      return;
    }

    const respuestaRef = doc(db, "foros_respuestas", respuestaId);
    
    // Objeto para agrupar todas las instrucciones que le mandaremos a Firebase
    const actualizaciones: Record<string, any> = {};

    // Iteramos por todos los emojis para limpiar los anteriores y setear el nuevo
    EMOJIS_DISPONIBLES.forEach(emoji => {
      const usuariosQueDieronClic = reaccionesActuales[emoji] || [];
      const usuarioYaEstabaAqui = usuariosQueDieronClic.includes(userId);

      if (emoji === emojiSeleccionado) {
        // ¿Le dio clic al mismo emoji que ya tenía? Se lo quitamos (Toggle Off)
        if (usuarioYaEstabaAqui) {
          actualizaciones[`reacciones.${emoji}`] = arrayRemove(userId);
        } 
        // ¿Es un emoji nuevo para él? Se lo agregamos
        else {
          actualizaciones[`reacciones.${emoji}`] = arrayUnion(userId);
        }
      } else {
        // Si es CUALQUIER OTRO emoji diferente al seleccionado, y el usuario estaba ahí, lo quitamos
        if (usuarioYaEstabaAqui) {
          actualizaciones[`reacciones.${emoji}`] = arrayRemove(userId);
        }
      }
    });

    try {
      // Mandamos todas las órdenes a Firebase en un solo viaje
      if (Object.keys(actualizaciones).length > 0) {
        await updateDoc(respuestaRef, actualizaciones);
      }
    } catch (error) {
      console.error("Error al actualizar reacción:", error);
    }
  };

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return "justo ahora"
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat('es-MX', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-3xl border border-white/10 rounded-3xl text-gray-200 overflow-hidden flex flex-col shadow-2xl bg-[#0a0a0f]"
        style={{ height: "90vh", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0f] z-10">
          <h2 className="text-lg font-bold text-white truncate pr-4">Hilo de discusión</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 bg-purple-600 border border-purple-500/30">
                <AvatarImage src={hilo.autorAvatarResolvido} />
                <AvatarFallback>{hilo.autorNombreResolvido?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-white">{hilo.autorNombreResolvido}</p>
                <p className="text-xs text-gray-500">{formatearFecha(hilo.fechaCreacion)}</p>
              </div>
            </div>
            
            <h1 className="text-2xl font-extrabold text-white leading-tight">{hilo.titulo}</h1>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {hilo.descripcion}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {hilo.tags.map(tag => (
                <Badge key={tag} className="bg-purple-500/10 text-purple-300 border-none px-3 py-1">#{tag}</Badge>
              ))}
            </div>
          </div>

          <hr className="border-white/5" />

          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Respuestas ({respuestas.length})
            </h3>
            
            {respuestas.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-gray-500 text-sm">Nadie ha respondido aún. ¡Sé el primero!</p>
              </div>
            ) : (
              respuestas.map(resp => {
                const autor = mapaUsuarios[resp.id_autor] || { nombre: resp.id_autor, avatar: "" }
                const reacc = resp.reacciones || {}
                const miUserId = auth.currentUser?.uid || ""

                return (
                  <div key={resp.id} className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0 border border-white/10 bg-black">
                      <AvatarImage src={autor.avatar} />
                      <AvatarFallback className="text-xs">{autor.nombre?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      {/* Tarjeta del comentario */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-purple-300">{autor.nombre}</span>
                          <span className="text-[10px] text-gray-500">{formatearFecha(resp.fechaCreacion)}</span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-line">{resp.contenido}</p>
                      </div>

                      {/* 🟢 ZONA DE REACCIONES DEBAJO DEL COMENTARIO */}
                      <div className="flex items-center gap-2 mt-2 ml-1">
                        {EMOJIS_DISPONIBLES.map(emoji => {
                          const usuariosQueDieronClic = reacc[emoji] || [];
                          const conteo = usuariosQueDieronClic.length;
                          const yoLeDiClic = usuariosQueDieronClic.includes(miUserId);

                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReaccion(resp.id, emoji, reacc)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all border ${
                                yoLeDiClic
                                  ? "bg-purple-600/20 border-purple-500/50 text-purple-300" // Botón prendido
                                  : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white" // Botón apagado
                              }`}
                            >
                              <span>{emoji}</span>
                              {conteo > 0 && <span className="font-semibold">{conteo}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-[#0a0a0f] z-10">
          <form onSubmit={handleResponder} className="flex gap-3 max-w-4xl mx-auto">
            <input 
              type="text"
              value={nuevaRespuesta}
              onChange={(e) => setNuevaRespuesta(e.target.value)}
              placeholder="Escribe una respuesta para la comunidad..."
              className="flex-1 bg-[#12121a] border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting || !nuevaRespuesta.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 font-semibold transition-all"
            >
              Responder
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default function ComunidadFeed() {
  const [filtroActivo, setFiltroActivo] = useState<"recientes" | "populares" | "sin-responder">("recientes")
  const [hilos, setHilos] = useState<Hilo[]>([])
  const [loading, setLoading] = useState(true)
  
 
  
  // 🟢 ESTADOS PARA EL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [hiloSeleccionado, setHiloSeleccionado] = useState<Hilo | null>(null)

  const searchParams = useSearchParams();
  const hiloIdParam = searchParams.get("hilo"); // Lee '?hilo=ID' de la URL


  useEffect(() => {
    if (hiloIdParam && hilos.length > 0) {
      const hiloEncontrado = hilos.find(h => h.id === hiloIdParam);
      if (hiloEncontrado) {
        setHiloSeleccionado(hiloEncontrado);
      }
    }
  }, [hiloIdParam, hilos]);

  useEffect(() => {
    const cargarHilos = async () => {
      setLoading(true); 
      try {
        // 1. Cargamos a todos los usuarios para obtener sus fotos de perfil MÁS RECIENTES
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        const mapaUsuarios: Record<string, { nombre: string; avatar?: string }> = {};
        
        usuariosSnapshot.forEach((doc) => {
          const data = doc.data();
          mapaUsuarios[doc.id] = { 
            nombre: data.nombre || "Usuario Desconocido", 
            avatar: data.fotoPerfil || data.avatar || "" 
          };
        });

        // 2. Cargamos la colección de hilos según el filtro
        const hilosRef = collection(db, "foros_hilos");
        let q;

        if (filtroActivo === "recientes") {
          q = query(hilosRef, orderBy("fechaCreacion", "desc"), limit(20));
        } else if (filtroActivo === "populares") {
          q = query(hilosRef, orderBy("contadorRespuestas", "desc"), limit(20));
        } else if (filtroActivo === "sin-responder") {
          q = query(hilosRef, where("contadorRespuestas", "==", 0), orderBy("fechaCreacion", "desc"), limit(20));
        }

        const snapshot = await getDocs(q!);
        
        // 3. Cruzamos los hilos con la foto actual del usuario
        const listaHilos = snapshot.docs.map(doc => {
          const data = doc.data();
          const infoAutor = mapaUsuarios[data.id_autor] || { nombre: data.id_autor, avatar: "" };

          return {
            id: doc.id,
            titulo: data.titulo || "Sin título",
            descripcion: data.descripcion || "",
            id_autor: data.id_autor || "",
            autorNombreResolvido: infoAutor.nombre,       
            autorAvatarResolvido: infoAutor.avatar,       
            tags: data.tags || [],
            fechaCreacion: data.fechaCreacion,
            contadorRespuestas: data.contadorRespuestas || 0
          };
        }) as Hilo[];

        setHilos(listaHilos);
      } catch (error) {
        console.error("Error al cargar hilos:", error);
      } finally {
        setLoading(false); 
      }
    };

    cargarHilos();
  }, [filtroActivo, refreshTrigger]);

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Comunidad</h1>
          <p className="text-sm text-gray-400 mt-1">Discusiones académicas · tiempo real</p>
        </div>
        {/* 🟢 BOTÓN PARA ABRIR MODAL */}
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-5 font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo hilo
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 pb-4">
        <Button onClick={() => setFiltroActivo("recientes")} variant="outline" className={`rounded-full border-white/10 gap-2 ${filtroActivo === "recientes" ? "bg-purple-900/30 text-purple-400 border-purple-500/30" : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"}`}><Clock size={14} /> Recientes</Button>
        <Button onClick={() => setFiltroActivo("populares")} variant="outline" className={`rounded-full border-white/10 gap-2 ${filtroActivo === "populares" ? "bg-purple-900/30 text-purple-400 border-purple-500/30" : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"}`}><TrendingUp size={14} /> Populares</Button>
        <Button onClick={() => setFiltroActivo("sin-responder")} variant="outline" className={`rounded-full border-white/10 gap-2 ${filtroActivo === "sin-responder" ? "bg-purple-900/30 text-purple-400 border-purple-500/30" : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"}`}><MessageCircleQuestion size={14} /> Sin responder</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(n => (
            <div key={n} className="bg-[#12121a] border border-white/5 rounded-2xl p-5 flex gap-4 h-[100px] items-center">
              <Skeleton className="h-12 w-12 rounded-full bg-white/5" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-5 w-2/3 bg-white/5" /><Skeleton className="h-4 w-1/3 bg-white/5" />
              </div>
            </div>
          ))
        ) : hilos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-[#12121a]/50">
            <MessageSquare size={32} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-semibold text-white/70">Aún no hay discusiones aquí</h3>
          </div>
        ) : (
          hilos.map(hilo => (
            <div key={hilo.id} onClick={() => setHiloSeleccionado(hilo)} className="group flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-[#12121a] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 cursor-pointer transition-all hover:bg-[#151522] shadow-lg">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 bg-purple-600 border border-purple-500/30 shrink-0">
                  <AvatarImage src={hilo.autorAvatarResolvido} />
                  <AvatarFallback className="bg-purple-900 text-purple-200 font-bold">{hilo.autorNombreResolvido?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-400 transition-colors leading-tight">{hilo.titulo}</h3>
                  <p className="text-sm text-gray-400 font-medium">{hilo.autorNombreResolvido}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hilo.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-none text-[10px] px-2 py-0">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 mt-4 sm:mt-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 gap-2">
                <span className="text-xs text-gray-500 flex items-center gap-1.5"><Clock size={12} />{formatearFecha(hilo.fechaCreacion)}</span>
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${hilo.contadorRespuestas > 0 ? "text-purple-400" : "text-gray-500"}`}><MessageSquare size={12} />{hilo.contadorRespuestas} resp.</span>
              </div>

              {hiloSeleccionado && (
                <HiloDetalleModal 
                  hilo={hiloSeleccionado} 
                  onClose={() => setHiloSeleccionado(null)} 
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* 🟢 RENDER DEL MODAL CONDICIONAL */}
      {isModalOpen && (
        <NuevoHiloModal 
          onClose={() => setIsModalOpen(false)} 
          onHiloCreado={() => setRefreshTrigger(prev => prev + 1)} 
        />
      )}
    </div>
  )
}