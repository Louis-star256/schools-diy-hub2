'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Languages, BarChart3, FileText, Database, MessageSquare, Lightbulb, Copy, Check } from 'lucide-react';
import { universalAiTool } from '@/ai/flows/universal-ai-tool';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const PROMPT_LIBRARY = {
  analysis: {
    icon: BarChart3,
    title: 'Text Analysis',
    prompts: [
      'Classify this text as Positive, Neutral, or Negative.',
      'Detect the language of this input.',
      'Extract all email addresses from this text.',
      'Identify the main topic in one sentence.',
      'Highlight any named entities (people, places, organizations).',
    ]
  },
  summarization: {
    icon: FileText,
    title: 'Summarization & Rewriting',
    prompts: [
      'Summarize this article in 3 bullet points.',
      'Rewrite this feedback in polite business tone.',
      'Condense this paragraph into 50 words.',
      'Explain this technical text in simple language.',
      'Rephrase this sentence to sound more persuasive.',
    ]
  },
  translation: {
    icon: Languages,
    title: 'Translation',
    prompts: [
      'Translate this text from English to Luganda.',
      'Translate this text from English to Swahili with casual tone.',
      'Translate this message into French, keep formal tone.',
      'Provide both original and translated versions in JSON format.',
      'Translate into Spanish and return only the translated text.',
    ]
  },
  data: {
    icon: Database,
    title: 'Structured Data',
    prompts: [
      'Convert this text into a JSON object with fields: name, age, location.',
      'Extract keywords and return them as a comma-separated list.',
      'Turn this review into a table with columns: sentiment, topic, length.',
      'Generate a JSON array of 3 suggested improvements.',
      'Return structured data with fields: title, summary, sentiment.',
    ]
  },
  chat: {
    icon: MessageSquare,
    title: 'Chatbot Responses',
    prompts: [
      'Generate a friendly greeting for a new user.',
      'Answer this question in less than 30 words.',
      'Provide 3 possible replies to this customer inquiry.',
      'Respond in casual tone with emojis.',
      'Suggest a polite closing line for a support chat.',
    ]
  },
  creative: {
    icon: Lightbulb,
    title: 'Creative Content',
    prompts: [
      'Write a product description in 2 sentences, persuasive style.',
      'Suggest 5 catchy titles for this blog post.',
      'Generate a short motivational quote.',
      'Create a fun fact about technology in one line.',
      'Write a playful tagline for a mobile app.',
    ]
  }
};

export function AiLabContent() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof PROMPT_LIBRARY>('analysis');
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_LIBRARY.analysis.prompts[0]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleRunTool = async () => {
    if (!inputText.trim()) {
      toast({ variant: 'destructive', title: 'Empty Input', description: 'Please provide some text to process.' });
      return;
    }

    setIsLoading(true);
    try {
      const output = await universalAiTool({
        category: activeCategory,
        promptSelection: selectedPrompt,
        text: inputText
      });
      setResult(output.result);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'AI Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Result copied to clipboard.' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Toolbox Categories</CardTitle>
            <CardDescription>Select a category from the library.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeCategory} 
              onValueChange={(v) => {
                const cat = v as keyof typeof PROMPT_LIBRARY;
                setActiveCategory(cat);
                setSelectedPrompt(PROMPT_LIBRARY[cat].prompts[0]);
              }} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 gap-2 bg-transparent h-auto p-0">
                {Object.entries(PROMPT_LIBRARY).map(([key, data]) => {
                  const Icon = data.icon;
                  return (
                    <TabsTrigger 
                      key={key} 
                      value={key} 
                      className="flex flex-col gap-1 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary border"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px] uppercase font-bold">{data.title.split(' ')[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Select Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Instruction from Library</Label>
            <div className="space-y-2">
              {PROMPT_LIBRARY[activeCategory].prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPrompt(p)}
                  className={cn(
                    "w-full text-left p-3 rounded-md text-sm transition-all border",
                    selectedPrompt === p 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-muted/50 hover:bg-muted border-transparent"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Input Content
            </CardTitle>
            <CardDescription>Paste the text you want Louis to process below.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Textarea
              placeholder="Type or paste your text here..."
              className="min-h-[200px] text-base"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="border-t pt-6 bg-muted/10">
            <Button 
              onClick={handleRunTool} 
              className="w-full h-12 text-lg font-headline gap-2" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Run {PROMPT_LIBRARY[activeCategory].title}
            </Button>
          </CardFooter>
        </Card>

        <Card className={cn("transition-all duration-500", result ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4")}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">AI Result</CardTitle>
              <CardDescription>Louis's processed output</CardDescription>
            </div>
            {result && (
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/20">
              {result ? (
                <div className="whitespace-pre-wrap leading-relaxed text-lg">
                  {result}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 italic">
                  <Sparkles className="h-12 w-12 mb-4" />
                  <p>Select a tool and click run to see results here.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
