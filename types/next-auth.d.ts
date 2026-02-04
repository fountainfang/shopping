
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface AuthOptions {
        trustHost?: boolean;
    }

    interface Session {
        user?: {
            id?: string;
            role?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role?: string;
    }
}
