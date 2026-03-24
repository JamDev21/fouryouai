"use client"

import { Heart, Bookmark, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ContentCardProps {
  author: {
    name: string
    avatar: string
    role: string
  }
  title: string
  description: string
  tags: string[]
  image: string
  likes: number
  comments: number
  saved?: boolean
}

export function ContentCard({
  author,
  title,
  description,
  tags,
  image,
  likes,
  comments,
  saved = false,
}: ContentCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10">
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar className="h-10 w-10 ring-2 ring-violet-500/20">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="bg-violet-600 text-white">
            {author.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground">{author.name}</h4>
          <p className="text-xs text-muted-foreground">{author.role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-bold text-foreground leading-tight line-clamp-2 text-balance">
          {title}
        </h3>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20 hover:text-violet-200"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-t border-[var(--glass-border)] pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-400"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs">{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`ml-auto gap-1.5 ${
              saved
                ? "text-violet-400 hover:bg-violet-500/10"
                : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
            <span className="text-xs">Guardar</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
