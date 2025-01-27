import EditUserForm from "@/components/edit-user-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function EditUserPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/sign-in");
  }

  const userId = authData.user.id;
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profileError || !profileData) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-md pt-16">
      <h1 className="pb-4 text-center text-2xl font-bold">Edit Your Profile</h1>
      <EditUserForm profileData={profileData} />
    </div>
  );
}
