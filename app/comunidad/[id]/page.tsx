"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../src/lib/firebaseConfig";
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Pencil,
  Send,
  Loader2,
  Check,
  MoreVertical,
  Trash2,
  Flag,
} from "lucide-react";
import type { Thread } from "../../../types/foro";
import EditarHiloModal from "../../../components/EditarHiloModal";

interface Respuesta {
  id: string;
  contenido: string;
  id_autor: string;
  editado?: boolean;
  reportado?: boolean;
  fechaCreacion: { seconds: number };
}

function Avatar({ uid, size = 40 }: { uid: string; size?: number }) {
  const initials = uid?.slice(0, 2).toUpperCase() ?? "??";
  const colors = ["#7C3AED", "#0f766e", "#b45309", "#1d4ed8", "#be185d"];
  const color = colors[uid?.charCodeAt(0) % colors.length] ?? "#7C3AED";
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.3 }}
    >
      {initials}
    </div>
  );
}

export default function HiloPage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const router = useRouter();
  const auth = getAuth();
  
  const userIdentifier = auth.currentUser?.displayName ?? null;
  const realUid = auth.currentUser?.uid ?? null;

  const [hilo, setHilo] = useState<Thread | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loadingHilo, setLoadingHilo] = useState(true);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "foros_hilos", id)).then((snap) => {
      if (snap.exists()) {
        setHilo({ id: snap.id, ...snap.data() } as Thread);
      }
      setLoadingHilo(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "foros_respuestas"),
      orderBy("fechaCreacion", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Respuesta & { id_hilo?: string }))
        .filter((r) => r.id_hilo === id);
      setRespuestas(data);
    });
    return () => unsub();
  }, [id]);

  async function handleEnviar() {
    if (!respuesta.trim() || !userIdentifier || !id) return;
    setEnviando(true);
    try {
      await addDoc(collection(db, "foros_respuestas"), {
        id_hilo: id,
        contenido: respuesta.trim(),
        id_autor: userIdentifier,
        fechaCreacion: serverTimestamp(),
      });
      await updateDoc(doc(db, "foros_hilos", id), {
        contadorRespuestas: increment(1),
      });
      setRespuesta("");
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEditarRespuesta(respId: string, nuevoContenido: string) {
    try {
      await updateDoc(doc(db, "foros_respuestas", respId), {
        contenido: nuevoContenido,
        editado: true,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEliminarRespuesta(respId: string) {
    if (!window.confirm("¿Estás seguro de eliminar tu respuesta?")) return;
    try {
      await deleteDoc(doc(db, "foros_respuestas", respId));
      await updateDoc(doc(db, "foros_hilos", id), {
        contadorRespuestas: increment(-1),
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReportarRespuesta(respId: string) {
    if (!realUid) return;
    try {
      await addDoc(collection(db, "reportes"), {
        tipo: "respuesta",
        id_contenido: respId,
        id_hilo: id,
        id_reportador: realUid,
        fecha: serverTimestamp(),
        estado: "pendiente",
      });
      alert("Reporte enviado. Nuestro equipo lo revisará.");
    } catch (err) {
      console.error(err);
    }
  }

  const esMio = userIdentifier !== null && hilo?.id_autor === userIdentifier;

  if (loadingHilo) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0F" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "#7C3AED" }} />
      </main>
    );
  }

  if (!hilo) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0B0B0F" }}>
        <p className="text-white/50 text-lg">Este hilo no existe.</p>
        <button onClick={() => router.push("/comunidad")} className="text-purple-400 text-sm underline">
          Volver a la comunidad
        </button>
      </main>
    );
  }

  const fecha = hilo.fechaCreacion?.toDate?.()?.toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  }) ?? "Reciente";

  return (
    <main className="min-h-screen text-white" style={{ background: "#0B0B0F", fontFamily: "'DM Sans', sans-serif" }}>
      {esMio && (
        <EditarHiloModal
          hilo={hilo}
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            getDoc(doc(db, "foros_hilos", id)).then((snap) => {
              if (snap.exists()) setHilo({ id: snap.id, ...snap.data() } as Thread);
            });
          }}
        />
      )}

      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3"
        style={{ background: "rgba(11,11,15,0.88)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => router.push("/comunidad")}
          className="flex items-center gap-2 text-sm transition-colors px-3 py-1.5 rounded-lg"
          style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ArrowLeft size={14} /> Comunidad
        </button>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
        <span className="text-sm truncate max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{hilo.titulo}</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="rounded-2xl p-6 mb-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 mb-5">
            <Avatar uid={hilo.id_autor} size={44} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white">{hilo.id_autor}</span>
                {esMio && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", color: "#a78bfa" }}>Tú</span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {fecha} {hilo.categoria && <> · <span style={{ color: "#a78bfa" }}>{hilo.categoria}</span></>}
              </p>
            </div>
            {esMio && (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all shrink-0"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.2)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"; }}
              >
                <Pencil size={11} /> Editar
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>{hilo.titulo}</h1>
          {hilo.descripcion && <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)", whiteSpace: "pre-wrap" }}>{hilo.descripcion}</p>}
          {hilo.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {hilo.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.38)" }}>#{tag}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}><Calendar size={12} />{fecha}</span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(167,139,250,0.7)" }}><MessageCircle size={12} />{respuestas.length} respuestas</span>
          </div>
        </div>

        {respuestas.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Syne', sans-serif" }}>
              <MessageCircle size={13} /> {respuestas.length} {respuestas.length === 1 ? "respuesta" : "respuestas"}
            </h2>
            <div className="flex flex-col gap-0">
              {respuestas.map((resp, i) => (
                <RespuestaItem
                  key={resp.id}
                  resp={resp}
                  isLast={i === respuestas.length - 1}
                  uid={userIdentifier}
                  onEditar={handleEditarRespuesta}
                  onEliminar={handleEliminarRespuesta}
                  onReportar={handleReportarRespuesta}
                />
              ))}
            </div>
          </div>
        )}

        {userIdentifier ? (
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar uid={userIdentifier} size={32} />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Tu respuesta</span>
            </div>
            <textarea
              ref={textareaRef}
              rows={4}
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Comparte tu aporte o pregunta..."
              disabled={enviando}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'DM Sans', sans-serif" }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(124,58,237,0.5)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
              onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleEnviar(); }}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Ctrl + Enter para enviar</span>
              <button
                onClick={handleEnviar}
                disabled={!respuesta.trim() || enviando}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-40"
                style={{ background: "#7C3AED" }}
                onMouseEnter={(e) => { if (!enviando) e.currentTarget.style.background = "#6D28D9"; }}
                onMouseLeave={(e) => { if (!enviando) e.currentTarget.style.background = "#7C3AED"; }}
              >
                {enviando ? <><Loader2 size={14} className="animate-spin" /> Enviando...</> : <><Send size={14} /> Publicar respuesta</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>Inicia sesión para responder en este hilo</p>
            <button onClick={() => router.push("/login")} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#7C3AED" }}>Iniciar sesión</button>
          </div>
        )}
      </div>
    </main>
  );
}

function RespuestaItem({
  resp,
  isLast,
  uid,
  onEditar,
  onEliminar,
  onReportar,
}: {
  resp: Respuesta;
  isLast: boolean;
  uid: string | null;
  onEditar:  (id: string, contenido: string) => Promise<void>;
  onEliminar:(id: string) => Promise<void>;
  onReportar:(id: string) => Promise<void>;
}) {
  const esMia = uid === resp.id_autor;
  const [editando,  setEditando]  = useState(false);
  const [texto,     setTexto]     = useState(resp.contenido);
  const [guardando, setGuardando] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [reportado, setReportado] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fecha = resp.fechaCreacion?.seconds
    ? new Date(resp.fechaCreacion.seconds * 1000).toLocaleDateString("es-MX", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "Reciente";

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function guardar() {
    if (!texto.trim() || texto.trim() === resp.contenido) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    await onEditar(resp.id, texto);
    setGuardando(false);
    setEditando(false);
  }

  async function handleReportar() {
    setMenuOpen(false);
    if (reportado) return;
    await onReportar(resp.id);
    setReportado(true);
  }

  return (
    <div
      className="flex gap-3 py-4"
      style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}
    >
      <Avatar uid={resp.id_autor} size={34} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-medium text-white">{resp.id_autor}</span>
          {esMia && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: 9 }}
            >
              Tú
            </span>
          )}
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{fecha}</span>
          {resp.editado && <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 9 }}>· editado</span>}
          {reportado && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 9 }}
            >
              reportado
            </span>
          )}
        </div>

        {editando ? (
          <div className="flex flex-col gap-2 mt-1">
            <textarea
              autoFocus
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              disabled={guardando}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) guardar();
                if (e.key === "Escape") { setEditando(false); setTexto(resp.contenido); }
              }}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(124,58,237,0.4)", fontFamily: "'DM Sans', sans-serif" }}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={guardar}
                disabled={guardando || !texto.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-40"
                style={{ background: "#7C3AED" }}
              >
                {guardando ? <><Loader2 size={11} className="animate-spin" /> Guardando...</> : <><Check size={11} /> Guardar</>}
              </button>
              <button
                onClick={() => { setEditando(false); setTexto(resp.contenido); }}
                disabled={guardando}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
              >
                Cancelar
              </button>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>Ctrl+Enter · Esc para cancelar</span>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", whiteSpace: "pre-wrap" }}>
            {resp.contenido}
          </p>
        )}
      </div>

      {uid && !editando && (
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 z-30 py-1"
              style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, minWidth: 168, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}
            >
              {esMia && (
                <>
                  <button
                    onClick={() => { setEditando(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Pencil size={11} /> Editar respuesta
                  </button>
                  <button
                    onClick={() => { onEliminar(resp.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                    style={{ color: "#f87171" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Trash2 size={11} /> Eliminar respuesta
                  </button>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />
                </>
              )}

              {!esMia && (
                <button
                  onClick={handleReportar}
                  disabled={reportado}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors disabled:opacity-40"
                  style={{ color: reportado ? "rgba(255,255,255,0.3)" : "#fb923c" }}
                  onMouseEnter={(e) => { if (!reportado) e.currentTarget.style.background = "rgba(251,146,60,0.06)"; }}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Flag size={11} /> {reportado ? "Ya reportado" : "Reportar respuesta"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}