import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
    title: "FoodMap",
    description: "Encuentra restaurantes  cerca de ti",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es">
            <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}