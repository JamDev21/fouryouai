"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
// Ruta directa al archivo de Firebase en src/lib
import { db } from "../../src/lib/firebaseConfig"; 
import ThreadCard from "../../components/ThreadCard";
import { MessageSquarePlus, Sparkles, Clock, TrendingUp, HelpCircle } from "lucide-react";

export interface Thread {
  id: string;
  titulo: string;
  autor: {
    nombre: string;
    avatarUrl: string;
  };
  tags: string[];
  fecha: { seconds: number };
  respuestasCount: number;
}

type FilterTab = "recientes" | "populares" | "sin-responder";

export default function ComunidadPage() {
  const [hilos, setHilos] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("recientes");

  useEffect(() => {
    // Conexión real con la colección de Jona
    const q = query(collection(db, "foros_hilos"), orderBy("fecha", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Thread[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Thread, "id">),
      }));
      setHilos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hilosFiltrados = hilos.filter((h) => {
    if (tab === "populares") return h.respuestasCount > 5;
    if (tab === "sin-responder") return h.respuestasCount === 0;
    return true;
  });

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    { id: "recientes", label: "Recientes", icon: <Clock size={13} /> },
    { id: "populares", label: "Populares", icon: <TrendingUp size={13} /> },
    { id: "sin-responder", label: "Sin responder", icon: <HelpCircle size={13} /> },
  ];

  return (
    <main className="min-h-screen text-white bg-[#0B0B0F]" style={{ fontFamily: "sans-serif" }}>
      <div className="sticky top-0 z-20 bg-[#0B0B0F]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Comunidad</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Live Updates</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <MessageSquarePlus size={16} />
            Nuevo hilo
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 pb-3 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
                tab === t.id ? "bg-purple-500/10 border-purple-500/40 text-purple-400" : "border-white/5 text-white/40"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
          </div>
        ) : hilosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center py-20 opacity-40">
            <Sparkles size={40} className="mb-4" />
            <p>Aún no hay discusiones aquí.</p>
          </div>
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