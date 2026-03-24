"use client"

import { TrendingUp, Brain, Code2, Shield, Database, Palette, Cpu } from "lucide-react"

const topics = [
  { name: "Machine Learning", posts: 2453, icon: Brain, color: "text-violet-400" },
  { name: "React", posts: 1892, icon: Code2, color: "text-blue-400" },
  { name: "Ciberseguridad", posts: 1567, icon: Shield, color: "text-green-400" },
  { name: "Data Science", posts: 1234, icon: Database, color: "text-purple-400" },
  { name: "UI/UX Design", posts: 987, icon: Palette, color: "text-pink-400" },
  { name: "Inteligencia Artificial", posts: 876, icon: Cpu, color: "text-cyan-400" },
]


export function TrendingTopics() {
  return (
    <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
          <TrendingUp className="h-4 w-4 text-violet-400" />
        </div>
        <h3 className="font-semibold text-foreground">Temas Trending</h3>
      </div>

      <div className="space-y-1">
        {topics.map((topic, index) => {
          const Icon = topic.icon
          return (
            <button
              key={topic.name}
              className="group flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-violet-500/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1a2e] transition-colors group-hover:bg-violet-500/20">
                <Icon className={`h-4 w-4 ${topic.color}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground transition-colors group-hover:text-violet-300">
                  {topic.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topic.posts.toLocaleString()} posts
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                #{index + 1}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
