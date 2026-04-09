"use client";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, AvatarImage, AvatarFallback } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";

export function UserMenu() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName[0]?.toUpperCase() || "U";

  return (
    <Dropdown>
      <DropdownTrigger>
        <button className="rounded-full outline-none focus:ring-2 focus:ring-neutral-300">
          <Avatar size="sm">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem id="profile" textValue={displayName}>
          <p className="font-medium text-sm">{displayName}</p>
          <p className="text-xs text-neutral-500">{user.email}</p>
        </DropdownItem>
        <DropdownItem
          id="logout"
          onAction={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
        >
          <span className="text-red-500">Sign out</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
