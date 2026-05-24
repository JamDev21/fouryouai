"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { useRouter } from "next/navigation";
import { UserPlus, Tag as TagIcon, Upload, X, Search } from "lucide-react"; 

import { MediaUpload } from "@/components/dashboard/media-upload";

// Importaciones reales de Firebase
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebaseConfig";
import { Contenido } from "@/types/contenido";

interface UsuarioBuscado {
  uid: string;
  nombre: string;
}

export default function SubirContenidoPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
  });
  const [mediaUrl, setMediaUrl] = useState("");

  // --- NUEVO: Estado para las etiquetas visuales ---
  const [etiquetasVisuales, setEtiquetasVisuales] = useState<string[]>([]);
  const [inputEtiqueta, setInputEtiqueta] = useState("");

  const [etiquetados, setEtiquetados] = useState<UsuarioBuscado[]>([]);
  const [colaboradores, setColaboradores] = useState<UsuarioBuscado[]>([]);
  
  const [modalBuscador, setModalBuscador] = useState<"etiquetar" | "colaborador" | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<UsuarioBuscado[]>([]);

  const isInvalid = !form.titulo || !form.tipo || etiquetasVisuales.length === 0 || !mediaUrl;

  // --- SOLUCIÓN: Buscador conectado a Firestore real ---
  useEffect(() => {
    const buscarUsuariosReal = async () => {
      if (terminoBusqueda.length > 2) {
        try {
          // Busca usuarios cuyo nombre empiece con lo que estás escribiendo
          const q = query(
            collection(db, "usuarios"),
            where("nombre", ">=", terminoBusqueda),
            where("nombre", "<=", terminoBusqueda + "\uf8ff")
          );
          
          const querySnapshot = await getDocs(q);
          const usuariosEncontrados = querySnapshot.docs.map(doc => ({
            uid: doc.id, // Asumiendo que el ID del documento es el UID
            nombre: doc.data().nombre || "Sin nombre"
          }));
          
          setResultadosBusqueda(usuariosEncontrados);
        } catch (error) {
          console.error("Error al buscar en Firebase:", error);
        }
      } else {
        setResultadosBusqueda([]);
      }
    };

    buscarUsuariosReal();
  }, [terminoBusqueda]);

  // --- SOLUCIÓN: Lógica de Etiquetas (Presionar Enter) ---
  const agregarEtiqueta = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si presiona Enter o Coma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const nuevaEtiqueta = inputEtiqueta.trim();
      
      if (nuevaEtiqueta !== "" && !etiquetasVisuales.includes(nuevaEtiqueta)) {
        setEtiquetasVisuales([...etiquetasVisuales, nuevaEtiqueta]);
      }
      setInputEtiqueta(""); // Limpiar el input
    }
  };

  const removerEtiqueta = (tag: string) => {
    setEtiquetasVisuales(etiquetasVisuales.filter(t => t !== tag));
  };

  const seleccionarUsuario = (usuario: UsuarioBuscado) => {
    if (modalBuscador === "etiquetar") {
      if (!etiquetados.find(e => e.uid === usuario.uid)) {
        setEtiquetados([...etiquetados, usuario]);
      }
    } else if (modalBuscador === "colaborador") {
      if (!colaboradores.find(c => c.uid === usuario.uid)) {
        setColaboradores([...colaboradores, usuario]);
      }
    }
    setModalBuscador(null);
    setTerminoBusqueda("");
  };

  const removerUsuario = (uid: string, tipo: "etiquetar" | "colaborador") => {
    if (tipo === "etiquetar") {
      setEtiquetados(etiquetados.filter(e => e.uid !== uid));
    } else {
      setColaboradores(colaboradores.filter(c => c.uid !== uid));
    }
  };

  const handleGuardar = async () => {
    try {
      const usuarioLogueado = auth.currentUser;
      
      const contenidoFinal: Contenido = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: form.tipo,
        etiquetas: etiquetasVisuales, // Pasamos el array de etiquetas visuales
        urlMedia: mediaUrl,
        autorId: usuarioLogueado?.uid || "anonimo",
        autorNombre: usuarioLogueado?.displayName || "Usuario Anónimo",
        etiquetados: etiquetados.map(e => e.uid),
        colaboradores: colaboradores.map(c => c.uid),
        fechaCreacion: serverTimestamp() as any, 
        vistas: 0,
        likes: 0
      };
      
      await addDoc(collection(db, "contenidos"), contenidoFinal);
      
      alert("¡Contenido publicado con éxito en la base de datos!"); 
      router.push("/");
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
      alert("Hubo un error al guardar el contenido. Revisa la consola.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 relative">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Aportar recursos</h1>
          <p className="text-gray-400">Comparte conocimiento con la comunidad de Fouryou.ai</p>
        </div>

        <div className="space-y-6 rounded-2xl border border-white/5 bg-[#11111a] p-8 shadow-xl">
          
          <div>
            <label className="mb-2 block text-sm font-medium">Título del recurso</label>
            <input 
              type="text"
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
              placeholder="Ej: Pentesting con Metasploit"
              onChange={(e) => setForm({...form, titulo: e.target.value})}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Descripción corta</label>
            <textarea 
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
              rows={3}
              placeholder="¿De qué trata este recurso?"
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tipo de contenido</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
                value={form.tipo}
                onChange={(e) => {
                  setForm({...form, tipo: e.target.value});
                  setMediaUrl(""); // Limpiamos la URL al cambiar de tipo
                }}
              >
                <option value="">Seleccionar...</option>
                <option value="video">Video Corto</option>
                <option value="articulo">Artículo Corto</option>
                <option value="curso">Curso</option>
                <option value="podcast">Podcast</option>
                <option value="paper">Paper / PDF</option>
                <option value="proyecto">Proyecto / Repo</option>
              </select>
            </div>

            {/* SECCIÓN DE ETIQUETAS */}
            <div>
              <label className="mb-2 block text-sm font-medium">Etiquetas (Presiona Enter)</label>
              <div className="w-full rounded-lg border border-white/10 bg-black/40 p-2 focus-within:border-purple-500 flex flex-wrap gap-2">
                {etiquetasVisuales.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-purple-600/30 text-purple-300 px-2 py-1 rounded text-xs">
                    {tag}
                    <button onClick={() => removerEtiqueta(tag)} className="hover:text-white"><X size={12} /></button>
                  </span>
                ))}
                <input 
                  type="text"
                  className="bg-transparent outline-none flex-1 min-w-[100px] text-sm p-1"
                  placeholder={etiquetasVisuales.length === 0 ? "Ej: Python, IA..." : ""}
                  value={inputEtiqueta}
                  onChange={(e) => setInputEtiqueta(e.target.value)}
                  onKeyDown={agregarEtiqueta}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="mb-2 block text-sm font-medium text-white">
              {["video", "articulo"].includes(form.tipo) 
                ? "Sube tu archivo a Fouryou" 
                : "Enlace externo al recurso"}
            </label>

            {form.tipo === "" ? (
              <div className="rounded-xl border-2 border-dashed border-gray-800 bg-[#0a0a0f]/50 p-10 text-center text-sm text-gray-500">
                ⚠️ Primero selecciona el "Tipo de contenido" arriba.
              </div>
            ) : ["video", "articulo"].includes(form.tipo) ? (
              mediaUrl ? (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                  <span className="text-green-400 font-medium">✅ Archivo subido correctamente</span>
                </div>
              ) : (
                <MediaUpload 
                  type={form.tipo === "video" ? "video" : "image"} 
                  onUploadSuccess={(url) => setMediaUrl(url)} 
                />
              )
            ) : (
              <input 
                type="url"
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
                placeholder={`Pega aquí el enlace de tu ${form.tipo}...`}
                onChange={(e) => setMediaUrl(e.target.value)} // Guardamos el link en mediaUrl para reutilizar el estado
              />
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex gap-4 py-2">
              <button 
                onClick={() => setModalBuscador("etiquetar")}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition"
              >
                <TagIcon size={18} /> Etiquetar persona
              </button>
              <button 
                onClick={() => setModalBuscador("colaborador")}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition"
              >
                <UserPlus size={18} /> Invitar colaborador
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {etiquetados.map((u) => (
                <div key={`etiq-${u.uid}`} className="flex items-center gap-2 bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/30">
                  <TagIcon size={12} /> {u.nombre}
                  <button onClick={() => removerUsuario(u.uid, "etiquetar")} className="hover:text-white ml-1"><X size={12} /></button>
                </div>
              ))}
              {colaboradores.map((u) => (
                <div key={`col-${u.uid}`} className="flex items-center gap-2 bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-xs border border-indigo-500/30">
                  <UserPlus size={12} /> {u.nombre} (Colab)
                  <button onClick={() => removerUsuario(u.uid, "colaborador")} className="hover:text-white ml-1"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="mb-2 block text-sm font-medium text-white">
              {form.tipo === "video" ? "Sube tu Video (MP4)" : form.tipo === "articulo" ? "Sube una Portada (JPG/PNG)" : "Archivo Media"}
            </label>

            {form.tipo === "" ? (
              <div className="rounded-xl border-2 border-dashed border-gray-800 bg-[#0a0a0f]/50 p-10 text-center text-sm text-gray-500">
                ⚠️ Primero selecciona el "Tipo de contenido" arriba.
              </div>
            ) : mediaUrl ? (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                <span className="text-green-400 font-medium">
                  ✅ Archivo subido a Cloudinary correctamente
                </span>
              </div>
            ) : (
              <MediaUpload 
                type={form.tipo === "video" ? "video" : "image"} 
                onUploadSuccess={(url) => setMediaUrl(url)} 
              />
            )}
          </div>

          <button
            onClick={handleGuardar}
            disabled={isInvalid}
            className={`w-full rounded-xl py-4 font-bold text-white transition-all ${
              isInvalid 
                ? "cursor-not-allowed bg-gray-800 opacity-50" 
                : "bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
            }`}
          >
            Publicar Contenido
          </button>
        </div>
      </main>

      {/* Modal Buscador */}
      {modalBuscador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#11111a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {modalBuscador === "etiquetar" ? "Etiquetar a alguien" : "Añadir colaborador"}
              </h3>
              <button onClick={() => setModalBuscador(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre (sensible a mayúsculas)..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {terminoBusqueda.length <= 2 ? (
                <p className="text-center text-sm text-gray-500 py-4">Escribe al menos 3 letras...</p>
              ) : resultadosBusqueda.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">No se encontraron usuarios.</p>
              ) : (
                resultadosBusqueda.map((user) => (
                  <div 
                    key={user.uid} 
                    onClick={() => seleccionarUsuario(user)}
                    className="flex items-center gap-3 p-3 bg-black/40 hover:bg-purple-900/20 border border-transparent hover:border-purple-500/30 rounded-xl cursor-pointer transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.nombre.substring(0,2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-200">{user.nombre}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}