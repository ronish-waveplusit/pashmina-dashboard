export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Validates an image file against the backend's upload rules (type + size).
 * Returns an error message string, or null when the file is acceptable.
 *
 * @param maxMB max allowed size in megabytes (banners: 3, page/about: 2)
 */
export function validateImageFile(file: File, maxMB: number): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG or WEBP image.";
  }
  if (file.size > maxMB * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Image is ${sizeMb}MB — please use one ${maxMB}MB or smaller.`;
  }
  return null;
}
