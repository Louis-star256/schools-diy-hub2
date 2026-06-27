import { SignUpForm } from "@/components/auth/signup-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

export default function IndividualSignUpPage() {
    return (
        <div className="w-full max-w-sm mx-auto">
            <BackButton />
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Individual Sign Up</CardTitle>
                    <CardDescription>
                        Create your personal account to start showcasing your innovations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignUpForm />
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline text-primary">
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
