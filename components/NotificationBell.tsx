"use client";

import { useRef, useState, useEffect } from "react";
import { Bell, MessageCircle, PlayCircle, ThumbsUp, AtSign, CheckCheck, Users } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot, writeBatch, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebaseConfig";
import { useClickOutside } from "../hooks/useClickOutside";
import { useRouter } from "next/navigation";

// Adaptamos el tipo a los que definimos para Firebase
type NotifType = "like" | "comentario" | "mencion" | "colaboracion" | "video";

interface Notification {
  id: string;
  tipo: NotifType;
  mensaje: string;
  emisorNombre: string;
  fechaCreacion: any;
  leida: boolean;
  contenidoId: string; // 🟢 Necesario para saber a dónde redirigir
}

const formatTimeAgo = (timestamp: any) => {
  if (!timestamp) return "justo ahora";
  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "hace unos segundos";
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
  return `hace ${Math.floor(diffInSeconds / 86400)} d`;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Inicializamos el router para la redirección
  const router = useRouter();

  // ESCUCHADOR EN TIEMPO REAL
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "usuarios", user.uid, "notificaciones"),
          orderBy("fechaCreacion", "desc"),
          limit(15)
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Notification[];
          
          setNotifications(notifs);
        });

        return () => unsubscribeSnapshot();
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  useClickOutside(containerRef, () => setOpen(false));

  const marcarTodasComoLeidas = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || unreadCount === 0) return;

    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        if (!notif.leida) {
          const notifRef = doc(db, "usuarios", userId, "notificaciones", notif.id);
          batch.update(notifRef, { leida: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error al marcar como leídas:", error);
    }
  };

  const handleToggle = () => {
    // Si abrimos la campana y hay no leídas, las marcamos todas
    if (!open && unreadCount > 0) {
      marcarTodasComoLeidas();
    }
    setOpen(!open);
  };

  // 🟢 NUEVA FUNCIÓN: Manejador de clics en cada notificación
  const handleNotificacionClick = async (notif: Notification) => {
    setOpen(false); // 1. Cerramos el menú

    // 2. Si por alguna razón no se marcó como leída en el batch, lo forzamos aquí
    if (!notif.leida && auth.currentUser) {
      try {
        const notifRef = doc(db, "usuarios", auth.currentUser.uid, "notificaciones", notif.id);
        await updateDoc(notifRef, { leida: true });
      } catch (error) {
        console.error("Error al marcar como leída:", error);
      }
    }

    // 3. Lógica de Redirección Inteligente
    if (!notif.contenidoId) return; // Si no hay ID a donde ir, no hacemos nada

    if (notif.tipo === "comentario" || notif.tipo === "mencion") {
      // Va a la comunidad y pasa el ID por la URL
      router.push(`/comunidad?hilo=${notif.contenidoId}`);
    } else {
      // Va al inicio (dashboard) y pasa el ID del recurso
      router.push(`/?recurso=${notif.contenidoId}`);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{ background: open ? "rgba(124,58,237,0.15)" : "transparent" }}
      >
        <Bell size={18} style={{ color: open ? "#a78bfa" : "rgba(255,255,255,0.6)" }} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-[#0B0B0F] flex items-center justify-center text-[8px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 w-[300px] bg-[#12121a] border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-semibold text-white">Notificaciones</span>
            <CheckCheck 
              size={14} 
              className={`transition-colors cursor-pointer ${unreadCount > 0 ? "text-purple-400 hover:text-purple-300" : "text-white/20 cursor-default"}`}
              onClick={marcarTodasComoLeidas} 
            />
          </div>
          
          <ul className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-xs text-white/40">
                No tienes notificaciones nuevas
              </li>
            ) : (
              notifications.map((notif) => (
                <li 
                  key={notif.id}
                  onClick={() => handleNotificacionClick(notif)} // 🟢 Evento Clic
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 cursor-pointer" // 🟢 Cursor-pointer añadido
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-400">
                    {notif.tipo === 'video' ? <PlayCircle size={14} /> : 
                     notif.tipo === 'comentario' ? <MessageCircle size={14} /> :
                     notif.tipo === 'mencion' ? <AtSign size={14} /> :
                     notif.tipo === 'colaboracion' ? <Users size={14} /> : <ThumbsUp size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: notif.leida ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)" }}>
                      <span className="font-semibold text-purple-200">{notif.emisorNombre}</span> {notif.mensaje}
                    </p>
                    <p className="text-[10px] text-white/20 mt-1">
                      {formatTimeAgo(notif.fechaCreacion)}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}