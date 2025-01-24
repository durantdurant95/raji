"use client";
import { NewProjectModal } from "./new-project-modal";
import { ThemeSwitcher } from "./theme-switcher";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
      <SidebarTrigger />
      <NewProjectModal />
      <ThemeSwitcher />
    </header>
  );
}
