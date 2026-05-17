"use client"

import { Sparkles, Clock, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentCard } from "./content-card"

const feedData = [
  {
    author: {
      name: "Dr. María González",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      role: "Profesora de IA - MIT",
    },
    title: "Introducción a Machine Learning con Python: De Cero a Experto",
    description: "Aprende los fundamentos del aprendizaje automático, desde regresión lineal hasta redes neuronales profundas con ejercicios prácticos.",
    tags: ["MachineLearning", "Python", "DataScience"],
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=340&fit=crop",
    likes: 1234,
    comments: 89,
  },
  {
    author: {
      name: "Carlos Mendoza",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      role: "Senior Developer - Google",
    },
    title: "React 19: Nuevas Features y Server Components en Profundidad",
    description: "Explora las últimas características de React 19, incluyendo Server Components, Actions y el nuevo modelo de renderizado.",
    tags: ["React", "JavaScript", "Frontend"],
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop",
    likes: 892,
    comments: 56,
    saved: true,
  },
  {
    author: {
      name: "Ana Rodríguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      role: "Security Researcher - CyberLab",
    },
    title: "Ciberseguridad Ofensiva: Técnicas de Pentesting Modernas",
    description: "Guía completa sobre metodologías de pentesting, desde reconocimiento hasta post-explotación con herramientas actualizadas.",
    tags: ["Ciberseguridad", "Pentesting", "Hacking"],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=340&fit=crop",
    likes: 756,
    comments: 34,
  },
  {
    author: {
      name: "Luis Herrera",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      role: "Data Engineer - Amazon",
    },
    title: "Arquitectura de Datos en la Nube: AWS vs Azure vs GCP",
    description: "Comparativa detallada de servicios de datos en las principales plataformas cloud con casos de uso reales y benchmarks.",
    tags: ["Cloud", "AWS", "DataEngineering"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop",
    likes: 543,
    comments: 28,
  },
]

export function ContentFeed() {
  return (
    <div className="space-y-6">
      {/* Feed Tabs */}
      <div className="flex items-center gap-2">
        <Button className="gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40">
          <Sparkles className="h-4 w-4" />
          Para ti
        </Button>
        <Button
          variant="ghost"
          className="gap-2 rounded-xl text-muted-foreground hover:bg-violet-500/10 hover:text-violet-300"
        >
          <Flame className="h-4 w-4" />
          Trending
        </Button>
        <Button
          variant="ghost"
          className="gap-2 rounded-xl text-muted-foreground hover:bg-violet-500/10 hover:text-violet-300"
        >
          <Clock className="h-4 w-4" />
          Recientes
        </Button>
      </div>

      {/* Feed Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {feedData.map((item, index) => (
          <ContentCard key={index} {...item} />
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          className="rounded-xl border-violet-500/30 bg-transparent px-8 text-violet-300 transition-all hover:bg-violet-500/10 hover:text-violet-200"
        >
          Cargar más contenido
        </Button>
      </div>
    </div>
  )
}
