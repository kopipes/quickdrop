import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuikDrop — Quick tools for everyday files",
  description:
    "Fast, privacy-conscious file utilities. Compress PDFs, shrink presentations, add watermarks, and generate QR codes. Your files are processed temporarily and automatically deleted.",
  metadataBase: new URL("https://quikdrop.app"),
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NavBar />
        <main className="flex-1">{props.children}</main>
        <Footer />
      </body>
    </html>
  );
}