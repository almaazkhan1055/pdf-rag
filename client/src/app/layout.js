import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PDF RAG",
  description:
    "Upload PDFs and ask grounded questions with retrieval-augmented generation",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="overflow-hidden">
        <ClerkProvider
          appearance={{
            cssLayerName: "clerk",
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
