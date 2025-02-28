import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserSelector } from "@/components/user-selector";
import { getUserProfile } from "@/utils/supabase/actions/auth";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from "react";
import { ProjectSelector } from "./project-selector";
import { Button } from "./ui/button";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { profile, error } = await getUserProfile();

  if (error) {
    redirect("/sign-in");
  }

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar" {...props}>
      <SidebarHeader>
        {profile && <UserSelector user={profile} />}
      </SidebarHeader>
      <SidebarContent>
        <ProjectSelector />
      </SidebarContent>
      <SidebarFooter className="items-center gap-4 p-4">
        <Link href="/dashboard/projects">
          <Button>
            <FolderKanban />
            Manage Projects
          </Button>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
