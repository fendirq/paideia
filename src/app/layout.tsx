import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paideia — AI Tutoring for Drew School",
  description:
    "Socratic AI tutoring powered by your coursework. Upload, learn, grow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={playfair.variable}
    >
      <body className="bg-bg-base font-body text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
