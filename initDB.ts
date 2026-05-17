import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebaseConfig"; // Asegúrate de que la ruta a tu config sea correcta

export const inicializarColecciones = async () => {
  try {
    console.log("Iniciando la creación de colecciones...");

    // 1. Colección: usuarios (Documento de inicialización)
    await setDoc(doc(db, "usuarios", "_plantilla_usuario"), {
      nombre: "",
      correo: "",
      rol: "alumno",
      avatarUrl: "",
      semestreActual: 0,
      materiasCursando: [],
      materiasAprobadas: [],
      vectorIntereses: {},
      fechaRegistro: new Date()
    });

    // 2. Colección: materias
    await setDoc(doc(db, "materias", "_plantilla_materia"), {
      nombre: "",
      semestre: 0,
      areaCurricular: "",
      descripcion: "",
      iconoUrl: "",
      tags: [],
      activa: false
    });

    // 3. Colección: contenidos
    await setDoc(doc(db, "contenidos", "_plantilla_contenido"), {
      titulo: "",
      tipo: "articulo",
      descripcionCorta: "",
      urlRecurso: "",
      urlPortada: "",
      id_docente: "",
      tags: [],
      metricas: { likes: 0, guardados: 0, comentarios: 0 },
      fechaPublicacion: new Date()
    });

    // 4. Colección: interacciones
    await setDoc(doc(db, "interacciones", "_plantilla_interaccion"), {
      id_usuario: "",
      id_contenido: "",
      tipo_accion: "",
      peso_accion: 0,
      tags_involucrados: [],
      fecha: new Date()
    });

    // 5. Colección: foros_hilos
    await setDoc(doc(db, "foros_hilos", "_plantilla_hilo"), {
      titulo: "",
      descripcion: "",
      id_autor: "",
      tags: [],
      contadorRespuestas: 0,
      fechaCreacion: new Date()
    });

    // 6. Colección: foros_respuestas
    await setDoc(doc(db, "foros_respuestas", "_plantilla_respuesta"), {
      id_hilo: "",
      id_autor: "",
      contenido: "",
      likes: 0,
      esRespuestaAceptada: false,
      fechaRespuesta: new Date()
    });

    console.log("¡Estructura de base de datos creada con éxito!");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
};