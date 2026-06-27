
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { AppNav } from '@/components/app-nav';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: {
    default: "School's DIY Hub | Innovation & Creativity Lab",
    template: "%s | School's DIY Hub"
  },
  description: "The global laboratory for students to build real-world DIY projects, learn engineering, and showcase inventions.",
  keywords: [
    "student innovation hub", 
    "DIY school projects", 
    "learn coding and engineering", 
    "STEM projects", 
    "robotics for students", 
    "invention gallery",
    "best site for student projects"
  ],
  authors: [{ name: "School's DIY Hub Team" }],
  creator: "School's DIY Hub",
  publisher: "School's DIY Hub",
  icons: {
    icon: 'https://i.imgur.com/gdkdHKr.jpeg',
    apple: 'https://i.imgur.com/gdkdHKr.jpeg',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "School's DIY Hub - Global Lab for Student Creativity",
    description: "The premier global laboratory for students to build and showcase real-world inventions.",
    siteName: "School's DIY Hub",
    images: [
      {
        url: "https://i.imgur.com/gdkdHKr.jpeg",
        width: 1200,
        height: 630,
        alt: "School's DIY Hub",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="https://i.imgur.com/gdkdHKr.jpeg" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader className="p-4">
                <Logo />
              </SidebarHeader>
              <SidebarContent>
                <AppNav />
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <div className="flex min-h-screen flex-col">
                <Header />
                <Toaster />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </SidebarInset>
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
