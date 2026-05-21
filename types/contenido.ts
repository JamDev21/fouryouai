import { Timestamp } from "firebase/firestore";

export interface Contenido {
  id?: string;             // Opcional, porque cuando lo creas apenas se va a generar en Firebase
  titulo: string;
  descripcion: string;
  tipo: string;
  etiquetas: string[];
  urlMedia: string;
  autorId: string;
  autorNombre: string;
  etiquetados: string[];
  colaboradores: string[];
  fechaCreacion: Timestamp | Date; // Date cuando lo creas en tu app, Timestamp cuando lo descargas de Firebase
  vistas: number;
  likes: number;
}