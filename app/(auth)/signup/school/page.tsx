import { SchoolSignUpForm } from "@/components/auth/school-signup-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

export default function InstitutionSignUpPage() {
    return (
        <div className="w-full max-w-lg mx-auto">
            <BackButton />
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Institution Registration</CardTitle>
                    <CardDescription>
                        Enter your school's details to create a verified institution account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SchoolSignUpForm />
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
