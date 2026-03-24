import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig"; 

export const poblarBaseDeDatos = async () => {
  try {
    console.log("Iniciando la carga de datos semilla en Firestore...");

    // 1. USUARIOS
    const usuarios = [
      {
        id_usuario: "alumno_01",
        nombre: "Alex Rivera", 
        correo: "arivera@institucional.edu",
        rol: "alumno",
        avatarUrl: "https://ui-avatars.com/api/?name=Alex+Rivera&background=8b5cf6&color=fff",
        semestreActual: 8,
        materiasCursando: ["SIS-801", "SIS-802"],
        materiasAprobadas: ["SIS-101", "SIS-201"],
        vectorIntereses: { "MachineLearning": 0.9, "Python": 0.8, "Ciberseguridad": 0.4 },
        fechaRegistro: Timestamp.now()
      },
      {
        id_usuario: "docente_01",
        nombre: "Dra. Elena Martínez",
        correo: "emartinez@institucional.edu",
        rol: "docente",
        avatarUrl: "https://ui-avatars.com/api/?name=Elena+Martinez&background=10b981&color=fff",
        semestreActual: 0,
        materiasCursando: [],
        materiasAprobadas: [],
        vectorIntereses: {},
        fechaRegistro: Timestamp.now()
      }
    ];

    for (const user of usuarios) {
      await setDoc(doc(db, "usuarios", user.id_usuario), user);
    }
    console.log("Usuarios creados");

    // 2. MATERIAS
    const materias = [
      {
        id_materia: "SIS-801",
        nombre: "Inteligencia Artificial",
        semestre: 8,
        areaCurricular: "Ciencias de la Computación",
        descripcion: "Diseño e implementación de algoritmos de aprendizaje automático.",
        iconoUrl: "https://cdn-icons-png.flaticon.com/512/2103/2103132.png",
        tags: ["IA", "MachineLearning", "RedesNeuronales"],
        activa: true
      },
      {
        id_materia: "SIS-802",
        nombre: "Minería de Datos",
        semestre: 8,
        areaCurricular: "Bases de Datos",
        descripcion: "Extracción de conocimiento a partir de grandes volúmenes de datos.",
        iconoUrl: "https://cdn-icons-png.flaticon.com/512/1163/1163824.png",
        tags: ["DataScience", "BigData", "Python"],
        activa: true
      }
    ];

    for (const materia of materias) {
      await setDoc(doc(db, "materias", materia.id_materia), materia);
    }
    console.log("Materias creadas");

    // 3. CONTENIDOS (Recursos para el feed [c)
    const contenidos = [
      {
        id_contenido: "cont_01",
        titulo: "Introducción a Machine Learning con Python", // Tomado del mockup [cite: 119]
        tipo: "video",
        descripcionCorta: "Aprende los conceptos básicos de ML usando scikit-learn y pandas.",
        urlRecurso: "https://youtube.com/watch?v=ejemplo",
        urlPortada: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800",
        id_docente: "docente_01", // Relación con la Dra. Elena
        tags: ["MachineLearning", "Python", "DataScience"],
        metricas: { likes: 15, guardados: 8, comentarios: 2 },
        fechaPublicacion: Timestamp.now()
      }
    ];

    for (const contenido of contenidos) {
      await setDoc(doc(db, "contenidos", contenido.id_contenido), contenido);
    }
    console.log("Contenidos creados");

    // 4. INTERACCIONES )
    const interacciones = [
      {
        id_interaccion: "int_01",
        id_usuario: "alumno_01",
        id_contenido: "cont_01",
        tipo_accion: "like",
        peso_accion: 1.0,
        tags_involucrados: ["MachineLearning", "Python"],
        fecha: Timestamp.now()
      }
    ];

    for (const interaccion of interacciones) {
      await setDoc(doc(db, "interacciones", interaccion.id_interaccion), interaccion);
    }
    console.log("Interacciones creadas");

    // 5. FOROS_HILOS (Comunidad [cite: 61])
    const hilos = [
      {
        id_hilo: "hilo_01",
        titulo: "¿Dudas sobre el proyecto final de Data Science?",
        descripcion: "Abro este hilo para resolver cualquier duda sobre los datasets permitidos.",
        id_autor: "docente_01",
        tags: ["DataScience", "Proyecto"],
        contadorRespuestas: 1,
        fechaCreacion: Timestamp.now()
      }
    ];

    for (const hilo of hilos) {
      await setDoc(doc(db, "foros_hilos", hilo.id_hilo), hilo);
    }
    console.log("Hilos de foro creados");

    // 6. FOROS_RESPUESTAS
    const respuestas = [
      {
        id_respuesta: "resp_01",
        id_hilo: "hilo_01",
        id_autor: "alumno_01",
        contenido: "Profesor, ¿podemos usar un dataset de Kaggle sobre detección de fraudes?",
        likes: 2,
        esRespuestaAceptada: false,
        fechaRespuesta: Timestamp.now()
      }
    ];

    for (const respuesta of respuestas) {
      await setDoc(doc(db, "foros_respuestas", respuesta.id_respuesta), respuesta);
    }
    console.log("Respuestas de foro creadas");

    console.log("¡Toda la base de datos ha sido poblada con éxito!");
    alert("Base de datos inicializada correctamente. Revisa tu consola de Firebase.");

  } catch (error) {
    console.error("Error poblando la base de datos:", error);
    alert("Hubo un error al inicializar la base de datos. Revisa la consola.");
  }
};