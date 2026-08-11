import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { absoluteUrl, siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.metadata.baseUrl),
  title: { default: siteConfig.metadata.title, template: `%s — ${siteConfig.name}` },
  description: siteConfig.metadata.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: absoluteUrl(),
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
    siteName: siteConfig.name,
    images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: `${siteConfig.name} portfolio preview` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
    images: [absoluteUrl("/opengraph-image")],
  },
  icons: { icon: absoluteUrl("/icon.svg") },
};

export const viewport: Viewport = { colorScheme: "light dark", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f7f8fa" }, { media: "(prefers-color-scheme: dark)", color: "#17191d" }] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
