import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { holidayId } = await request.json();

  // Verify user is owner
  const { data: member } = await supabase
    .from("holiday_members")
    .select("role")
    .eq("holiday_id", holidayId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  // Create invite token
  const { data: token, error } = await supabase
    .from("invite_tokens")
    .insert({
      holiday_id: holidayId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const url = `${origin}/holiday/${holidayId}/invite?token=${token.token}`;

  return NextResponse.json({ url, token: token.token });
}
