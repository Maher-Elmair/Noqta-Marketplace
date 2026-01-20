/**
 * Image Upload Component using react-dropzone
 */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  className,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(images);
  const t = useTranslation();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages: string[] = [];
      const remainingSlots = maxImages - previews.length;

      acceptedFiles.slice(0, remainingSlots).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          newImages.push(result);
          if (
            newImages.length === Math.min(acceptedFiles.length, remainingSlots)
          ) {
            const updatedImages = [...previews, ...newImages];
            setPreviews(updatedImages);
            onImagesChange(updatedImages);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [previews, maxImages, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: maxImages - previews.length,
  });

  const removeImage = (index: number) => {
    const updatedImages = previews.filter((_, i) => i !== index);
    setPreviews(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {previews.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm text-muted-foreground">
                {t("common.dropImagesHere")}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t("common.dragDropImages")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {previews.length} / {maxImages} {t("common.imagesCount")}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
