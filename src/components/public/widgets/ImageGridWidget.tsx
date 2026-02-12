import Image from 'next/image';

interface ImageGridWidgetProps {
  images: {
    src: string;
    alt: string;
    href?: string;
  }[];
}

export const ImageGridWidget = ({ images }: ImageGridWidgetProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {images.map((image, index) => {
        const imageElement = (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-border-light bg-bg-main"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </div>
        );

        if (image.href) {
          return (
            <a
              key={index}
              href={image.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              {imageElement}
            </a>
          );
        }

        return imageElement;
      })}
    </div>
  );
};
