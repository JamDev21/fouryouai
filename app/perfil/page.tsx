"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { User, BookOpen, GraduationCap, Tag as TagIcon } from "lucide-react";

// Componente de carga (Skeleton)
const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-32 w-32 rounded-full bg-white/5 mx-auto" />
    <div className="h-8 w-48 bg-white/5 mx-auto rounded" />
    <div className="space-y-3">
      <div className="h-4 w-full bg-white/5 rounded" />
      <div className="h-4 w-3/4 bg-white/5 rounded" />
    </div>
  </div>
);

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de consulta a Firestore usando el UID
    // Aquí conectarás con: doc(db, "usuarios", auth.currentUser.uid)
    const fetchUserData = async () => {
      setLoading(true);
      setTimeout(() => {
        // Simulación de datos recibidos
        setUsuario({
          nombre: "Tu Nombre de Usuario",
          rol: "Estudiante de Ingeniería",
          semestre: "8vo Semestre",
          materias: ["Redes", "Bases de Datos", "Ciberseguridad"],
          tags: ["React", "TypeScript", "UI/UX"]
        });
        setLoading(false);
      }, 1500);
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-white/5 bg-[#11111a] p-8 shadow-2xl">
          
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <div className="space-y-8">
              {/* Encabezado de Perfil */}
              <div className="text-center space-y-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-violet-600 text-white">
                  <User size={48} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{usuario.nombre}</h1>
                  <p className="text-purple-400 font-medium">{usuario.rol}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Información Académica */}
                <div className="space-y-4 rounded-xl bg-white/5 p-6 border border-white/5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <GraduationCap className="text-purple-500" /> Información Académica
                  </h2>
                  <p className="text-sm text-gray-400">Semestre actual: <span className="text-gray-200">{usuario.semestre}</span></p>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Materias cursando:</p>
                    {usuario.materias.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {usuario.materias.map((m: string) => (
                          <span key={m} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-gray-500">No hay materias configuradas.</p>
                    )}
                  </div>
                </div>

                {/* Tags de Intereses */}
                <div className="space-y-4 rounded-xl bg-white/5 p-6 border border-white/5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <TagIcon className="text-purple-500" /> Intereses y Tags
                  </h2>
                  {usuario.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {usuario.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs hover:border-purple-500/50 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">¿Aún no tienes intereses?</p>
                      <button className="mt-2 text-xs text-purple-400 hover:underline">Configurar perfil</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}