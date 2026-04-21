"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "../../src/lib/firebaseConfig"; 
import ThreadCard from "../../components/ThreadCard";
import NotificationBell from "../../components/NotificationBell"; // <-- Aquí importamos la campana
import type { Thread } from "../../types/foro";
import { MessageSquarePlus, Sparkles, Clock, TrendingUp, HelpCircle } from "lucide-react";

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

  useEffect(() => {
    const q = query(collection(db, "foros_hilos"), orderBy("fecha", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbData: Thread[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Thread, "id">),
      }));

      if (dbData.length === 0) {
        setHilos([
          {
            id: "demo-1",
            titulo: "¡Diseño de comunidad de Cesar terminado! 🚀",
            autor: { nombre: "Cesar Pacheco", avatarUrl: "" },
            tags: ["ingenieria", "react"],
            fecha: Timestamp.now(),
            respuestasCount: 12
          }
        ]);
      } else {
        setHilos(dbData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hilosFiltrados = hilos.filter((h) => {
    if (tab === "populares") return (h.respuestasCount ?? 0) > 5;
    if (tab === "sin-responder") return (h.respuestasCount ?? 0) === 0;
    return true;
  });

  return (
    <main className="min-h-screen text-white bg-[#0B0B0F]">
      <div className="sticky top-0 z-20" style={{ background: "rgba(11,11,15,0.88)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Comunidad</h1>
            <p className="text-xs text-white/35 mt-0.5">Discusiones académicas · tiempo real</p>
          </div>
          
          {/* ── AQUÍ METIMOS LA CAMPANA JUNTO AL BOTÓN ── */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button className="flex items-center gap-2 text-white text-sm font-medium rounded-xl px-4 py-2 bg-purple-600 hover:bg-purple-500 transition-colors duration-150">
              <MessageSquarePlus size={15} />
              Nuevo hilo
            </button>
          </div>

        </div>

        <div className="max-w-3xl mx-auto px-6 pb-3 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-150"
              style={
                tab === t.id
                  ? { background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.45)", color: "#a78bfa" }
                  : { border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-3">
          {hilosFiltrados.map((hilo) => (
            <ThreadCard key={hilo.id} thread={hilo} />
          ))}
        </div>
      </div>
    </main>
  );
}