export interface Holiday {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
  image_blur_hash: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HolidayMember {
  id: string;
  holiday_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface InviteToken {
  id: string;
  holiday_id: string;
  token: string;
  created_by: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
}

export interface ChecklistItem {
  id: string;
  holiday_id: string;
  list_type: "packing" | "todo";
  category: string | null;
  text: string;
  checked: boolean;
  checked_by: string | null;
  checked_at: string | null;
  position: number;
  created_by: string | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  holiday_id: string;
  name: string;
  cuisine: string | null;
  notes: string | null;
  rating: number | null;
  booked: boolean;
  url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}
