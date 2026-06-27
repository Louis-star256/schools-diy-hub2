
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import Image from "next/image";
import placeholderImagesData from '@/lib/placeholder-images.json';

const { placeholderImages } = placeholderImagesData;

// Select a few images for the gallery
const galleryImages = [
  placeholderImages.find((p) => p.id === 'project-1'),
  placeholderImages.find((p) => p.id === 'project-2'),
  placeholderImages.find((p) => p.id === 'project-3'),
  placeholderImages.find((p) => p.id === 'project-4'),
  placeholderImages.find((p) => p.id === 'project-5'),
  placeholderImages.find((p) => p.id === 'material-1'),
].filter(Boolean) as (typeof placeholderImages)[0][];


export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">My AI Image Gallery</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A collection of images generated and used in this project.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {galleryImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        data-ai-hint={image.imageHint}
                    />
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground capitalize">{image.imageHint}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
