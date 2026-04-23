"use client";

import { useRef, useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
// Asegúrate de que esta ruta esté bien en tu proyecto:
import { db } from "../src/lib/firebaseConfig"; 
import { X, Plus, Loader2, Hash, AlignLeft, Tag, Layers } from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";
import type { Thread } from "../types/foro";

const CATEGORIAS = [
  "Machine Learning",
  "Desarrollo Web",
  "Ciberseguridad",
  "Ciencia de Datos",
  "Inteligencia Artificial",
  "Diseño UI/UX",
  "DevOps",
  "Otro",
];

interface Props {
  hilo: Thread;
  open: boolean;
  onClose: () => void;
}

export default function EditarHiloModal({ hilo, open, onClose }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Precarga los datos del hilo al abrir
  useEffect(() => {
    if (open) {
      setTitulo(hilo.titulo ?? "");
      setDescripcion(hilo.descripcion ?? "");
      setCategoria(hilo.categoria ?? ""); // ← Carga la categoría existente
      setTags(hilo.tags ?? []);
      setTagInput("");
      setError(null);
      setSuccess(false);
    }
  }, [open, hilo]);

  useClickOutside(modalRef, () => { if (!loading) handleClose(); });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loading]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleClose() {
    if (loading) return;
    onClose();
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      agregarTag();
    }
  }

  function agregarTag() {
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (!tag) return;
    if (tags.length >= 5) { setError("Máximo 5 etiquetas."); return; }
    if (tags.includes(tag)) { setTagInput(""); return; }
    setTags((prev) => [...prev, tag]);
    setTagInput("");
    setError(null);
  }

  function quitarTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function validar(): string | null {
    if (!titulo.trim()) return "El título es obligatorio.";
    if (titulo.trim().length < 10) return "El título debe tener al menos 10 caracteres.";
    if (!descripcion.trim()) return "La descripción es obligatoria.";
    if (descripcion.trim().length < 20) return "La descripción debe tener al menos 20 caracteres.";
    if (!categoria) return "Debes seleccionar una categoría.";
    return null;
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    const err = validar();
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);

    try {
      // Actualiza SOLO el documento del hilo en Firestore, incluyendo la categoría
      await updateDoc(doc(db, "foros_hilos", hilo.id), {
        titulo:      titulo.trim(),
        descripcion: descripcion.trim(),
        categoria:   categoria, // ← Guarda el cambio en Firebase
        tags,
        fechaEdicion: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      console.error(err);
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    color: "#fff",
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-titulo"
        className="w-full max-w-lg"
        style={{
          background: "#12121a",
          border: "1px solid rgba(124,58,237,0.28)",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{
            background: "#12121a",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <h2
              id="editar-titulo"
              className="text-base font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Editar hilo
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Solo tú puedes editar este hilo
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGuardar} className="px-6 py-5 flex flex-col gap-5">

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Hash size={12} />
              Título <span style={{ color: "#a78bfa" }}>*</span>
            </label>
            <input
              type="text"
              maxLength={120}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(124,58,237,0.55)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
            />
            <p
              className="text-right text-xs"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              {titulo.length}/120
            </p>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <AlignLeft size={12} />
              Descripción <span style={{ color: "#a78bfa" }}>*</span>
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(124,58,237,0.55)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
            />
            <p
              className="text-right text-xs"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              {descripcion.length}/1000
            </p>
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Layers size={12} />
              Categoría <span style={{ color: "#a78bfa" }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  disabled={loading}
                  onClick={() => setCategoria(cat)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all duration-150"
                  style={
                    categoria === cat
                      ? {
                          background: "rgba(124,58,237,0.25)",
                          border: "1px solid rgba(124,58,237,0.6)",
                          color: "#c4b5fd",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.4)",
                        }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Tag size={12} />
              Etiquetas
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
                (máx. 5)
              </span>
            </label>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      color: "#a78bfa",
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => quitarTag(tag)}
                      disabled={loading}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe y presiona Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={loading || tags.length >= 5}
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(124,58,237,0.55)")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
              />
              <button
                type="button"
                onClick={agregarTag}
                disabled={!tagInput.trim() || loading || tags.length >= 5}
                className="px-3 rounded-xl transition-colors disabled:opacity-30"
                style={{
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a78bfa",
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-xs px-3 py-2 rounded-xl"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              {error}
            </p>
          )}

          {/* Éxito */}
          {success && (
            <p
              className="text-xs px-3 py-2 rounded-xl text-center"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#6ee7b7",
              }}
            >
              ¡Hilo actualizado correctamente!
            </p>
          )}

          {/* Botones */}
          <div
            className="flex gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              style={{ background: "#7C3AED" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#6D28D9"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#7C3AED"; }}
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Guardando...</>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}