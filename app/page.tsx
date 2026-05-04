"use client";

import { Navbar } from "@/components/dashboard/navbar";
import { ContentFeed } from "@/components/dashboard/content-feed";
import { TrendingTopics } from "@/components/dashboard/trending-topics";
import { Suggestions } from "@/components/dashboard/suggestions";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Gradient Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="relative">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Left Column - Main Feed */}
            <section>
              <ContentFeed />
            </section>

            {/* Right Column - Sidebar */}
            <aside className="space-y-6">
              <TrendingTopics />
              <Suggestions />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
