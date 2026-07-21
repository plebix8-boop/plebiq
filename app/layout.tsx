import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { NavigationProgress } from "@/components/navigation-progress";
import { PageTransition } from "@/components/page-transition";
import { MotionProvider } from "@/components/motion-provider";
import { SiteStructuredData } from "@/components/structured-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plebiq.com"),
  title: {
    default: "Plebiq — the world votes here",
    template: "%s | Plebiq",
  },
  description:
    "Plebiq is a social voting platform where the world shares opinions and votes on the questions that matter.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://plebiq.com",
    siteName: "Plebiq",
    title: "Plebiq — the world votes here",
    description:
      "Share your opinion, discover what people think, and vote on Plebiq.",
    locale: "en_US",
    images: [{ url: "/logo.png", width: 1266, height: 435, alt: "Plebiq" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plebiq — the world votes here",
    description:
      "Share your opinion, discover what people think, and vote on Plebiq.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeInitScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("plebiq-theme");
    const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
      ? storedTheme
      : "system";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "system";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteStructuredData />
        <ThemeProvider>
          <AuthProvider>
            <MotionProvider>
              <NavigationProgress />
              <PageTransition>{children}</PageTransition>
            </MotionProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
