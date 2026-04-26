import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Digital Vision Test — Estimación de agudeza visual',
  description:
    'Herramienta de estimación visual interactiva. Realiza un test de agudeza visual aproximado desde casa con reconocimiento de voz. No es un diagnóstico médico.',
  keywords: ['test visual', 'agudeza visual', 'optometría', 'visión'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
