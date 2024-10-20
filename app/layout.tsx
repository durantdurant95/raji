import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="min-h-screen">
              <SidebarTrigger />
              {/* <nav className="w-full flex justify-center border-b h-20">
                <div className="container flex justify-between items-center">
                  <Link href={"/"}>Raji</Link>
                  <div className="flex gap-2">
                    <AuthDropdown />
                  </div>
                </div>
              </nav> */}
              <div className="container border grow-0 flex">{children}</div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
