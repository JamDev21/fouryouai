"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, PlayCircle, BookOpen, MessageSquare, Loader2 } from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/src/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/hooks/useClickOutside";

// Tipos de resultados
type TipoResultado = "usuario" | "video" | "articulo" | "hilo";

interface ResultadoBusqueda {
  id: string;
  titulo: string; // Puede ser el nombre del usuario o el título del post
  subtitulo: string; // Ocupación del usuario o autor del post
  tipo: TipoResultado;
  avatar?: string;
}

export function SearchBar() {
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useClickOutside(containerRef, () => setIsOpen(false));

  useEffect(() => {
    // Si el input está vacío, cerramos el menú y limpiamos
    if (!termino.trim()) {
      setResultados([]);
      setIsOpen(false);
      return;
    }

    // DEBOUNCE: Esperamos 300ms después de que el usuario deje de teclear
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setIsOpen(true);
      
      try {
        const terminoMinusculas = termino.toLowerCase();
        const resultadosTemp: ResultadoBusqueda[] = [];

        // 1. Buscar en Usuarios (Traemos los últimos 30 y filtramos)
        const usuariosSnap = await getDocs(query(collection(db, "usuarios"), limit(30)));
        usuariosSnap.forEach(doc => {
          const data = doc.data();
          const nombre = (data.nombre || "").toLowerCase();
          if (nombre.includes(terminoMinusculas)) {
            resultadosTemp.push({
              id: doc.id,
              titulo: data.nombre,
              subtitulo: data.ocupacion || "Miembro de la comunidad",
              tipo: "usuario",
              avatar: data.fotoPerfil || data.avatar
            });
          }
        });

        // 2. Buscar en Contenidos (Videos y Artículos)
        const contenidosSnap = await getDocs(query(collection(db, "contenidos"), orderBy("fechaCreacion", "desc"), limit(30)));
        contenidosSnap.forEach(doc => {
          const data = doc.data();
          const titulo = (data.titulo || "").toLowerCase();
          const tags = (data.etiquetas || []).map((t: string) => t.toLowerCase()).join(" ");
          
          // Busca en el título o en los tags
          if (titulo.includes(terminoMinusculas) || tags.includes(terminoMinusculas)) {
            resultadosTemp.push({
              id: doc.id,
              titulo: data.titulo,
              subtitulo: `Por ${data.autorNombre}`,
              tipo: data.tipo === "video" ? "video" : "articulo",
              avatar: data.urlMedia
            });
          }
        });

        // 3. Buscar en Hilos de la Comunidad
        const hilosSnap = await getDocs(query(collection(db, "foros_hilos"), orderBy("fechaCreacion", "desc"), limit(30)));
        hilosSnap.forEach(doc => {
          const data = doc.data();
          const titulo = (data.titulo || "").toLowerCase();
          
          if (titulo.includes(terminoMinusculas)) {
            resultadosTemp.push({
              id: doc.id,
              titulo: data.titulo,
              subtitulo: `${data.contadorRespuestas} respuestas`,
              tipo: "hilo"
            });
          }
        });

        // Ordenamos para dar prioridad a coincidencias exactas al inicio
        resultadosTemp.sort((a, b) => {
          const aStart = a.titulo.toLowerCase().startsWith(terminoMinusculas) ? -1 : 1;
          const bStart = b.titulo.toLowerCase().startsWith(terminoMinusculas) ? -1 : 1;
          return aStart - bStart;
        });

        setResultados(resultadosTemp.slice(0, 8)); // Mostramos solo los mejores 8 resultados
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms de retraso

    return () => clearTimeout(timeoutId);
  }, [termino]);

  const handleResultClick = (resultado: ResultadoBusqueda) => {
    setIsOpen(false);
    setTermino(""); // Limpiamos el buscador

    // Redirección inteligente según lo que encontró
    switch (resultado.tipo) {
      case "usuario":
        router.push(`/perfil/${resultado.id}`); // Ajusta a tu ruta de perfiles
        break;
      case "articulo":
      case "video":
        router.push(`/?recurso=${resultado.id}`); // Abre el modal en el dashboard
        break;
      case "hilo":
        router.push(`/comunidad?hilo=${resultado.id}`); // Abre el hilo en la comunidad
        break;
    }
  };

  const getIcon = (tipo: TipoResultado) => {
    switch (tipo) {
      case "usuario": return <User size={14} className="text-blue-400" />;
      case "video": return <PlayCircle size={14} className="text-purple-400" />;
      case "articulo": return <BookOpen size={14} className="text-emerald-400" />;
      case "hilo": return <MessageSquare size={14} className="text-orange-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input de Búsqueda */}
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-gray-400" />
        <input
          type="text"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onFocus={() => termino.trim() && setIsOpen(true)}
          placeholder="     Buscar cursos, temas, docentes..."
          className="w-full bg-[#12121a] border border-white/10 rounded-full pl-12 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder-gray-500"
        />
        {isSearching && (
          <Loader2 size={16} className="absolute right-4 text-purple-400 animate-spin" />
        )}
      </div>

      {/* Menú Desplegable de Resultados */}
      {isOpen && termino.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {resultados.length === 0 && !isSearching ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No se encontraron resultados para "{termino}"
            </div>
          ) : (
            <ul className="max-h-[350px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10">
              {resultados.map((resultado) => (
                <li
                  key={resultado.id + resultado.tipo}
                  onClick={() => handleResultClick(resultado)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                >
                  {/* Icono o Avatar Circular */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 border border-white/5 overflow-hidden shrink-0">
                    {resultado.tipo === "usuario" && resultado.avatar ? (
                      <img src={resultado.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : resultado.tipo === "video" || resultado.articulo ? (
                      <img src={resultado.avatar} alt="thumb" className="w-full h-full object-cover opacity-50" onError={(e) => e.currentTarget.style.display='none'} />
                    ) : null}
                    
                    {/* Si no hay imagen, mostramos el icono */}
                    {(!resultado.avatar || resultado.tipo === "hilo") && getIcon(resultado.tipo)}
                  </div>
                  
                  {/* Textos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{resultado.titulo}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getIcon(resultado.tipo)}
                      <p className="text-[10px] text-gray-400 truncate">{resultado.subtitulo}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {/* Pie del buscador */}
          {resultados.length > 0 && (
            <div className="p-2 border-t border-white/5 bg-black/20 text-center">
              <span className="text-[10px] text-gray-500 font-medium">Búsqueda rápida</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}