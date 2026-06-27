
import { materials } from "@/lib/placeholder-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MaterialsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Material Sourcing</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find common materials for your school DIY projects.
        </p>
      </header>
      
      <Card className="mb-8 bg-primary/5">
        <CardHeader className="items-center text-center">
          <ShoppingCart className="h-10 w-10 text-primary mb-2" />
          <CardTitle className="font-headline text-2xl">Shop for Materials</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Need to buy supplies? We've partnered with online retailers to help you get everything you need for your next project.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="flex-1 max-w-[200px]">
              <Link href="https://www.amazon.com/s?k=diy+project+materials" target="_blank" rel="noopener noreferrer">
                Shop on Amazon
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="flex-1 max-w-[200px]">
              <Link href="https://www.jumia.com.ng/catalog/?q=diy+materials" target="_blank" rel="noopener noreferrer">
                Shop on Jumia
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materials.map((material) => (
          <Card key={material.name} className="overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative h-56 w-full">
                    <Image
                        src={material.imageUrl}
                        alt={material.name}
                        fill
                        className="object-cover"
                        data-ai-hint={material.imageHint}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="font-headline text-2xl mb-2">{material.name}</CardTitle>
              <p className="text-muted-foreground mb-4">{material.description}</p>
              
              <h4 className="font-semibold mb-2">Easy-to-find sources:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {material.sources.map(source => (
                    <li key={source} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{source}</span>
                    </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
