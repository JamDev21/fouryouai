"use client"

import { Sparkles, BookOpen, Video, FileText, Mic, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

const suggestions = [
  { label: "Cursos Interactivos", icon: BookOpen, color: "from-violet-500 to-purple-600" },
  { label: "Video Tutoriales", icon: Video, color: "from-blue-500 to-cyan-500" },
  { label: "Artículos", icon: FileText, color: "from-green-500 to-emerald-500" },
  { label: "Podcasts", icon: Mic, color: "from-pink-500 to-rose-500" },
  { label: "Proyectos", icon: Layers, color: "from-orange-500 to-amber-500" },
]

export function Suggestions() {
  return (
    <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <h3 className="font-semibold text-foreground">Sugerencias para ti</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon
          return (
            <Button
              key={suggestion.label}
              variant="ghost"
              className="h-auto flex-col items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-transparent p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/10"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${suggestion.color} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {suggestion.label}
              </span>
            </Button>
          )
        })}
      </div>

      <Button className="mt-4 w-full rounded-xl border border-violet-500/30 bg-violet-500/10 font-medium text-violet-300 transition-all hover:bg-violet-500/20 hover:text-violet-200">
        Ver todas las categorías
      </Button>
    </div>
  )
}
