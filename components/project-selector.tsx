"use client";
import { Database } from "@/types/supabase";
import { ChevronDown } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type Props = {
  projects: Database["public"]["Tables"]["projects"]["Row"][];
};

export default function ProjectSelector({ projects }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 mr-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-background">
              {projects[0].name.charAt(0)}
            </div>
            <span className="truncate">{projects[0].name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.name}
                  onSelect={() => {
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    {/* <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white">
                    {project.icon}
                  </div> */}
                    <span>{project.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
