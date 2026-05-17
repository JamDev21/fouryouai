"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Compass,
  Users,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.displayName || "Usuario");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowDropdown(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <span className="text-lg font-bold text-white">4</span>
          </div>
          <span className="text-xl font-bold text-white">
            Fouryou<span className="text-violet-400">.ai</span>
          </span>
        </Link>

        {/* BARRA DE BÚSQUEDA - ¡Ya está de vuelta! */}
        <div className="hidden flex-1 max-w-xl mx-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Buscar cursos, temas, docentes..."
              className="w-full rounded-xl border border-white/5 bg-[#12121a] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 backdrop-blur-sm transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/10"
            />
          </div>
        </div>

        {/* NAVEGACIÓN Y PERFIL */}
        <div className="flex items-center gap-2">
          <Link href="/explorar">
            <Button
              variant="ghost"
              size="sm"
              className={`hidden gap-2 md:flex ${isActive("/explorar") ? "bg-violet-500/20 text-violet-400" : "text-white/60 hover:bg-white/5 hover:text-violet-400"}`}
            >
              <Compass className="h-4 w-4" />
              <span>Explorar</span>
            </Button>
          </Link>

          <Link href="/comunidad">
            <Button
              variant="ghost"
              size="sm"
              className={`hidden gap-2 md:flex ${isActive("/comunidad") ? "bg-violet-500/20 text-violet-400" : "text-white/60 hover:bg-white/5 hover:text-violet-400"}`}
            >
              <Users className="h-4 w-4" />
              <span>Comunidad</span>
            </Button>
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-3 ml-2">
              {/* Eliminamos NotificationBell para limpiar los errores */}

              <Link href="/subir-contenido">
                <Button className="hidden gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110 sm:flex">
                  <Plus className="h-4 w-4" />
                  <span>Subir</span>
                </Button>
              </Link>

              <div className="relative">
                <Avatar
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="h-9 w-9 cursor-pointer ring-2 ring-violet-500/30 transition-all hover:ring-violet-500/60"
                >
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=8b5cf6&color=fff`}
                  />
                  <AvatarFallback className="bg-violet-600 text-white">
                    {userName ? userName[0].toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-[#12121a] shadow-2xl overflow-hidden py-1 z-50">
                    <Link href="/perfil" onClick={() => setShowDropdown(false)}>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-violet-500/10 hover:text-white flex items-center gap-2 transition-colors">
                        <User className="h-4 w-4" /> Mi Perfil
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="ml-2 gap-2 rounded-xl bg-violet-600 px-4 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 hover:shadow-violet-500/40">
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
