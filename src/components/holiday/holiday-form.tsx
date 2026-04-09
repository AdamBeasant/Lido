"use client";

import { useState } from "react";
import { Button, TextField, Input, Label } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";

export function HolidayForm() {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<Array<{ url: string; thumb: string; credit: string }>>([]);
  const [searchingImages, setSearchingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { user } = useUser();

  const searchImages = async () => {
    if (!destination.trim()) return;
    setSearchingImages(true);
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(destination)}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
        if (data.length > 0 && !imageUrl) {
          setImageUrl(data[0].url);
        }
      }
    } finally {
      setSearchingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !startDate || !endDate) return;

    setSaving(true);

    let latitude = null;
    let longitude = null;
    try {
      const geoRes = await fetch(
        `/api/weather?type=geo&query=${encodeURIComponent(destination)}`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.lat && geoData.lon) {
          latitude = geoData.lat;
          longitude = geoData.lon;
        }
      }
    } catch {}

    const { data, error } = await supabase
      .from("holidays")
      .insert({
        name,
        destination,
        start_date: startDate,
        end_date: endDate,
        image_url: imageUrl || null,
        latitude,
        longitude,
        created_by: user?.id,
      })
      .select()
      .single();

    setSaving(false);

    if (!error && data) {
      router.push(`/holiday/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TextField value={name} onChange={(v) => setName(v as string)} isRequired>
        <Label className="text-sm font-medium text-neutral-700">Trip name</Label>
        <Input placeholder="Summer in Santorini" className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm" />
      </TextField>

      <TextField value={destination} onChange={(v) => setDestination(v as string)} isRequired>
        <Label className="text-sm font-medium text-neutral-700">Destination</Label>
        <Input
          placeholder="Santorini, Greece"
          className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm"
          onBlur={searchImages}
        />
      </TextField>

      <div className="grid grid-cols-2 gap-3">
        <TextField type="date" value={startDate} onChange={(v) => setStartDate(v as string)} isRequired>
          <Label className="text-sm font-medium text-neutral-700">Start date</Label>
          <Input className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm" />
        </TextField>
        <TextField type="date" value={endDate} onChange={(v) => setEndDate(v as string)} isRequired>
          <Label className="text-sm font-medium text-neutral-700">End date</Label>
          <Input className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm" />
        </TextField>
      </div>

      {/* Image picker */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-neutral-500 font-medium">Cover photo</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImageUrl(img.url)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  imageUrl === img.url
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-transparent hover:border-neutral-300"
                }`}
              >
                <img src={img.thumb} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {searchingImages && (
        <p className="text-sm text-neutral-400">Searching for photos...</p>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-neutral-900 text-white font-medium"
        isDisabled={saving}
      >
        {saving ? "Creating..." : "Create holiday"}
      </Button>
    </form>
  );
}
