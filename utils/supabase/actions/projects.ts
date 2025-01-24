"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchProjects() {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) {
    return { error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching projects:", error);
    return { error };
  }

  return { projects: data };
}

export async function fetchProjectById(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return { error: error.message };
  }

  return data;
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Project name is required" };
  }

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return { error: "User not authenticated" };
  }
  const userId = user.id;
  const { data, error } = await supabase
    .from("projects")
    .insert([{ name, description, user_id: userId }])
    .select();

  if (error) {
    return { error: error.message };
  }

  return { success: true, project: data[0] };
}

export async function updateProject(
  id: string,
  name: string,
  description: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ name, description })
    .eq("id", id)
    .select();

  if (error) {
    return { error: error.message };
  }

  return { success: true, project: data[0] };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
