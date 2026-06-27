"use client";

import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { generateProjectIdeas } from "@/ai/flows/generate-project-ideas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Loader2, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { Input } from "../ui/input";
import Image from "next/image";

type FormState = {
  projectIdeas?: string[];
  error?: string;
};

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Ideas
        </>
      )}
    </Button>
  );
}

export function ProjectIdeasForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const [state, formAction] = useFormState(
    async (
      prevState: FormState,
      formData: FormData
    ): Promise<FormState> => {
      try {
        const materials = formData.get("materials") as string;
        const skillLevel = formData.get("skillLevel") as
          | "beginner"
          | "intermediate"
          | "advanced";
        const imageFile = formData.get("image") as File;

        let photoDataUri: string | undefined = undefined;

        if (imageFile && imageFile.size > 0) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            photoDataUri = `data:${imageFile.type};base64,${base64}`;
        }
        
        if (!materials && !photoDataUri) {
          return { error: "Please provide materials description and/or an image." };
        }
        
        const result = await generateProjectIdeas({ materials, skillLevel, photoDataUri });
        return result;
      } catch (e: any) {
        return { error: e.message || "An unknown error occurred." };
      }
    },
    initialState
  );

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>What do you have?</CardTitle>
          <CardDescription>
            Describe your materials, upload a picture, and select your skill level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="materials">Available Materials (optional)</Label>
            <Textarea
              id="materials"
              name="materials"
              placeholder="e.g., cardboard, glue, an Arduino, some LEDs..."
            />
          </div>
          <div className="space-y-2">
              <Label htmlFor="image">Picture of Materials (optional)</Label>
              <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="relative mt-2 w-full max-w-sm h-48 rounded-md border">
                    <Image src={imagePreview} alt="Image preview" fill className="object-contain" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => {
                            setImagePreview(null);
                            const input = document.getElementById('image') as HTMLInputElement;
                            if(input) input.value = '';
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
              )}
          </div>
          <div className="space-y-2">
            <Label>Skill Level</Label>
            <RadioGroup
              name="skillLevel"
              defaultValue="beginner"
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">Beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">Intermediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced">Advanced</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
      {(state?.projectIdeas || state?.error) && (
        <CardContent>
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Suggestions</h3>
            {state.projectIdeas && state.projectIdeas.length > 0 && (
              <ul className="list-disc space-y-2 rounded-md border bg-background p-4 pl-8">
                {state.projectIdeas.map((idea, index) => (
                  <li key={index}>{idea}</li>
                ))}
              </ul>
            )}
             {state.error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
             )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
