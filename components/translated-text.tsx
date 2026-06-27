
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { universalAiTool } from '@/ai/flows/universal-ai-tool';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
}

/**
 * A component that automatically translates its content using Louis AI
 * when the user's preferred language is not English.
 */
export function TranslatedText({ text, className, as: Component = 'p' }: TranslatedTextProps) {
  const { lang, t } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If language is English, just use original text
    if (!lang || lang === 'en') {
      setTranslatedText(text);
      return;
    }

    const performTranslation = async () => {
      setIsTranslating(true);
      setHasError(false);
      try {
        const response = await universalAiTool({
          category: 'translation',
          promptSelection: `Translate into ${lang}. Return only the translated text.`,
          text: text
        });
        setTranslatedText(response.result);
      } catch (error) {
        console.error("Louis failed to translate:", error);
        setHasError(true);
        setTranslatedText(text); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [text, lang]);

  if (lang === 'en' || !lang) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <div className="relative group">
      <Component className={cn(className, isTranslating && "opacity-50 transition-opacity")}>
        {translatedText}
      </Component>
      {isTranslating && (
        <div className="absolute top-0 right-0 -mr-2 -mt-2">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </div>
      )}
      {!isTranslating && text !== translatedText && (
        <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-primary/60 uppercase tracking-widest">
          <Sparkles className="h-2 w-2" />
          <span>{t('translateByLouis')}</span>
        </div>
      )}
    </div>
  );
}
