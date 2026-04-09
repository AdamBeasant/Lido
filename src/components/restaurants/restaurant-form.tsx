"use client";

import { useState } from "react";
import { Modal, ModalContainer, ModalHeader, ModalBody, Button, TextField, Input, TextArea, Label } from "@heroui/react";

interface RestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; cuisine?: string; notes?: string; url?: string }) => void;
}

export function RestaurantForm({ isOpen, onClose, onSubmit }: RestaurantFormProps) {
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      cuisine: cuisine.trim() || undefined,
      notes: notes.trim() || undefined,
      url: url.trim() || undefined,
    });
    setName("");
    setCuisine("");
    setNotes("");
    setUrl("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <ModalContainer>
        <ModalHeader>Add restaurant</ModalHeader>
        <ModalBody className="pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField value={name} onChange={(v) => setName(v as string)} isRequired>
              <Label className="text-sm font-medium text-neutral-700">Name</Label>
              <Input placeholder="Restaurant name" className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm" />
            </TextField>
            <TextField value={cuisine} onChange={(v) => setCuisine(v as string)}>
              <Label className="text-sm font-medium text-neutral-700">Cuisine</Label>
              <Input placeholder="Italian, Japanese, etc." className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm" />
            </TextField>
            <TextField value={notes} onChange={(v) => setNotes(v as string)}>
              <Label className="text-sm font-medium text-neutral-700">Notes</Label>
              <TextArea placeholder="Any notes about this place..." className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm min-h-[60px]" />
            </TextField>
            <TextField value={url} onChange={(v) => setUrl(v as string)}>
              <Label className="text-sm font-medium text-neutral-700">Link</Label>
              <Input placeholder="Google Maps or website URL" className="border border-neutral-200 rounded-lg px-3 py-2 w-full text-sm" />
            </TextField>
            <Button
              type="submit"
              className="w-full bg-neutral-900 text-white font-medium"
            >
              Add restaurant
            </Button>
          </form>
        </ModalBody>
      </ModalContainer>
    </Modal>
  );
}
