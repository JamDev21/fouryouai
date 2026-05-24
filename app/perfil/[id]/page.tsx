"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { db, auth, storage } from "@/src/lib/firebaseConfig"; 
import { doc, getDoc, updateDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { User, GraduationCap, Tag as TagIcon, AlertCircle, Edit2, Save, X, Camera, Loader2, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function PerfilDinamicoPage() {
  const params = useParams();
  const perfilId = params.id as string; // El ID de la persona que estamos visitando

  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Estados de interacción
  const [esMiPerfil, setEsMiPerfil] = useState(false);
  const [loSigo, setLoSigo] = useState(false);
  const [isFollowingAction, setIsFollowingAction] = useState(false);

  // Estados de edición (Solo dueños)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    nombre: "",
    rol: "",
    semestreActual: "",
    materiasText: "",
    interesesText: ""
  });

  useEffect(() => {
    // Escuchamos de forma segura la autenticación sin generar falsos errores previos
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!perfilId) return;

      try {
        // 1. Validamos si el perfil que visito es el mío
        const miUid = currentUser?.uid;
        const propiedad = miUid === perfilId;
        setEsMiPerfil(propiedad);

        // 2. Traer los datos del perfil desde Firestore
        const docRef = doc(db, "usuarios", perfilId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsuario(data);
          
          // Rellenamos el formulario por si somos dueños y queremos editar
          setEditForm({
            nombre: data.nombre || "",
            rol: data.rol || "Estudiante",
            semestreActual: data.semestreActual || "N/A",
            materiasText: data.materiasCursando ? data.materiasCursando.join(", ") : "",
            interesesText: data.vectorIntereses ? Object.keys(data.vectorIntereses).join(", ") : ""
          });

          // 3. Si NO es mi perfil, verificamos en tiempo real si ya lo sigo
          if (!propiedad && miUid) {
            const siguiendoRef = doc(db, "usuarios", miUid, "siguiendo", perfilId);
            const siguiendoSnap = await getDoc(siguiendoRef);
            setLoSigo(siguiendoSnap.exists());
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [perfilId]);

  // FUNCIÓN PARA SEGUIR / DEJAR DE SEGUIR
  const handleToggleSeguir = async () => {
    const miUserId = auth.currentUser?.uid;
    if (!miUserId) return alert("Inicia sesión para seguir usuarios.");

    setIsFollowingAction(true);
    const miSiguiendoRef = doc(db, "usuarios", miUserId, "siguiendo", perfilId);
    const susSeguidoresRef = doc(db, "usuarios", perfilId, "seguidores", miUserId);

    try {
      if (loSigo) {
        await deleteDoc(miSiguiendoRef);
        await deleteDoc(susSeguidoresRef);
        setLoSigo(false);
      } else {
        await setDoc(miSiguiendoRef, { fecha: serverTimestamp() });
        await setDoc(susSeguidoresRef, { fecha: serverTimestamp() });
        setLoSigo(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFollowingAction(false);
    }
  };

  // GUARDAR EDICIÓN (Solo Dueños)
  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);

    try {
      const materiasArray = editForm.materiasText.split(",").map(m => m.trim()).filter(m => m.length > 0);
      const interesesArray = editForm.interesesText.split(",").map(i => i.trim().toLowerCase().replace("#", "")).filter(i => i.length > 0);
      const vectorInteresesObj: Record<string, number> = {};
      interesesArray.forEach(i => { vectorInteresesObj[i] = 1; });

      const docRef = doc(db, "usuarios", auth.currentUser.uid);
      const payload = {
        nombre: editForm.nombre,
        rol: editForm.rol,
        semestreActual: editForm.semestreActual,
        materiasCursando: materiasArray,
        vectorIntereses: vectorInteresesObj
      };

      await updateDoc(docRef, payload);
      setUsuario((prev: any) => ({ ...prev, ...payload }));
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

 //  FUNCIÓN DE SUBIDA ADAPTADA A TU SISTEMA SEGURO DE CLOUDINARY
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUploadingPhoto(true);
    try {
      // 1. Obtener timestamp para la firma
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      // 2. Pedir firma a tu API interna
      const signResponse = await fetch("/api/cloudinary-sign", {
        method: "POST",
        body: JSON.stringify({ paramsToSign: { timestamp } }),
      });

      if (!signResponse.ok) {
        throw new Error("No se pudo obtener la firma de seguridad");
      }

      const { signature } = await signResponse.json();

      // 3. Subir a Cloudinary con los datos firmados
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.error?.message || "Error al subir a Cloudinary");
      }

      const data = await res.json();
      const photoURL = data.secure_url; 

      // 4. Actualizar Firebase y la interfaz
      const docRef = doc(db, "usuarios", auth.currentUser.uid);
      await updateDoc(docRef, { fotoPerfil: photoURL, avatar: photoURL });
      
      setUsuario((prev: any) => ({ ...prev, fotoPerfil: photoURL, avatar: photoURL }));
      
    } catch (error: any) {
      console.error("Error en subida:", error);
      alert(`Error al subir imagen: ${error.message}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p>No se pudo encontrar o cargar el perfil solicitado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-white/5 bg-[#11111a] p-8 shadow-2xl relative">
          
          {/* BOTÓN EDITAR: Solo si es MI perfil y NO estoy editando */}
          {esMiPerfil && !loading && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="ghost" className="absolute top-6 right-6 text-gray-400 hover:text-white hover:bg-white/5 gap-2 rounded-xl">
              <Edit2 size={16} /> Editar Perfil
            </Button>
          )}

          {/* BOTÓN SEGUIR: Solo si NO es mi perfil y terminó de cargar */}
          {!esMiPerfil && !loading && (
            <Button 
              onClick={handleToggleSeguir} disabled={isFollowingAction}
              className={`absolute top-6 right-6 rounded-full px-5 py-2 font-bold transition-all flex items-center gap-2 ${
                loSigo ? "bg-white/10 text-white border border-white/10 hover:bg-white/20" : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {isFollowingAction ? <Loader2 className="animate-spin w-4 h-4" /> :
               loSigo ? <><UserCheck size={14} /> Siguiendo</> : <><UserPlus size={14} /> Seguir</>}
            </Button>
          )}
          
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <div className="space-y-8 mt-4">
              
              {/* Avatar e Identidad */}
              <div className="flex flex-col items-center space-y-4 pt-4">
                <div className="relative group mx-auto flex items-center justify-center">
                  
                  {/*  Foto blindada con medidas exactas en línea (style) para evitar que desaparezca */}
                  <div 
                    className="relative overflow-hidden rounded-full border-4 border-[#12121a] shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-[#12121a]"
                    style={{ width: "160px", height: "160px", minWidth: "160px", minHeight: "160px" }}
                  >
                    {(usuario?.fotoPerfil || usuario?.avatar) ? (
                      <img 
                        src={usuario.fotoPerfil || usuario.avatar} 
                        alt="Perfil" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <User size={64} className="text-gray-600" />
                      </div>
                    )}

                    {/* Capa oscura para cambiar foto (Sólo tú editando) */}
                    {esMiPerfil && isEditing && (
                      <div 
                        onClick={() => !isUploadingPhoto && fileInputRef.current?.click()} 
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        {isUploadingPhoto ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera size={24} className="text-white" />}
                      </div>
                    )}
                  </div>
                  
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>

                {/* Textos o Inputs según el modo */}
                {isEditing ? (
                  <div className="w-full max-w-sm space-y-3 text-center mt-2">
                    <input type="text" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center text-xl font-bold text-white focus:border-purple-500/50 outline-none" />
                    <input type="text" value={editForm.rol} onChange={e => setEditForm({...editForm, rol: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center text-sm text-purple-400 focus:border-purple-500/50 outline-none" />
                  </div>
                ) : (
                  <div className="text-center mt-2">
                    <h1 className="text-3xl font-bold text-white capitalize">{usuario?.nombre || "Usuario"}</h1>
                    <p className="text-purple-400 font-medium capitalize">{usuario?.rol || "Estudiante"}</p>
                  </div>
                )}
              </div>

              {/* Paneles de Información */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-xl bg-white/5 p-6 border border-white/5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><GraduationCap className="text-purple-500" /> Información Académica</h2>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500">Semestre Actual</label>
                        <input type="text" value={editForm.semestreActual} onChange={e => setEditForm({...editForm, semestreActual: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Materias (separadas por coma)</label>
                        <textarea value={editForm.materiasText} onChange={e => setEditForm({...editForm, materiasText: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 resize-none" rows={3} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400">Semestre actual: <span className="text-gray-200">{usuario?.semestreActual || "N/A"}</span></p>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Materias cursando:</p>
                        {usuario?.materiasCursando?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {usuario.materiasCursando.map((m: string, i: number) => <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">{m}</span>)}
                          </div>
                        ) : <p className="text-xs italic text-gray-500">No hay materias configuradas.</p>}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4 rounded-xl bg-white/5 p-6 border border-white/5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><TagIcon className="text-purple-500" /> Intereses y Tags</h2>
                  {isEditing ? (
                    <div>
                      <label className="text-xs text-gray-500">Intereses (separados por coma)</label>
                      <textarea value={editForm.interesesText} onChange={e => setEditForm({...editForm, interesesText: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1 resize-none" rows={4} />
                    </div>
                  ) : (
                    usuario?.vectorIntereses && Object.keys(usuario.vectorIntereses).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(usuario.vectorIntereses).map(interest => <span key={interest} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">#{interest}</span>)}
                      </div>
                    ) : <p className="text-xs italic text-gray-500">No hay intereses configurados.</p>
                  )}
                </div>
              </div>

              {/* Botones de acción de guardado */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white rounded-xl"><X size={16} className="mr-2" /> Cancelar</Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg"><Save size={16} className="mr-2" /> {isSaving ? "Guardando..." : "Guardar Cambios"}</Button>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}