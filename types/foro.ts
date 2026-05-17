import { Timestamp } from "firebase/firestore";

export interface Autor {
  nombre: string;
  avatarUrl: string;
}

export interface Thread {
  id: string;
  titulo: string;
  autor: Autor;
  tags: string[];
  fecha: Timestamp;
  respuestasCount: number;
}