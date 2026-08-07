// Image embedding helpers.
//
// The default path is fully client-side: a dropped or pasted image becomes an
// inline base64 data URL, so the editor keeps working with no server and no
// dependencies. Consumers that have real storage can pass an `onImageUpload`
// hook and return a URL instead. Kept DOM-free (FileReader aside) so the
// validation and reading logic can be unit-tested with mock files.
/** Whether a file is an image within the optional size limit. */
export function isEmbeddableImage(file, maxImageSize) {
    if (!file.type.startsWith('image/')) {
        return { ok: false, reason: `not an image (${file.type || 'unknown type'})` };
    }
    if (maxImageSize !== undefined && file.size > maxImageSize) {
        return { ok: false, reason: `image exceeds ${maxImageSize} bytes (${file.size})` };
    }
    return { ok: true };
}
/** Read a blob as a base64 data URL. */
export function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error('failed to read image'));
        reader.readAsDataURL(file);
    });
}
/** Pick from image files in a drop/paste list, filtering out non-images. */
export function imageFilesFrom(list) {
    return Array.from(list ?? []).filter((file) => file.type.startsWith('image/'));
}
/**
 * Resolve the `src` to embed for a file: the upload hook's URL when provided,
 * otherwise an inline data URL.
 */
export async function resolveImageSource(file, options = {}) {
    if (options.onImageUpload)
        return options.onImageUpload(file);
    return readAsDataUrl(file);
}
