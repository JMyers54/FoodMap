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
            <body className="min-h-dvh bg-[#f6e7cc] text-[#2b1a10] antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}