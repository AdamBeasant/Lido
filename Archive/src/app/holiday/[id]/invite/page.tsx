"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

export default function InvitePage() {
  return (
    <Suspense>
      <InviteContent />
    </Suspense>
  );
}

function InviteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const holidayId = params.id as string;
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!userLoading && !user) {
      // Redirect to login with return URL
      const returnTo = `/holiday/${holidayId}/invite?token=${token}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [user, userLoading, holidayId, token, router]);

  const acceptInvite = async () => {
    if (!token) {
      setErrorMsg("Invalid invite link");
      setStatus("error");
      return;
    }

    setStatus("accepting");

    const { data, error } = await supabase.rpc("accept_invite", {
      invite_token: token,
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => {
        router.push(`/holiday/${holidayId}`);
      }, 1500);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="sm" color="current" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900">You&apos;re invited!</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Someone wants to share a holiday with you
          </p>
        </div>

        {status === "idle" && (
          <Button
            className="w-full h-12 bg-neutral-900 text-white font-medium"
            onPress={acceptInvite}
          >
            Accept invite
          </Button>
        )}

        {status === "accepting" && (
          <div className="py-4">
            <Spinner size="sm" color="current" />
            <p className="text-sm text-neutral-500 mt-2">Joining...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm text-emerald-600 font-medium">You&apos;re in! Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="py-4">
            <p className="text-sm text-red-500">{errorMsg}</p>
            <Button
              variant="ghost"
              className="mt-2"
              onPress={() => router.push("/")}
            >
              Go home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
