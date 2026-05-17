"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface EliminarHiloModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EliminarHiloModal({
  isOpen,
  onClose,
  onConfirm,
}: EliminarHiloModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[340px] rounded-2xl border border-white/10 bg-[#1a1a1a] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="mx-auto mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-red-500/15">
          <Trash2 size={22} className="text-red-400" strokeWidth={1.75} />
        </div>

        <h3 className="mb-2 text-base font-semibold text-gray-100">
          ¿Eliminar este hilo?
        </h3>
        <p className="mb-7 text-[13px] leading-relaxed text-gray-400">
          Esta acción no se puede deshacer. El hilo y todas sus respuestas se
          eliminarán de forma permanente.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/10 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-full border border-red-900/50 bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/30"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
