import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { absoluteUrl, siteConfig } from "@/config/site";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { createPageMetadata } from "@/lib/metadata";
import { validateSiteRouteReferences } from "@/lib/site-routes";

validateSiteRouteReferences();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.metadata.baseUrl),
  ...createPageMetadata({
    path: "/",
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
  }),
  title: { default: siteConfig.metadata.title, template: `%s — ${siteConfig.name}` },
  icons: { icon: absoluteUrl("/icon.svg") },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#14161a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
