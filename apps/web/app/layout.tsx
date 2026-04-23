import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { ConvexClientProvider } from "../components/convex-client-provider";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Paideia",
    template: "%s | Paideia",
  },
  description:
    "An AI learning product for students and teachers that keeps tutoring Socratic and writing voice-aware.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", figtree.variable, geistMono.variable, "font-sans")}
    >
      <body>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
