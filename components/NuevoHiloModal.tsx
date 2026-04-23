"use client";

import { useRef, useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../src/lib/firebaseConfig"; 
import { X, Plus, Loader2, Hash, AlignLeft, Tag, Layers } from "lucide-react";

import { useClickOutside } from "../hooks/useClickOutside";
import type { NuevoHiloForm } from "../types/foro";

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
  open: boolean;
  onClose: () => void;
  autorNombre: string;
  autorAvatarUrl?: string;
}

const FORM_INICIAL: NuevoHiloForm = {
  titulo: "",
  descripcion: "",
  categoria: "",
  tags: [],
};

export default function NuevoHiloModal({
  open,
  onClose,
  autorNombre,
  autorAvatarUrl,
}: Props) {
  const [form, setForm] = useState<NuevoHiloForm>(FORM_INICIAL);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, () => {
    if (!loading) handleClose();
  });

  function handleClose() {
    if (loading) return;
    setForm(FORM_INICIAL);
    setTagInput("");
    setError(null);
    setSuccess(false);
    onClose();
  }

  function agregarTag() {
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (!tag || form.tags.includes(tag) || form.tags.length >= 5) {
      setTagInput("");
      return;
    }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.categoria) {
      setError("Llena los campos obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "foros_hilos"), {
        titulo:             form.titulo.trim(),
        descripcion:        form.descripcion.trim(),
        categoria:          form.categoria,
        tags:               form.tags,
        contadorRespuestas: 0,
        fechaCreacion:      serverTimestamp(),
        id_autor:           autorNombre,
        id_hilo:            "", 
      });

      setSuccess(true);
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con Firebase. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Nuevo hilo de discusión</h2>
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-white/50 flex items-center gap-2">
              <Hash size={14} /> Título
            </label>
            <input
              type="text"
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-white/50 flex items-center gap-2">
              <AlignLeft size={14} /> Descripción
            </label>
            <textarea
              required
              rows={4}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-white/50 flex items-center gap-2">
              <Layers size={14} /> Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, categoria: cat })}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                    form.categoria === cat 
                      ? "bg-violet-500/20 border-violet-500 text-violet-400" 
                      : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-white/50 flex items-center gap-2">
              <Tag size={14} /> Etiquetas
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarTag())}
              placeholder="Enter para añadir"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {form.tags.map((t) => (
                <span key={t} className="bg-violet-500/10 border border-violet-500/30 text-violet-400 px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1">
                  #{t}
                  <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter(tag => tag !== t) })}>
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}
          {success && <p className="text-xs text-green-400 bg-green-400/10 p-3 rounded-xl border border-green-400/20 text-center">¡Publicado! 🎉</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Publicar ahora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}