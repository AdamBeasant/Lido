"use client";

import { useState } from "react";
import { Modal, ModalContainer, ModalHeader, ModalBody, Button } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";

interface ShareModalProps {
  holidayId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ holidayId, isOpen, onClose }: ShareModalProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holidayId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        setInviteLink(url);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <ModalContainer>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Share this holiday</h3>
          <p className="text-sm text-neutral-500 font-normal">
            Invite your partner to view and edit this holiday
          </p>
        </ModalHeader>
        <ModalBody className="pb-6">
          {inviteLink ? (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-500 mb-1">Share this link</p>
                <p className="text-sm text-neutral-700 break-all font-mono">
                  {inviteLink}
                </p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onPress={copyLink}
              >
                {copied ? "Copied!" : "Copy link"}
              </Button>
              <p className="text-xs text-neutral-400 text-center">
                Link expires in 7 days
              </p>
            </div>
          ) : (
            <Button
              className="w-full bg-neutral-900 text-white font-medium"
              isDisabled={loading}
              onPress={generateLink}
            >
              {loading ? "Generating..." : "Generate invite link"}
            </Button>
          )}
        </ModalBody>
      </ModalContainer>
    </Modal>
  );
}
