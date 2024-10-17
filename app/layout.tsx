import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  metadataBase: process.env.VERCEL_URL,
  title: "Raji - Project Management",
  description: "Raji is a project management tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <Link href={"/"}>Raji</Link>
                <ThemeSwitcher />
              </div>
            </nav>
            <div className="container">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
