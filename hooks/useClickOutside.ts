// hooks/useClickOutside.ts
import { useEffect, RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>, // <-- Aquí aceptamos que sea null
  callback: () => void
) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Solo ejecutamos si el elemento existe
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
}