import { useAuth } from "@/providers/auth-provider";

export function useUser() {
    const { user, loading } = useAuth();
    return { user, loading };
}

export function useSession() {
    const { session, loading } = useAuth();
    return { session, loading };
}

export function useProfile() {
    const { profile, loading } = useAuth();
    return { profile, loading };
}
