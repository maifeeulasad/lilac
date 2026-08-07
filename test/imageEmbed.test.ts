import { describe, expect, it } from 'vitest';
import { imageFilesFrom, isEmbeddableImage, readAsDataUrl, resolveImageSource } from '../core/utils/imageEmbed';

const imageFile = (bytes = 'x', type = 'image/png', name = 'p.png') => new File([bytes], name, { type });

describe('isEmbeddableImage', () => {
  it('accepts images', () => {
    expect(isEmbeddableImage(imageFile())).toEqual({ ok: true });
  });

  it('rejects non-images', () => {
    const result = isEmbeddableImage(new File(['x'], 'a.txt', { type: 'text/plain' }));
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('not an image');
  });

  it('rejects images over the size limit', () => {
    const result = isEmbeddableImage(imageFile('abcdef'), 3);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('exceeds');
  });
});

describe('imageFilesFrom', () => {
  it('keeps only image files', () => {
    const list = [imageFile('a'), new File(['b'], 'b.txt', { type: 'text/plain' })] as unknown as FileList;
    expect(imageFilesFrom(list)).toHaveLength(1);
  });

  it('tolerates null', () => {
    expect(imageFilesFrom(null)).toEqual([]);
  });
});

describe('resolveImageSource', () => {
  it('uses the upload hook when provided', async () => {
    const src = await resolveImageSource(imageFile(), { onImageUpload: async () => 'https://cdn/x.png' });
    expect(src).toBe('https://cdn/x.png');
  });

  it('inlines as a base64 data URL by default', async () => {
    const src = await resolveImageSource(imageFile('hello'));
    expect(src.startsWith('data:image/png;base64,')).toBe(true);
  });
});

describe('readAsDataUrl', () => {
  it('produces a data URL', async () => {
    const src = await readAsDataUrl(imageFile('hi'));
    expect(src).toMatch(/^data:image\/png;base64,/);
  });
});
