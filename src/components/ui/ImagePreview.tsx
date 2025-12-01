"use client"; // Remove if not using Next.js (it's harmless in plain React)

import { useState } from "react";
import { Eye, X } from "lucide-react"; // npm install lucide-react @types/lucide-react if needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"; // Adjust path to your UI library (e.g., shadcn/ui)

interface ImagePreviewProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showViewButton?: boolean; // Optional: show "View" button (e.g., in actions column)
}

export default function ImagePreview({
  src,
  alt,
  size = "md",
  className = "",
  showViewButton = false,
}: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  } as const;

  if (!src) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-300 ${className}`}
      >
        No Image
      </div>
    );
  }

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openModal = () => {
    setIsLoading(true);
    setHasError(false);
    setIsOpen(true);
  };

  if (hasError) {
    return (
      <div
        className={`${sizeClasses[size]} bg-red-100 rounded flex items-center justify-center text-red-600 text-xs ${className}`}
      >
        Image Failed to Load
      </div>
    );
  }

  return (
    <>
      <div className={`relative group inline-block ${className}`}>
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} object-cover rounded cursor-pointer transition-all hover:brightness-90`}
          onClick={openModal}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Hover overlay with eye icon */}
        <div
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center cursor-pointer"
          onClick={openModal}
        >
          <Eye className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Optional: Small View Button (e.g., in Actions column) */}
      {showViewButton && (
        <button
          onClick={openModal}
          className="ml-2 p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="View Image"
          type="button"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0 max-h-screen h-screen">
          <DialogHeader className="absolute top-4 left-4 z-10 p-0">
            <DialogTitle className="text-white text-lg">{alt}</DialogTitle>
          </DialogHeader>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-lg">Loading...</div>
              </div>
            )}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}