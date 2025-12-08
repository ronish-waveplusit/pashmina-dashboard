import { Plus, X } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface Props {
  featuredImage: File | string | null;
  galleryImages: (File | string)[];
  setFeaturedImage: (file: File | string | null) => void;
  setGalleryImages: (files: (File | string)[]) => void;
}

const ImageUpload = ({
  featuredImage,
  galleryImages,
  setFeaturedImage,
  setGalleryImages,
}: Props) => {
  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
    }
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 4 - galleryImages.length);
      setGalleryImages([...galleryImages, ...newImages]);
    }
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Helper function to get image URL (works with both File and string)
  const getImageUrl = (image: File | string | null): string | null => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    return URL.createObjectURL(image);
  };

  const featuredImageUrl = getImageUrl(featuredImage);

  return (
    <div className="space-y-6">
      {/* Featured Image Section */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Featured Image <span className="text-muted-foreground">(Required)</span>
        </label>
        
        {featuredImageUrl ? (
          <div className="relative h-48 w-full overflow-hidden rounded border border-input bg-accent">
            <img
              src={featuredImageUrl}
              alt="Featured product"
              className="h-full w-full object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={removeFeaturedImage}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex h-48 w-full cursor-pointer items-center justify-center rounded border-2 border-dashed border-border bg-accent hover:bg-accent/80">
            <div className="text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Upload Featured Image</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Gallery Images Section */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Gallery Images{" "}
          <span className="text-muted-foreground">
            (Optional - Max 4 images, {galleryImages.length}/4)
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {galleryImages.map((image, index) => {
            const imageUrl = getImageUrl(image);
            return (
              <div
                key={index}
                className="relative h-32 w-full overflow-hidden rounded border border-input bg-accent"
              >
                <img
                  src={imageUrl || ''}
                  alt={`Gallery ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}

          {galleryImages.length < 4 && (
            <label className="flex h-32 w-full cursor-pointer items-center justify-center rounded border-2 border-dashed border-border bg-accent hover:bg-accent/80">
              <div className="text-center">
                <Plus className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Add Image</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {galleryImages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGalleryImages([])}
            className="mt-2 w-full text-destructive"
          >
            Clear All Gallery Images
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;