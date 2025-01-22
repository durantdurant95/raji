"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getUserProfile() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return { error: "User not authenticated" };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", data.user.id)
    .single();

  if (profileError || !profileData) {
    return { error: "Profile not found" };
  }

  return { profile: profileData };
}

async function createUserProfile(userId: string, fullName: string) {
  const supabase = await createClient();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        user_id: userId,
        name: fullName,
      },
    ]);

  if (profileError) {
    return { error: "Failed to create user profile." };
  }

  return { success: true, profile: profileData };
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !name) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Full name, email, and password are required"
    );
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: name,
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    const userId = signUpData.user?.id;
    if (userId) {
      const profileResult = await createUserProfile(userId, name);
      if (profileResult.error) {
        return encodedRedirect("error", "/sign-up", profileResult.error);
      }
    }
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect("error", "/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect("error", "/reset-password", "Password update failed");
  }

  encodedRedirect("success", "/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

async function updateUser(userId: string, data: FormData) {
  const supabase = await createClient();
  const name = data.get("name") as string;
  const avatar_url = data.get("avatar_url") as File;

  // Validate the data
  if (!name) {
    return { error: "Full name is required." };
  }

  // Upload the avatar file to Supabase storage
  let avatarUrl = "";
  if (avatar_url) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(`${avatar_url.name}`, avatar_url, {
        cacheControl: "3600",
        upsert: true, // Enable upsert to overwrite existing files
      });

    if (uploadError) {
      return { error: "Failed to upload avatar." };
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(uploadData?.path || "");
    avatarUrl = publicUrlData?.publicUrl || "";
  }

  // Update the user record in the profiles table
  const { data: userData, error: updateError } = await supabase
    .from("profiles")
    .update({
      name: name,
      avatar_url: avatarUrl,
    })
    .eq("user_id", userId);

  if (updateError) {
    return { error: "Failed to update user." };
  }

  return { success: true, user: userData };
}

export async function editUser(prevState: any, formData: FormData) {
  const user_id = formData.get("user_id") as string;
  const result = await updateUser(user_id, formData);

  if (result.error) {
    return { error: result.error };
  }
  revalidatePath("/edit-user");
  return { success: true, user: result.user };
}

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

export async function fetchTasksByStatus(projectId: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", status);

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
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
  description: string
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
