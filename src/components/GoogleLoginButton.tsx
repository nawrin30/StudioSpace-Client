
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { User } from "@/types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId || !buttonRef.current) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const result = await api.post<User>("/auth/google", {
              credential: response.credential,
            });

            setUser(result.data);
            toast.success("Welcome to StudioSpace!");
            router.push("/dashboard");
          } catch {
            toast.error("Google login failed. Please try again.");
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
      });
    };

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [router, setUser]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return <div ref={buttonRef} className="google-login-button" />;
}
