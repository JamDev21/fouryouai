"use client";
import { useState } from "react";
import { Upload, Image as ImageIcon, Video, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  onUploadSuccess: (url: string) => void;
  type: "image" | "video";
}

export function MediaUpload({ onUploadSuccess, type }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // 1. Obtener timestamp para la firma
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      // 2. Pedir firma a nuestra API
      const signResponse = await fetch("/api/cloudinary-sign", {
        method: "POST",
        body: JSON.stringify({ paramsToSign: { timestamp } }),
      });
      const { signature } = await signResponse.json();

      // 3. Subir directamente a Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      onUploadSuccess(data.secure_url);
      
      toast({
        title: "¡Subida exitosa!",
        description: "El archivo se ha guardado en la nube.",
      });
      setFile(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir el archivo.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-purple-500/20 rounded-2xl p-6 bg-[#12121a]/50 text-center">
      {!file ? (
        <label className="cursor-pointer flex flex-col items-center gap-3">
          <div className="p-4 bg-violet-500/10 rounded-full">
            {type === "image" ? <ImageIcon className="text-violet-400" /> : <Video className="text-violet-400" />}
          </div>
          <span className="text-sm text-gray-400">Haz clic para seleccionar {type === "image" ? "una imagen" : "un video"}</span>
          <input 
            type="file" 
            className="hidden" 
            accept={type === "image" ? "image/*" : "video/*"} 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#0a0a0f] p-3 rounded-xl border border-gray-800">
            <span className="text-xs text-violet-300 truncate max-w-[200px]">{file.name}</span>
            <button onClick={() => setFile(null)}><X className="h-4 w-4 text-gray-500" /></button>
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {uploading ? "Subiendo..." : "Confirmar Subida"}
          </Button>
        </div>
      )}
    </div>
  );
}