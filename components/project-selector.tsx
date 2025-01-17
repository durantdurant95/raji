import { fetchProjects } from "@/app/actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRight, FolderKanban } from "lucide-react";
import Link from "next/link";

export async function ProjectSelector({ user_id }: { user_id: string }) {
  const projects = await fetchProjects(user_id);
  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible
          key="Projects"
          asChild
          defaultOpen={true}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Projects">
                <FolderKanban />
                <span>Projects</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {projects.projects?.map((project) => (
                  <SidebarMenuSubItem key={project.name}>
                    <SidebarMenuSubButton asChild>
                      <Link href={`dashboard/${project.name}`}>
                        <span>{project.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
