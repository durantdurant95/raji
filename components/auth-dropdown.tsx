import { signOutAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default async function AuthDropdown() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name || user?.email || "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="hover:cursor-pointer">
          <AvatarFallback>{firstLetter}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      {user ? (
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <form>
              <button
                formAction={signOutAction}
                className="flex w-full items-center py-1"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>
            <Link href="/sign-in" className="flex w-full items-center py-1">
              <LogIn className="mr-2 h-4 w-4" /> <span>Sign In</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/sign-up" className="flex w-full items-center py-1">
              <UserPlus className="mr-2 h-4 w-4" /> <span>Sign Up</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
