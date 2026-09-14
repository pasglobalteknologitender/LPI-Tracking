import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: 'Link Pasific Logistics - Ocean Shipment Tracking',
  description: 'Track your ocean shipments in real-time',
  icons: {
    icon: [
      {
        url: '/Logo_LPI.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Logo_LPI.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/Logo_LPI.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/Logo_LPI.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
