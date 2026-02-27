import { AuthForm } from "@/components/auth/auth-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Griva",
    description: "Login to your account",
};

export default function LoginPage() {
    return <AuthForm type="login" />;
}
