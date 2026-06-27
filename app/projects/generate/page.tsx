import { ProjectIdeasForm } from "@/components/projects/project-ideas-form";
import { Lightbulb } from "lucide-react";

export default function GenerateIdeasPage() {
    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
            <header className="mb-8 text-center">
                 <div className="inline-block rounded-full bg-primary/10 p-4 mb-4">
                    <Lightbulb className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline tracking-tight">Generate Project Ideas</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Don't know what to build? Let our AI assistant give you some inspiration!
                </p>
            </header>
            
            <main>
                <ProjectIdeasForm />
            </main>
        </div>
    );
}
