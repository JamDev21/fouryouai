"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/lib/firebaseConfig";
import { Loader2 } from "lucide-react";

export default function PerfilBasePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si entra a /perfil, Next.js lo teletransporta automáticamente a su ruta con ID /perfil/SU_UID
        router.replace(`/perfil/${user.uid}`);
      } else {
        router.replace("/auth"); // Si no está logueado, al login
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-purple-500" size={32} />
    </div>
  );
}