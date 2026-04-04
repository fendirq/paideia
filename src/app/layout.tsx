import type { Metadata } from "next";
import { Space_Grotesk, Inter, Libre_Baskerville } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${libreBaskerville.variable}`}
    >
      <body className="bg-bg-base font-body text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
