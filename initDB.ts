import { doc, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

export const inicializarColecciones = async () => {
  try {
    console.log("Iniciando la creación de colecciones...");

    await setDoc(doc(db, "usuarios", "_plantilla_usuario"), {
      nombre: "",
      correo: "",
      rol: "alumno",
      avatarUrl: "",
      semestreActual: 0,
      materiasCursando: [],
      materiasAprobadas: [],
      vectorIntereses: {},
      fechaRegistro: new Date(),
    });

    await setDoc(doc(db, "materias", "_plantilla_materia"), {
      nombre: "",
      semestre: 0,
      areaCurricular: "",
      descripcion: "",
      iconoUrl: "",
      tags: [],
      activa: false,
    });

    await setDoc(doc(db, "contenidos", "_plantilla_contenido"), {
      titulo: "",
      tipo: "articulo",
      descripcionCorta: "",
      urlRecurso: "",
      urlPortada: "",
      id_docente: "",
      tags: [],
      metricas: { likes: 0, guardados: 0, comentarios: 0 },
      fechaPublicacion: new Date(),
    });

    await setDoc(doc(db, "interacciones", "_plantilla_interaccion"), {
      id_usuario: "",
      id_contenido: "",
      tipo_accion: "",
      peso_accion: 0,
      tags_involucrados: [],
      fecha: new Date(),
    });

    await setDoc(doc(db, "foros_hilos", "_plantilla_hilo"), {
      titulo: "",
      descripcion: "",
      id_autor: "",
      tags: [],
      contadorRespuestas: 0,
      fechaCreacion: new Date(),
    });

    await setDoc(doc(db, "foros_respuestas", "_plantilla_respuesta"), {
      id_hilo: "",
      id_autor: "",
      contenido: "",
      likes: 0,
      esRespuestaAceptada: false,
      fechaRespuesta: new Date(),
    });

    console.log("¡Estructura de base de datos creada con éxito!");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
};
