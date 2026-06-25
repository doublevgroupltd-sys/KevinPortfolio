"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { apiAssetUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ value, onChange, accept = "image/*", label = "Upload image" }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { csrfToken, fetchCsrfToken } = useAuthStore();

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const token = csrfToken || (await fetchCsrfToken());
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          credentials: "include",
          headers: { "X-CSRF-Token": token },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed.");
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [csrfToken, fetchCsrfToken, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium">{label}</p>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label={label}
        className={`relative flex min-h-[10rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? "border-gold bg-gold/5" : "border-border"
        }`}
      >
        {value ? (
          <div className="relative h-32 w-full overflow-hidden rounded-lg">
            <Image src={apiAssetUrl(value)} alt="Uploaded preview" fill className="object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              aria-label="Remove image"
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Drag and drop, or click to browse</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
