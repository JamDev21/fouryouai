"use client"

import Link from "next/link"
import { Construction, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnderConstruction() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Graduate Effects (Copia de la estética del Dashboard) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg bg-[#12121a]/80 border border-purple-500/20 p-12 rounded-3xl shadow-2xl backdrop-blur-xl">
        {/* Icono de Construcción con Animación Pulsante */}
        <div className="flex items-center justify-center mb-10">
          <div className="p-6 bg-violet-500/10 rounded-full border border-violet-500/30 animate-pulse">
            <Construction className="h-20 w-20 text-violet-400" strokeWidth={1} />
          </div>
        </div>

        {/* Título y Descripción */}
        <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          🚧 Página <span className="text-violet-400">En Construcción</span>
        </h1>
        <p className="text-lg text-gray-400 mb-12 leading-relaxed">
          Estamos trabajando arduamente en esta sección para traerte una experiencia increíble en Fouryou.ai. ¡Muy pronto estará lista! Mientras tanto, puedes explorar otras partes de la plataforma.
        </p>

        {/* Botón para Volver al Dashboard */}
        <Link href="/">
          <Button className="w-full gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-6 text-xl font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:brightness-110">
            <ArrowLeft className="h-5 w-5" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}