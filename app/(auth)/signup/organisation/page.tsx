import { OrganisationSignUpForm } from "@/components/auth/organisation-signup-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

export default function OrganisationSignUpPage() {
    return (
        <div className="w-full max-w-lg mx-auto">
            <BackButton />
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Organisation Registration</CardTitle>
                    <CardDescription>
                        Register your club, NGO, or creative organisation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OrganisationSignUpForm />
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
