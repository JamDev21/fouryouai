"use client";

import { useRef, useState, useEffect } from "react";
import { Bell, MessageCircle, PlayCircle, ThumbsUp, AtSign, CheckCheck, Users } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot, writeBatch, doc } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebaseConfig";
import { useClickOutside } from "../hooks/useClickOutside"; // Asegúrate de que esta ruta siga siendo correcta

// Adaptamos el tipo a los que definimos para Firebase
type NotifType = "like" | "comentario" | "mencion" | "colaboracion" | "video";

interface Notification {
  id: string;
  tipo: NotifType;
  mensaje: string;
  emisorNombre: string;
  fechaCreacion: any; // Timestamp de Firebase
  leida: boolean;
}

// Función auxiliar para convertir el Timestamp de Firebase a "hace X min"
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

  // ESCUCHADOR EN TIEMPO REAL (FIREBASE)
  useEffect(() => {
    // Esperamos a que el usuario esté autenticado
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "usuarios", user.uid, "notificaciones"),
          orderBy("fechaCreacion", "desc"),
          limit(15) // Traemos solo las últimas 15 para no saturar
        );

        // onSnapshot actualiza el estado automáticamente si hay cambios en la BD
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

  // Función para marcar todas las no leídas como leídas en Firebase
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
      await batch.commit(); // Ejecutamos todas las actualizaciones de golpe
    } catch (error) {
      console.error("Error al marcar como leídas:", error);
    }
  };

  const handleToggle = () => {
    if (!open && unreadCount > 0) {
      marcarTodasComoLeidas();
    }
    setOpen(!open);
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
                <li key={notif.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-400">
                    {/* Renderizamos el icono según el tipo de notificación */}
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