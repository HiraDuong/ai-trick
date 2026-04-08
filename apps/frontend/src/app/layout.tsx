// Luvina
// Vu Huy Hoang - Dev2
import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { fetchCategoryTree } from "@/lib/api";
import { IBM_Plex_Mono, Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Internal Knowledge Sharing Platform",
  description: "Frontend article archive and article detail experience for the Internal Knowledge Sharing Platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categoryResult = await fetchCategoryTree();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${newsreader.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MainLayout
          categories={categoryResult.ok ? categoryResult.data.categories : []}
          categoryError={categoryResult.ok ? null : categoryResult.message}
        >
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
