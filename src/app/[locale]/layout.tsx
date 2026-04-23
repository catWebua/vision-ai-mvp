import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Vision MVP | Moondream2 + Modal",
  description: "Next-gen image analysis powered by Modal AI and Moondream2.",
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#020205] text-white antialiased selection:bg-white selection:text-black`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="bottom-right" theme="dark" closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
