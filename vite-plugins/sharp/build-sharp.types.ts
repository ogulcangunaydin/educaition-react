import {
  AvifOptions,
  FormatEnum,
  GifOptions,
  HeifOptions,
  Jp2Options,
  JpegOptions,
  PngOptions,
  TiffOptions,
  WebpOptions,
} from 'sharp';

export type Codecs = keyof FormatEnum;

export type SharpEncodeOptions<Codec extends Codecs = Codecs> = Codec extends 'jpeg'
  ? Partial<JpegOptions>
  : Codec extends 'jp2'
    ? Partial<Jp2Options>
    : Codec extends 'png'
      ? Partial<PngOptions>
      : Codec extends 'webp'
        ? Partial<WebpOptions>
        : Codec extends 'gif'
          ? Partial<GifOptions>
          : Codec extends 'avif'
            ? Partial<AvifOptions>
            : Codec extends 'heif'
              ? Partial<HeifOptions>
              : Codec extends 'tiff'
                ? Partial<TiffOptions>
                : never;
