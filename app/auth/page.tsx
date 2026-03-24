"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

// Importaciones de Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../src/lib/firebaseConfig"; // Ajusta esta ruta a tu archivo de config

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  // ==========================================
  // LÓGICA DE REGISTRO
  // ==========================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
      const user = userCredential.user;

      // 2. Actualizar su perfil de Auth con el nombre
      await updateProfile(user, { displayName: nombre });

      // 3. Crear su documento base en la colección 'usuarios' de Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        id_usuario: user.uid,
        nombre: nombre,
        correo: correo,
        rol: "alumno", // Por defecto
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=8b5cf6&color=fff`,
        semestreActual: 0, // Se llenará en el Onboarding
        materiasCursando: [],
        materiasAprobadas: [],
        vectorIntereses: {},
        fechaRegistro: Timestamp.now(),
        onboardingCompletado: false // ¡Clave para saber si mandarlo al formulario interactivo!
      });

      // 4. Redirigir al Onboarding
      router.push("../onboarding");

    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LÓGICA DE LOGIN
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, correo, password);
      
      // Verificar si ya completó el onboarding
      const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));
      
      if (userDoc.exists() && !userDoc.data().onboardingCompletado) {
        router.push("/onboarding"); // Si no lo ha completado, lo forzamos a ir
      } else {
        router.push("/"); // Si ya tiene todo, va directo al Dashboard
      }

    } catch (err: any) {
      setError("Credenciales incorrectas o usuario no encontrado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
       {/* Efectos de fondo heredados del Dashboard */}
       <div className="pointer-events-none fixed inset-0 overflow-hidden">
         <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]" />
         <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
         <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

    {/* Contenedor principal con Perspectiva 3D */}
      <div className="relative w-full max-w-[400px] h-[550px] [perspective:1000px] z-10">
        {/* <div className={`w-full h-full relative transition-all duration-700 ease-in-out [transform-style:preserve-3d] ${!isLogin ? "[transform:rotateY(180deg)]" : ""}`}> */}
        {/* Tarjeta animada que gira */}
         <div 
           className={`w-full h-full relative transition-all duration-700 ease-in-out [transform-style:preserve-3d] ${
             !isLogin ? "[transform:rotateY(180deg)]" : ""
           }`}
         > 
          {/* ================= FRENTE (LOGIN) ================= */}
          <div className="absolute inset-0 w-full h-full bg-[#12121a]/80 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 flex flex-col justify-center [backface-visibility:hidden] shadow-2xl">
            <div className="mb-8 text-center">
               <div className="w-12 h-12 bg-violet-600 rounded-xl mx-auto flex items-center justify-center mb-4 text-white font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                 4
               </div>
               <h2 className="text-2xl font-bold text-white">Bienvenido de vuelta</h2>
               <p className="text-sm text-gray-400 mt-2">Ingresa a Fouryou.ai</p>
             </div>
            
            {error && isLogin && <div className="text-red-400 text-sm text-center mb-4">{error}</div>}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input 
                  type="email" 
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Correo institucional" 
                  required
                  className="w-full bg-[#0a0a0f] border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 focus:border-violet-500 outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña" 
                  required
                  className="w-full bg-[#0a0a0f] border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 focus:border-violet-500 outline-none"
                />
              </div>

              <div className="flex justify-end text-xs text-violet-400 hover:text-violet-300 cursor-pointer">
                 ¿Olvidaste tu contraseña?
               </div>
              
              <button disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 mt-4 flex justify-center items-center gap-2 transition-all">
                {loading ? "Cargando..." : "Iniciar Sesión"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
               ¿No tienes cuenta?{" "}
               <button 
                 onClick={() => setIsLogin(false)}
                 className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
               >
                 Regístrate
               </button>
             </div>
          </div>

          {/* ================= REVERSO (REGISTRO) ================= */}
          <div className="absolute inset-0 w-full h-full bg-[#12121a]/80 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 flex flex-col justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl">
            <div className="mb-6 text-center">
               <h2 className="text-2xl font-bold text-white">Crea tu cuenta</h2>
               <p className="text-sm text-gray-400 mt-2">Únete a la comunidad</p>
             </div>
            
            {error && !isLogin && <div className="text-red-400 text-sm text-center mb-4">{error}</div>}

            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre completo" 
                  required
                  className="w-full bg-[#0a0a0f] border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 focus:border-violet-500 outline-none"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input 
                  type="email" 
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Correo institucional" 
                  required
                  className="w-full bg-[#0a0a0f] border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 focus:border-violet-500 outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña (Mín. 6 caracteres)" 
                  required
                  minLength={6}
                  className="w-full bg-[#0a0a0f] border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 focus:border-violet-500 outline-none"
                />
              </div>

              <button disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 mt-4 transition-all">
                {loading ? "Creando cuenta..." : "Comenzar Aventura"}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
               ¿Ya tienes una cuenta?{" "}
               <button 
                 onClick={() => setIsLogin(true)}
                 className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
               >
                 Inicia sesión
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

