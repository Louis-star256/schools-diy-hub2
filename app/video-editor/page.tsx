import { AiVideoEditor } from '@/components/video-editor/ai-video-editor';
import { Scissors } from 'lucide-react';

export default function VideoEditorPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 text-center">
        <div className="inline-block rounded-full bg-primary/10 p-4 mb-4">
          <Scissors className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          AI Video Editor
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Upload your video and let our AI suggest creative edits to make it shine.
        </p>
      </header>

      <main>
        <AiVideoEditor />
      </main>
    </div>
  );
}
