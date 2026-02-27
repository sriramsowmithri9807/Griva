import { AuthForm } from "@/components/auth/auth-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up | Griva",
    description: "Create your account",
};

export default function SignupPage() {
    return <AuthForm type="signup" />;
}
