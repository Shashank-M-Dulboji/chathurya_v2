import type { Metadata } from "next";
import { Inter, Michroma } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-michroma",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chathurya — Student Developers Club",
    template: "%s | Chathurya SDC",
  },
  description:
    "Build. Learn. Ship. The student developer community at Seshadripuram College, Bengaluru.",
  keywords: ["developer", "student", "club", "coding", "bengaluru", "seshadripuram"],
  authors: [{ name: "Chathurya SDC" }],
  openGraph: {
    title: "Chathurya — Student Developers Club",
    description: "Build. Learn. Ship.",
    siteName: "Chathurya SDC",
    locale: "en_IN",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${michroma.variable}`}>
      <body className="bg-black text-off-white antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#111111",
              border: "0.5px solid #2a2a2a",
              color: "#f1f2ee",
              fontFamily: "var(--font-inter)",
            },
          }}
        />
      </body>
    </html>
  );
}
