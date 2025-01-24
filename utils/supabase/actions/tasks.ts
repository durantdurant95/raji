"use server";

import { createClient } from "@/utils/supabase/server";

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
