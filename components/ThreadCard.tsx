"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../src/lib/firebaseConfig";
import { MessageCircle, Calendar, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import EditarHiloModal from "./EditarHiloModal";
import EliminarHiloModal from "./EliminarHiloModal";
import type { Thread } from "../types/foro";

interface Props {
  thread: Thread;
}

export default function ThreadCard({ thread }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserName(user ? user.displayName : "Usuario");
    });
    return () => unsubscribe();
  }, []);

  const esMio = userName !== null && userName === thread.id_autor;

  const fecha =
    thread.fechaCreacion?.toDate().toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) ?? "Reciente";

  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    thread.id_autor ?? "?",
  )}&backgroundColor=7c3aed&fontSize=38&fontWeight=600&textColor=ffffff`;

  function handleCardClick() {
    router.push(`/comunidad/${thread.id}`);
  }

  function handleOpenDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteOpen(true);
  }

  async function handleConfirmEliminar() {
    try {
      await deleteDoc(doc(db, "foros_hilos", thread.id));
      setDeleteOpen(false);

      toast({
        title: "Hilo eliminado",
        description: "El contenido se ha borrado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar el hilo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el hilo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      {esMio && (
        <>
          <EditarHiloModal
            hilo={thread}
            open={editOpen}
            onClose={() => setEditOpen(false)}
          />

          <EliminarHiloModal
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirmEliminar}
          />
        </>
      )}

      <article
        onClick={handleCardClick}
        className="group relative flex items-start gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.border = "1px solid rgba(124,58,237,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
        }}
      >
        <img
          src={avatar}
          alt={thread.id_autor}
          width={40}
          height={40}
          className="shrink-0 mt-0.5 rounded-full object-cover"
          style={{ border: "2px solid rgba(255,255,255,0.08)" }}
        />

        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold leading-snug line-clamp-2 text-white/90 group-hover:text-purple-300 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {thread.titulo}
          </h3>

          {thread.descripcion && (
            <p
              className="text-xs mt-1 line-clamp-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {thread.descripcion}
            </p>
          )}

          {thread.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {thread.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2 pt-0.5">
          <span
            className="flex items-center gap-1 text-[11px]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <Calendar size={11} />
            {fecha}
          </span>
          <span
            className="flex items-center gap-1 text-[11px]"
            style={{ color: "rgba(167,139,250,0.7)" }}
          >
            <MessageCircle size={11} />
            {thread.contadorRespuestas ?? 0} resp.
          </span>

          {esMio && (
            <div className="flex gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-all"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#a78bfa",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.2)";
                  e.currentTarget.style.border =
                    "1px solid rgba(124,58,237,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                  e.currentTarget.style.border =
                    "1px solid rgba(124,58,237,0.25)";
                }}
              >
                <Pencil size={10} />
                Editar
              </button>

              {(thread.contadorRespuestas === 0 ||
                thread.contadorRespuestas === undefined) && (
                <button
                  onClick={handleOpenDelete}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-all"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#fca5a5",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                    e.currentTarget.style.border =
                      "1px solid rgba(239,68,68,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.border =
                      "1px solid rgba(239,68,68,0.25)";
                  }}
                >
                  <Trash2 size={10} />
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </article>
    </>
  );
}
