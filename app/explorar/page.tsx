"use client"

import { useState, useEffect, Suspense } from "react"
import { Navbar } from "@/components/dashboard/navbar"
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/src/lib/firebaseConfig"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"
import { BookOpen, Mic2, FileText, Code2, GraduationCap } from "lucide-react"

const CATEGORIAS = [
  { id: "curso", label: "Cursos", icon: GraduationCap },
  { id: "podcast", label: "Podcasts", icon: Mic2 },
  { id: "paper", label: "Papers/PDF", icon: FileText },
  { id: "proyecto", label: "Proyectos", icon: Code2 }
];

function ExplorarContent() {
  const searchParams = useSearchParams();
  const filtroTipo = searchParams.get("tipo"); 
  const tagFiltro = searchParams.get("etiqueta");
  const [contenidos, setContenidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarRecursos = async () => {
      setLoading(true);
      try {
        // 1. Obtener intereses del usuario
        let misIntereses: Record<string, number> = {};
        const miUid = auth.currentUser?.uid;
        if (miUid) {
          const userDoc = await getDoc(doc(db, "usuarios", miUid));
          misIntereses = userDoc.data()?.vectorIntereses || {};
        }

        // 2. Query dinámica (AQUÍ CORREGIMOS LA LÓGICA)
        const baseQuery = collection(db, "contenidos");
        let q;

        if (tagFiltro) {
          // Buscamos recursos que tengan ese tag en su array
          q = query(baseQuery, where("etiquetas", "array-contains", tagFiltro), orderBy("fechaCreacion", "desc"));
        } else if (filtroTipo) {
          q = query(baseQuery, where("tipo", "==", filtroTipo), orderBy("fechaCreacion", "desc"));
        } else {
          q = query(baseQuery, where("tipo", "in", ["curso", "podcast", "paper", "proyecto"]), orderBy("fechaCreacion", "desc"));
        }

        const snapshot = await getDocs(q);
        
        // 3. Motor de Recomendación
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          const etiquetas = docData.etiquetas || [];
          
          let score = 0;
          etiquetas.forEach((tag: string) => {
            if (misIntereses[tag]) score += misIntereses[tag];
          });

          return { id: doc.id, ...docData, score };
        });

        data.sort((a, b) => b.score - a.score);
        setContenidos(data);
      } catch (e) {
        console.error("Error al explorar:", e);
      } finally {
        setLoading(false);
      }
    };
    
    cargarRecursos();
  }, [filtroTipo, tagFiltro]);  

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          {tagFiltro ? `Explorando #${tagFiltro}` : "Explorar Recursos"}
        </h1>
        <p className="text-gray-400 mb-10">
          {filtroTipo ? `Resultados para: ${filtroTipo}` : "Material de estudio profundo y proyectos destacados."}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-64 rounded-2xl bg-white/5" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIAS.map((cat) => {
              // Si hay un filtro (ej. ?tipo=curso), solo mostramos esa categoría
              if (filtroTipo && filtroTipo !== cat.id) return null;

              const items = contenidos.filter(c => c.tipo === cat.id);
              return (
                <div key={cat.id} className="space-y-4">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                    <cat.icon className="text-purple-500" /> {cat.label}
                  </h2>
                  
                  {items.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-gray-600">
                      Sin recursos en esta categoría...
                    </div>
                  ) : (
                    items.map(item => (
                      <div key={item.id} className="bg-[#11111a] p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group">
                        {/* Indicador visual de IA */}
                        {item.score > 0 && (
                          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2 block">★ Recomendado</span>
                        )}
                        <h3 className="font-semibold text-sm text-white mb-1 line-clamp-1">{item.titulo}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{item.descripcion}</p>
                        <a href={item.urlMedia} target="_blank" className="mt-3 block text-xs font-bold text-purple-400 hover:text-purple-300">
                          Ir al recurso →
                        </a>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <ExplorarContent />
    </Suspense>
  )
}