"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, Hash, BrainCircuit, Code2, ShieldCheck, 
  Database, Palette, Cpu, Cloud, FlaskConical 
} from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/src/lib/firebaseConfig"
import Link from "next/link"

//  Aquí definimos la personalidad de cada tema
const TOPIC_CONFIG: Record<string, { icon: any, color: string }> = {
  "machine-learning": { icon: BrainCircuit, color: "text-violet-400" },
  "react": { icon: Code2, color: "text-blue-400" },
  "python": { icon: FlaskConical, color: "text-yellow-400" },
  "ciberseguridad": { icon: ShieldCheck, color: "text-green-400" },
  "ciencia": { icon: Database, color: "text-purple-400" },
  "cloud": { icon: Cloud, color: "text-sky-400" },
  "ui-ux": { icon: Palette, color: "text-pink-400" },
  "ia": { icon: Cpu, color: "text-cyan-400" },
};

export function TrendingTopics() {
  const [trending, setTrending] = useState<{ tag: string; count: number }[]>([])

  useEffect(() => {
    const calcularTrending = async () => {
      try {
        const snapshot = await getDocs(collection(db, "contenidos"))
        const contadorTags: Record<string, number> = {}

        snapshot.docs.forEach(doc => {
          const tags = doc.data().etiquetas || []
          tags.forEach((tag: string) => {
            const key = tag.toLowerCase().trim()
            contadorTags[key] = (contadorTags[key] || 0) + 1
          })
        })

        const topTags = Object.entries(contadorTags)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([tag, count]) => ({ tag, count }))

        setTrending(topTags)
      } catch (e) {
        console.error("Error al calcular trending:", e)
      }
    }
    calcularTrending()
  }, [])

  return (
    <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
          <TrendingUp className="h-4 w-4 text-violet-400" />
        </div>
        <h3 className="font-semibold text-foreground">Temas Trending</h3>
      </div>

      <div className="space-y-1">
        {trending.map((topic, index) => {
          // 🟢 Buscamos la configuración, si no existe, usamos el Hash por defecto
          const configKey = topic.tag.toLowerCase().replace(" ", "-");
          const config = TOPIC_CONFIG[configKey] || { icon: Hash, color: "text-gray-500" };
          const Icon = config.icon;

          return (
            <Link 
              key={topic.tag} 
              href={`/explorar?etiqueta=${topic.tag}`}
              className="group flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-violet-500/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1a2e] transition-colors group-hover:bg-violet-500/20">
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground transition-colors group-hover:text-violet-300">
                  #{topic.tag}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topic.count} posts
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}