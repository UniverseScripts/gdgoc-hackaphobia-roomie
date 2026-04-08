import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav"; // Import it

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitNest",
  description: "Find your perfect roommate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen pb-20"> {/* Padding bottom for the Nav */}
          {children}
        </div>
        <BottomNav /> {/* Placed globally here */}
      </body>
    </html>
  );
}
