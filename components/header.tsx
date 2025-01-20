"use client";
import { NewProjectModal } from "./new-project-modal";
import { ThemeSwitcher } from "./theme-switcher";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center justify-between w-full gap-2 px-4">
        <SidebarTrigger />
        <NewProjectModal />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
