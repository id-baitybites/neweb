import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.scss";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { getCurrentUser } from "@/actions/auth";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { resolveTenant, buildThemeCSS } from "@/lib/tenant";
import Script from "next/script";
import { getLocale } from "@/i18n";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await resolveTenant();
  return {
    title: tenant ? `${tenant.name}` : "Platform | Multi-tenant Store",
    description: tenant
      ? `Selamat datang di ${tenant.name}. Pesan sekarang!`
      : "White-label store platform",
    icons: tenant?.faviconUrl ? [{ rel: "icon", url: tenant.faviconUrl }] : [],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, tenant, locale] = await Promise.all([getCurrentUser(), resolveTenant(), getLocale()]);
  console.log(`[RootLayout] Path: ${tenant ? tenant.slug : 'PLATFORM'}, User: ${user?.email}, Role: ${user?.role}, Locale: ${locale}`)

  const themeCSS = tenant ? buildThemeCSS(tenant.theme) : "";

  return (
    <html lang={locale}>
      <head>
        {themeCSS && (
          <style
            dangerouslySetInnerHTML={{ __html: themeCSS }}
            data-tenant={tenant?.slug}
          />
        )}
        {tenant?.theme?.font && tenant.theme.font !== "Inter" && (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(tenant.theme.font)}:wght@400;500;600;700&display=swap`}
          />
        )}
      </head>
      <body className={inter.className}>
        <Script
          src={process.env.MIDTRANS_IS_PRODUCTION === 'true' 
            ? "https://app.midtrans.com/snap/snap.js" 
            : "https://app.sandbox.midtrans.com/snap/snap.js"}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
        <SocketProvider>
          <Navbar user={user} tenant={tenant} locale={locale} />
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </SocketProvider>
      </body>
    </html>
  );
}
