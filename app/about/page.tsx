
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import placeholderImagesData from '@/lib/placeholder-images.json';
import { Lightbulb, Users, Milestone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";

const { placeholderImages } = placeholderImagesData;
const logoBackground = placeholderImages.find((p) => p.id === 'project-6');

export const metadata = {
  title: "About Our Mission | School's DIY Hub",
  description: "Learn about the mission of School's DIY Hub to provide the best site to improve creativity for students worldwide.",
};

export default function AboutPage() {
  return (
    <div className="container auto px-4 py-8 md:px-6 md:py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Our Mission & Vision</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Empowering the next generation of creative thinkers and engineering masters.
        </p>
      </header>

      <div className="mx-auto max-w-4xl space-y-12">
        <Card className="relative overflow-hidden">
          {logoBackground && (
            <div className="absolute inset-0 z-0 opacity-5">
              <Image
                src={logoBackground.imageUrl}
                alt="Innovation Background"
                fill
                className="object-contain"
                data-ai-hint={logoBackground.imageHint}
              />
            </div>
          )}
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-center">The Innovation Hub</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-8 items-center">
                    <div className="text-lg text-muted-foreground space-y-4">
                        <p>
                            School's DIY Hub was founded on a simple mission: to create a global laboratory for students who want to build the future.
                        </p>
                        <p>
                            This platform is a testament to the power of robotics, engineering, and community-led innovation. We believe every student deserves a laboratory to turn their imagination into reality.
                        </p>
                        <div className="pt-4 flex justify-center">
                            <Button asChild className="rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white border-none shadow-lg shadow-green-500/20 px-8 h-12 transition-all active:scale-95">
                                <NextLink href="https://wa.me/256748332252" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-bold">
                                    <MessageCircle className="h-5 w-5" />
                                    Contact the Hub Team
                                </NextLink>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
          </div>
        </Card>

        <Card>
            <CardHeader>
                 <CardTitle className="font-headline text-3xl text-center">Our Commitment to Innovation</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <Lightbulb className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Boost Creativity</h3>
                    <p className="text-muted-foreground mt-2">
                        Providing AI-guided pathways for students to turn imagination into functional prototypes.
                    </p>
                </div>
                 <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Global Community</h3>
                    <p className="text-muted-foreground mt-2">
                        Connecting innovators from across the world to solve global challenges in energy and safety.
                    </p>
                </div>
                 <div className="flex flex-col items-center">
                    <Milestone className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Hands-on Success</h3>
                    <p className="text-muted-foreground mt-2">
                        Turning digital knowledge into physical expertise with verified skills in engineering and craft.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
