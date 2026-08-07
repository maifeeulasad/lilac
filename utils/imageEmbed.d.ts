export interface ImageEmbedOptions {
    /** Swap inlining for a real uploader; return the URL to embed. */
    onImageUpload?: (file: File) => Promise<string>;
    /** Reject images larger than this many bytes. Default: no limit. */
    maxImageSize?: number;
}
export interface ImageCheck {
    ok: boolean;
    reason?: string;
}
/** Whether a file is an image within the optional size limit. */
export declare function isEmbeddableImage(file: File, maxImageSize?: number): ImageCheck;
/** Read a blob as a base64 data URL. */
export declare function readAsDataUrl(file: Blob): Promise<string>;
/** Pick from image files in a drop/paste list, filtering out non-images. */
export declare function imageFilesFrom(list: FileList | null | undefined): File[];
/**
 * Resolve the `src` to embed for a file: the upload hook's URL when provided,
 * otherwise an inline data URL.
 */
export declare function resolveImageSource(file: File, options?: ImageEmbedOptions): Promise<string>;
