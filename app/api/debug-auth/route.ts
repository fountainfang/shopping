import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return NextResponse.json({
        env: {
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_URL: process.env.VERCEL_URL,
        },
        headers: {
            host: req.headers.get("host"),
            "x-forwarded-host": req.headers.get("x-forwarded-host"),
            "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
        }
    });
}
