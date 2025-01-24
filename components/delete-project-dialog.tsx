"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { deleteProject } from "@/utils/supabase/actions/projects";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export function DeleteProjectDialog({
  project,
}: {
  project: Database["public"]["Tables"]["projects"]["Row"];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleDelete(projectId: string) {
    const response = await deleteProject(projectId);

    if (response.error) {
      toast.error("Error", {
        description: response.error,
      });
    } else {
      toast.success("Success", {
        description: "Project deleted successfully!",
      });
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            project and all associated tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDelete(project.id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
