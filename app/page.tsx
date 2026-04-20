"use client";
import { useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { useRouter } from "next/navigation";
import { UserPlus, Tag as TagIcon, Upload } from "lucide-react"; // Usando lucide-react para los iconos

export default function SubirContenidoPage() {
  const router = useRouter();
  
  // Estados del formulario
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
    etiquetas: "",
  });

  // Validación de Criterios de Aceptación
  const isInvalid = !form.titulo || !form.tipo || !form.etiquetas;

  const handleGuardar = () => {
    // Aquí conectarás con la colección 'contenidos'
    console.log("Guardando en contenidos...", form);
    alert("¡Contenido publicado con éxito!"); 
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Aportar recursos</h1>
          <p className="text-gray-400">Comparte conocimiento con la comunidad de Fouryou.ai</p>
        </div>

        <div className="space-y-6 rounded-2xl border border-white/5 bg-[#11111a] p-8 shadow-xl">
          
          {/* Título */}
          <div>
            <label className="mb-2 block text-sm font-medium">Título del recurso</label>
            <input 
              type="text"
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
              placeholder="Ej: Pentesting con Metasploit"
              onChange={(e) => setForm({...form, titulo: e.target.value})}
            />
          </div>

          {/* Descripción Corta */}
          <div>
            <label className="mb-2 block text-sm font-medium">Descripción corta</label>
            <textarea 
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
              rows={3}
              placeholder="¿De qué trata este recurso?"
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Tipo */}
            <div>
              <label className="mb-2 block text-sm font-medium">Tipo de contenido</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
                onChange={(e) => setForm({...form, tipo: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                <option value="video">Video</option>
                <option value="articulo">Artículo</option>
              </select>
            </div>

            {/* Etiquetas */}
            <div>
              <label className="mb-2 block text-sm font-medium">Etiquetas</label>
              <input 
                type="text"
                className="w-full rounded-lg border border-white/10 bg-black/40 p-3 outline-none focus:border-purple-500"
                placeholder="Ciberseguridad, React..."
                onChange={(e) => setForm({...form, etiquetas: e.target.value})}
              />
            </div>
          </div>

          {/* Iconos Decorativos (Criterio de Aceptación) */}
          <div className="flex gap-4 py-2">
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition">
              <TagIcon size={18} /> Etiquetar persona
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition">
              <UserPlus size={18} /> Invitar colaborador
            </button>
          </div>

          {/* Placeholder para Cloudinary */}
          <div className="rounded-lg border-2 border-dashed border-white/10 bg-black/20 p-10 text-center">
            <Upload className="mx-auto mb-2 text-gray-500" size={32} />
            <p className="text-sm text-gray-400">Aquí se integrará el widget de Cloudinary</p>
          </div>

          {/* Botón de Acción */}
          <button
            onClick={handleGuardar}
            disabled={isInvalid}
            className={`w-full rounded-xl py-4 font-bold text-white transition-all ${
              isInvalid 
                ? "cursor-not-allowed bg-gray-800 opacity-50" 
                : "bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
            }`}
          >
            Publicar Contenido
          </button>
        </div>
      </main>
    </div>
  );
}