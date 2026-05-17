import { Timestamp } from "firebase/firestore";

export interface Autor {
  nombre: string;
  avatarUrl: string;
}

export interface Thread {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  id_autor: string; 
  tags: string[];
  fechaCreacion: Timestamp; 
  contadorRespuestas: number;
}

export interface NuevoHiloForm {
  titulo: string;
  descripcion: string;
  categoria: string;
  tags: string[];
}