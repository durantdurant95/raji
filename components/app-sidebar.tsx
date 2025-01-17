import { getUserProfile } from "@/app/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserSelector } from "@/components/user-selector";
import { redirect } from "next/navigation";
import * as React from "react";
import { ProjectSelector } from "./project-selector";

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
        {profile?.user_id && <ProjectSelector user_id={profile.user_id} />}
        {/* <NavProjects projects={projects || []} /> */}
      </SidebarContent>
      <SidebarFooter className="flex justify-end"></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
