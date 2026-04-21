"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { db, auth } from "@/src/lib/firebaseConfig"; // Asegúrate de que esta ruta a tu config de Firebase sea correcta
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { User, GraduationCap, Tag as TagIcon, AlertCircle } from "lucide-react";

// Componente Skeleton para la carga
const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-24 w-24 rounded-full bg-white/10" />
      <div className="h-8 w-64 bg-white/10 rounded" />
      <div className="h-4 w-40 bg-white/10 rounded" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="h-40 bg-white/5 rounded-xl" />
      <div className="h-40 bg-white/5 rounded-xl" />
    </div>
  </div>
);

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Escuchar el estado de la autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Referencia al documento usando el UID del usuario logueado
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUsuario(docSnap.data());
          } else {
            console.log("No se encontró el documento del usuario");
            setError(true);
          }
        } catch (err) {
          console.error("Error al obtener datos:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      } else {
        // Si no hay usuario, podrías redirigir al login
        setLoading(false);
        setError(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p>No se pudo cargar la información del perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-white/5 bg-[#11111a] p-8 shadow-2xl">
          
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <div className="space-y-8">
              {/* Encabezado con datos de Firebase */}
              <div className="text-center space-y-4">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20">
                  <User size={48} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white capitalize">
                    {usuario?.nombre || "Usuario"}
                  </h1>
                  <p className="text-purple-400 font-medium capitalize">
                    {usuario?.rol || "Estudiante"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Información Académica */}
                <div className="space-y-4 rounded-xl bg-white/5 p-6 border border-white/5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <GraduationCap className="text-purple-500" /> Información Académica
                  </h2>
                  <p className="text-sm text-gray-400">
                    Semestre actual: <span className="text-gray-200">{usuario?.semestreActual || "N/A"}</span>
                  </p>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Materias cursando:</p>
                    {usuario?.materiasCursando && usuario.materiasCursando.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {usuario.materiasCursando.map((materia: string, index: number) => (
                          <span key={index} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                            {materia}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-gray-500">No tienes materias configuradas.</p>
                    )}
                  </div>
                </div>

                {/* Intereses (mapeo del objeto vectorIntereses) */}
                <div className="space-y-4 rounded-xl bg-white/5 p-6 border border-white/5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <TagIcon className="text-purple-500" /> Intereses y Tags
                  </h2>
                  {usuario?.vectorIntereses && Object.keys(usuario.vectorIntereses).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(usuario.vectorIntereses).map((interest) => (
                        <span key={interest} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs hover:border-purple-500/50 transition-colors">
                          #{interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-sm text-gray-500 mb-3">No tienes intereses configurados.</p>
                      <button className="text-xs text-purple-400 hover:underline font-medium">
                        + Configurar mi perfil
                      </button>
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