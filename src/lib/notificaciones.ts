import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebaseConfig";

interface NotificacionProps {
  receptorId: string; // El usuario que recibirá la alerta
  tipo: "like" | "comentario" | "mencion" | "colaboracion";
  emisorId: string; // Quien hizo la acción
  emisorNombre: string;
  contenidoId: string; // El ID del post/proyecto
  mensaje: string;
}

export const enviarNotificacion = async ({ receptorId, tipo, emisorId, emisorNombre, contenidoId, mensaje }: NotificacionProps) => {
  // Evitar auto-notificaciones (no te notificas a ti mismo por darle like a tu post)
  if (receptorId === emisorId) return;

  try {
    // Apuntamos a la subcolección del usuario que recibe la alerta
    const notifRef = collection(db, "usuarios", receptorId, "notificaciones");
    
    await addDoc(notifRef, {
      tipo,
      emisorId,
      emisorNombre,
      contenidoId,
      mensaje,
      leida: false,
      fechaCreacion: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
  }
};