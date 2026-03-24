"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../src/lib/firebaseConfig";
import { Brain, BookOpen, Target, ArrowRight, Check, Sparkles } from "lucide-react";

// TODO: Importar Firebase en el siguiente paso
// import { doc, updateDoc } from "firebase/firestore";
// import { auth, db } from "@/lib/firebaseConfig";

// Datos de prueba (Kardex y Tags)
const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const TAGS_DISPONIBLES = [
  "Machine Learning", "Data Science", "React", "Python", 
  "Ciberseguridad", "Cloud Computing", "UI/UX", "Bases de Datos",
  "Backend", "IA Generativa"
];
const MATERIAS_MOCK = [
  { id: "SIS-101", nombre: "Fundamentos de Programación" },
  { id: "SIS-405", nombre: "Arquitectura de Computadoras" },
  { id: "SIS-801", nombre: "Inteligencia Artificial" },
  { id: "SIS-802", nombre: "Minería de Datos" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Estados de las respuestas
  const [semestre, setSemestre] = useState<number | null>(null);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [materias, setMaterias] = useState<string[]>([]);

  // Función para manejar el avance con animación
  const nextStep = () => {
    if (step === 3) {
      finalizarOnboarding();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setStep(step + 1);
      setIsAnimating(false);
    }, 300); // 300ms de transición
  };

  const finalizarOnboarding = async () => {
    // console.log("Datos listos para Firebase:", { semestre, intereses, materias });
    // // Aquí actualizaremos Firestore
    // router.push("/"); // Mandamos al Dashboard
    try {
    // Verificamos que el usuario esté logueado
    const user = auth.currentUser;
    if (!user) {
      console.error("No hay sesión activa");
      router.push("/auth");
      return;
    }

    // Transformamos el array de tags ["Python", "IA"] 
    // en un objeto de pesos { "Python": 1.0, "IA": 1.0 }
    // Esto es el núcleo de tu Algoritmo de Recomendación
    const vectorInicial: Record<string, number> = {};
    intereses.forEach(tag => {
      vectorInicial[tag] = 1.0; // Le damos peso máximo porque fue selección explícita
    });

    // Apuntamos al documento de este usuario específico
    const userRef = doc(db, "usuarios", user.uid);

    // Actualizamos solo los campos necesarios en Firestore
    await updateDoc(userRef, {
      semestreActual: semestre,
      vectorIntereses: vectorInicial,
      materiasCursando: materias,
      onboardingCompletado: true // ¡Clave para que no vuelva a ver esta pantalla!
    });

    console.log("¡Perfil de IA configurado exitosamente!");
    
    // Lo enviamos a su Dashboard ya personalizado
    router.push("/"); 

  } catch (error) {
    console.error("Error al guardar el perfil:", error);
    alert("Hubo un error al guardar tu configuración. Por favor, intenta de nuevo.");
  }
  };

  const toggleInteres = (tag: string) => {
    setIntereses(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleMateria = (id: string) => {
    setMaterias(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
      </div>

      {/* Barra de Progreso Superior */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
        <div 
          className="h-full bg-violet-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,0.8)]"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="relative w-full max-w-2xl z-10">
        {/* Encabezado del Onboarding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-violet-500/10 rounded-2xl mb-4 border border-violet-500/20">
            <Sparkles className="h-6 w-6 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Configura tu Motor de IA</h1>
          <p className="text-gray-400">Personaliza tu experiencia académica en Fouryou.ai</p>
        </div>

        {/* CONTENEDOR DE LAS PREGUNTAS (Con Animación) */}
        <div 
          key={step} // Esto reinicia la animación en cada paso
          className={`bg-[#12121a]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl transition-all duration-500 transform ${
            isAnimating ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          
          {/* PASO 1: SEMESTRE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-violet-400" />
                <h2 className="text-xl font-semibold text-white">¿En qué semestre estás?</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {SEMESTRES.map(num => (
                  <button
                    key={num}
                    onClick={() => setSemestre(num)}
                    className={`py-4 rounded-xl text-lg font-medium transition-all ${
                      semestre === num 
                        ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border-transparent' 
                        : 'bg-[#0a0a0f] text-gray-400 border border-gray-800 hover:border-violet-500/50 hover:text-white'
                    }`}
                  >
                    {num}º
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  onClick={nextStep}
                  disabled={!semestre}
                  className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: INTERESES */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="h-6 w-6 text-violet-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">¿Qué temas te apasionan?</h2>
                  <p className="text-sm text-gray-400">Selecciona al menos 3 para afinar tu feed.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {TAGS_DISPONIBLES.map(tag => {
                  const isSelected = intereses.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleInteres(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50' 
                          : 'bg-[#0a0a0f] text-gray-400 border border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between items-center pt-4">
                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                  Atrás
                </button>
                <button 
                  onClick={nextStep}
                  disabled={intereses.length < 3}
                  className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: MATERIAS ACTUALES */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-violet-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Materias de este semestre</h2>
                  <p className="text-sm text-gray-400">Selecciona las materias que estás cursando.</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {MATERIAS_MOCK.map(materia => {
                  const isSelected = materias.includes(materia.id);
                  return (
                    <div 
                      key={materia.id}
                      onClick={() => toggleMateria(materia.id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 flex items-center justify-between ${
                        isSelected 
                          ? 'bg-violet-500/10 border-violet-500/50' 
                          : 'bg-[#0a0a0f] border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-violet-300' : 'text-gray-300'}`}>
                          {materia.nombre}
                        </div>
                        <div className="text-xs text-gray-500">{materia.id}</div>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-violet-600 border-violet-600' : 'border-gray-600'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center pt-4">
                <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                  Atrás
                </button>
                <button 
                  onClick={nextStep}
                  className="bg-violet-600 text-white hover:bg-violet-700 px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                >
                  Comenzar Experiencia <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}