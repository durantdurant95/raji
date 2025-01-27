"use server";

import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchTasksByProject(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data;
}

export async function addTaskToProject(
  projectId: string,
  task: Omit<
    Database["public"]["Tables"]["tasks"]["Row"],
    "id" | "created_at" | "updated_at"
  >,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        project_id: projectId,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        status: task.status,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding task:", error);
    return null;
  }
  revalidatePath(`/projects/${projectId}`);
  return data;
}

export async function updateTaskStatus(taskId: string, status: string) {
  console.log("Updating task status:", { taskId, status });
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select();

    if (error) {
      console.error("Error updating task status:", error);
      throw error;
    }

    console.log("Task status updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    throw error;
  }
}
