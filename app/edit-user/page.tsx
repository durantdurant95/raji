import EditUserForm from "@/components/edit-user-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function EditUserPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/sign-in");
  }
  const user = {
    id: data.user.id,
    fullName: data.user.user_metadata.name,
    avatar: data.user.user_metadata.avatar_url,
  };

  console.log("user", user);

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <EditUserForm user={user} />
    </div>
  );
}
