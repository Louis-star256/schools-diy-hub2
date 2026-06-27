import { DiyAssistantChat } from "@/components/ai/diy-assistant-chat";
import Image from "next/image";

export default function AiAssistantPage() {
    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
            <header className="mb-8 text-center">
                 <div className="inline-block rounded-2xl bg-white/[0.03] p-4 mb-4 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="relative h-12 w-12 shrink-0 flex items-center justify-center z-10">
                        <div className="relative h-full w-full z-10">
                          <Image 
                            src="https://kommodo.ai/i/f2gHb05ASiAyNCF" 
                            alt="Louis Logo" 
                            fill 
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                    </div>
                </div>
                <h1 className="text-4xl font-bold font-headline tracking-tight">Louis - Your AI DIY Assistant</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Have a question? Ask me anything about DIY, from materials to techniques!
                </p>
            </header>
            
            <main>
                <DiyAssistantChat />
            </main>
        </div>
    );
}
