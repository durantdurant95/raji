import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: LayoutProps) => {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
