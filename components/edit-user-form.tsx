"use client";

import { editUser } from "@/app/actions";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { Database } from "@/types/supabase";

type Props = {
  profileData: Database["public"]["Tables"]["profiles"]["Row"];
};
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating..." : "Update Profile"}
    </Button>
  );
}

export default function EditUserForm({ profileData }: Props) {
  const [state, formAction] = useActionState(editUser, null);
  const [name, setName] = useState(profileData.name);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profileData.avatar_url || null
  );

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="user_id" value={profileData.user_id} />

      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Picture</Label>
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={avatarPreview ?? profileData.avatar_url}
              alt={profileData.name}
            />
            <AvatarFallback>
              {profileData.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <Input
            id="avatar_url"
            name="avatar_url"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={handleFullNameChange}
          required
        />
      </div>

      <div className="flex justify-between">
        <SubmitButton />
        <Button>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      {state?.error && <p className="text-red-500 mt-2">{state.error}</p>}
      {state?.success && (
        <p className="text-green-500 mt-2">Profile updated successfully!</p>
      )}
    </form>
  );
}
