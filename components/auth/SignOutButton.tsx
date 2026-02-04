'use client';

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
    return (
        <button
            onClick={async () => {
                await signOut({ redirect: false });
                window.location.href = window.location.origin;
            }}
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors w-full text-left"
        >
            <LogOut className="w-4 h-4" />
            Sign out
        </button>
    );
}
