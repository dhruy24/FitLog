import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProfileSelector from "@/components/ProfileSelector";
import Navbar from "@/components/Navbar";
import { generateMetadata as generateSEOMetadata, SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = generateSEOMetadata({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: "/",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <div className="fixed top-20 right-4 bottom-auto md:bottom-auto md:top-20 md:right-4 z-50">
          <ProfileSelector />
        </div>
        {children}
      </body>
    </html>
  );
}
