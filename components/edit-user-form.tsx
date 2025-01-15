"use client"

import { editUser } from "@/app/actions"
import { Label } from "@radix-ui/react-label"
import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type Props = {
    user: {
        id: string
        fullName: string
        avatar: string
    }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Updating...' : 'Update Profile'}
    </Button>
  )
}

export default function EditUserForm({user}: Props) {
    console.log(user)
    const [state, formAction] = useActionState(editUser, null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAvatarPreview(reader.result as string)
          }
          reader.readAsDataURL(file)
        }
      }
  return (
    <form action={formAction} className="space-y-4">
    <input type="hidden" name="userId" value={user.id} />
    
    <div className="space-y-2">
      <Label htmlFor="avatar">Profile Picture</Label>
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={avatarPreview || user.avatar} alt={user.fullName} />
          <AvatarFallback>{user.fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="fullName">Full Name</Label>
      <Input id="fullName" name="fullName" defaultValue={user.fullName} required />
    </div>

    <SubmitButton />

    {state?.error && (
      <p className="text-red-500 mt-2">{state.error}</p>
    )}
    {state?.success && (
      <p className="text-green-500 mt-2">Profile updated successfully!</p>
    )}
  </form>
  )
}