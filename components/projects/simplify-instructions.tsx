"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { simplifyInstructions } from "@/ai/flows/simplify-instructions";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Loader2, Wand2 } from "lucide-react";

type SimplifyInstructionsProps = {
  initialInstructions: string;
};

type FormState = {
  simplifiedInstructions?: string;
  error?: string;
};

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="secondary" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Simplifying...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Simplify
        </>
      )}
    </Button>
  );
}

export function SimplifyInstructions({ initialInstructions }: SimplifyInstructionsProps) {
  const [instructions, setInstructions] = useState(initialInstructions);

  const simplifyInstructionsWithText = async (prevState: FormState, formData: FormData) => {
    formData.append("instructions", initialInstructions);
    const skillLevel = formData.get("skillLevel") as "beginner" | "intermediate" | "advanced";

    if (!skillLevel) {
        return { error: "Please select a skill level." };
    }

    try {
        const result = await simplifyInstructions({ instructions: initialInstructions, skillLevel });
        if(result.simplifiedInstructions) {
            setInstructions(result.simplifiedInstructions);
        }
        return result;
    } catch(e: any) {
        return { error: e.message || "Failed to simplify instructions." };
    }
  };

  const [state, formAction] = useFormState(simplifyInstructionsWithText, initialState);

  return (
    <div className="space-y-6">
      <div className="prose prose-blue max-w-none rounded-md border bg-background p-4">
        <div
          dangerouslySetInnerHTML={{
            __html: instructions.replace(/\n/g, "<br />"),
          }}
        />
      </div>

      <div className="rounded-lg border bg-background/50 p-4">
        <form action={formAction} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h4 className="font-semibold">Need an easier version?</h4>
                <p className="text-sm text-muted-foreground">
                Let our AI simplify these instructions for you.
                </p>
            </div>
            <SubmitButton />
          </div>
          <div>
            <Label className="text-sm font-medium">Your Skill Level</Label>
            <RadioGroup
              name="skillLevel"
              defaultValue="beginner"
              className="mt-2 flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="s-beginner" />
                <Label htmlFor="s-beginner" className="font-normal">Beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="s-intermediate" />
                <Label htmlFor="s-intermediate" className="font-normal">Intermediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced"id="s-advanced" />
                <Label htmlFor="s-advanced" className="font-normal">Advanced</Label>
              </div>
            </RadioGroup>
          </div>
          {state?.error && (
             <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}
