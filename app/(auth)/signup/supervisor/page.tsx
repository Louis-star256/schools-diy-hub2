
import { SupervisorSignUpForm } from "@/components/auth/supervisor-signup-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

export default function SupervisorSignUpPage() {
    return (
        <div className="w-full max-w-lg mx-auto">
            <BackButton />
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Supervisor Registration</CardTitle>
                    <CardDescription>
                        Create your Patron account to manage student innovations at your school.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SupervisorSignUpForm />
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
