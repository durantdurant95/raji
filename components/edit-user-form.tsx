"use client";

import { Label } from "@radix-ui/react-label";
import { ImageIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { Database } from "@/types/supabase";
import { editUser } from "@/utils/supabase/actions/auth";
import { toast } from "sonner";

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
    profileData.avatar_url || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  useEffect(() => {
    if (state?.success) {
      toast.success("Profile updated successfully");
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <input type="hidden" name="user_id" value={profileData.user_id} />

      <div className="space-y-2">
        <div className="flex flex-col items-center space-y-4">
          <div
            className="group relative cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Avatar className="h-24 w-24 ring-2 ring-primary/10 ring-offset-2 transition-all duration-200 hover:ring-primary/30">
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
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <UploadIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>Click avatar to upload new image</span>
          </div>
          <Input
            ref={fileInputRef}
            id="avatar_url"
            name="avatar_url"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
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
    </form>
  );
}
