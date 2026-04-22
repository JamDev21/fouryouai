"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
// RUTA EXACTA A TU FIREBASE DESDE ESTA PÁGINA:
import { db, auth } from "../../src/lib/firebaseConfig"; 
// RUTAS A TUS COMPONENTES Y TIPOS:
import ThreadCard from "../../components/ThreadCard";
import NuevoHiloModal from "../../components/NuevoHiloModal";
import type { Thread } from "../../types/foro";
import { MessageSquarePlus, Clock, TrendingUp, HelpCircle } from "lucide-react";

type Tab = "recientes" | "populares" | "sin-responder";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "recientes",     label: "Recientes",     icon: <Clock size={12} /> },
  { id: "populares",     label: "Populares",     icon: <TrendingUp size={12} /> },
  { id: "sin-responder", label: "Sin responder", icon: <HelpCircle size={12} /> },
];

export default function ComunidadPage() {
  const [hilos, setHilos] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("recientes");
  const [modalOpen, setModalOpen] = useState(false);
  const [userName, setUserName] = useState("Cesar Pacheco");
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Cesar Pacheco");
        setUserAvatar(user.photoURL || "");
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "foros_hilos"), orderBy("fechaCreacion", "desc"));
    const unsubscribeDB = onSnapshot(q, (snapshot) => {
      const dbData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Thread[];
      setHilos(dbData);
      setLoading(false);
    });
    return () => unsubscribeDB();
  }, []);

  const hilosFiltrados = hilos.filter((h) => {
    if (tab === "populares") return (h.contadorRespuestas ?? 0) > 5;
    if (tab === "sin-responder") return (h.contadorRespuestas ?? 0) === 0;
    return true;
  });

  return (
    <main className="min-h-screen text-white bg-[#0B0B0F]">
      <NuevoHiloModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        autorNombre={userName}
        autorAvatarUrl={userAvatar}
      />

      <div className="sticky top-0 z-20" style={{ background: "rgba(11,11,15,0.88)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Comunidad</h1>
            <p className="text-xs text-white/35 mt-0.5">Discusiones académicas · tiempo real</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 text-white text-sm font-medium rounded-xl px-4 py-2 bg-purple-600 hover:bg-purple-500 transition-colors duration-150">
              <MessageSquarePlus size={15} />
              Nuevo hilo
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 pb-3 flex gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-150"
              style={tab === t.id ? { background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.45)", color: "#a78bfa" } : { border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-center text-white/20 text-sm py-10 italic">Cargando...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {hilosFiltrados.map((hilo) => (
              <ThreadCard key={hilo.id} thread={hilo} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}