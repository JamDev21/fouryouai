import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../lib/firebase";

export interface Contenido {
  id: string;
  titulo: string;
  descripcion?: string;
  tags: string[];
  categoria?: string;
  imagen?: string;
  autor?: string;
  fechaCreacion?: { seconds: number };
  url?: string;
  tipo?: string;
  relevancia?: number;
}

function extraerIntereses(vectorIntereses: unknown): string[] {
  if (!vectorIntereses) return [];
  if (Array.isArray(vectorIntereses)) {
    return vectorIntereses
      .filter((v) => typeof v === "string")
      .map((v) => v.toLowerCase().trim());
  }
  if (typeof vectorIntereses === "object") {
    return Object.keys(vectorIntereses as Record<string, unknown>).map((k) =>
      k.toLowerCase().trim(),
    );
  }
  return [];
}

function calcularRelevancia(tags: string[], intereses: string[]): number {
  if (!tags?.length || !intereses?.length) return 0;
  const tagsNorm = tags.map((t) => t.toLowerCase().trim());
  return tagsNorm.reduce((score, tag) => {
    const exacto = intereses.some((i) => i === tag);
    const parcial = intereses.some((i) => i.includes(tag) || tag.includes(i));
    return score + (exacto ? 2 : parcial ? 1 : 0);
  }, 0);
}

export function usePersonalizedFeed() {
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        let interesesUsuario: string[] = [];

        if (uid) {
          const userSnap = await getDoc(doc(db, "usuarios", uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            interesesUsuario = extraerIntereses(
              data.vectorIntereses || data.intereses || [],
            );
          }
        }

        setIntereses(interesesUsuario);

        const q = query(
          collection(db, "contenidos"),
          orderBy("fechaCreacion", "desc"),
        );
        const snap = await getDocs(q);

        const docs: Contenido[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Contenido, "id">),
        }));

        const conScore = docs.map((c) => ({
          ...c,
          relevancia: calcularRelevancia(c.tags || [], interesesUsuario),
        }));

        const ordenados = conScore.sort(
          (a, b) => (b.relevancia || 0) - (a.relevancia || 0),
        );
        setContenidos(ordenados);
      } catch (err) {
        console.error("Error en feed:", err);
        setError("Error al cargar el contenido personalizado.");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  return { contenidos, intereses, loading, error };
}
