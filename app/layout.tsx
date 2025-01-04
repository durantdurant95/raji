import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

export const metadata = {
  metadataBase: process.env.VERCEL_URL,
  title: "Raji - Project Management",
  description: "Raji is a project management tool",
};

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(instrument_sans.variable)}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen w-full">
            <div className="grow-0 flex">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
