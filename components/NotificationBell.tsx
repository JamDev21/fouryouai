"use client";

import { useRef, useState } from "react";
import { Bell, MessageCircle, PlayCircle, ThumbsUp, AtSign, CheckCheck } from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";

type NotifType = "reply" | "video" | "like" | "mention";

interface Notification {
  id: string;
  type: NotifType;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "video", message: "Dra. Elena publicó un nuevo video", time: "hace 5 min", read: false },
  { id: "2", type: "reply", message: "Carlos respondió a tu hilo", time: "hace 23 min", read: false },
  { id: "3", type: "mention", message: "Te mencionaron en un foro", time: "hace 1 h", read: false },
  { id: "4", type: "like", message: "A 12 personas les gustó tu post", time: "hace 3 h", read: true },
];

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  
  // Especificamos que puede ser HTMLDivElement o null
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Ahora useClickOutside aceptará el ref sin quejarse
  useClickOutside(containerRef, () => setOpen(false));

  const handleToggle = () => {
    if (!open && unreadCount > 0) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 w-[300px] bg-[#12121a] border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-semibold text-white">Notificaciones</span>
            <CheckCheck 
              size={14} 
              className="text-purple-400 cursor-pointer" 
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} 
            />
          </div>
          <ul className="max-h-[300px] overflow-y-auto">
            {notifications.map((notif) => (
              <li key={notif.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-400">
                  {notif.type === 'video' ? <PlayCircle size={14} /> : 
                   notif.type === 'reply' ? <MessageCircle size={14} /> :
                   notif.type === 'mention' ? <AtSign size={14} /> : <ThumbsUp size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug" style={{ color: notif.read ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)" }}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-white/20 mt-1">{notif.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}