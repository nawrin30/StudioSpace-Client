
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
    googleGsiInitialized?: boolean;
    googleGsiCallback?: (response: { credential: string }) => void;
    googleGsiScriptPromise?: Promise<void>;
  }
}

export default function GoogleLoginButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<
    ((response: { credential: string }) => void) | null
  >(null);

  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId || !buttonRef.current) return;

    let cancelled = false;

    callbackRef.current = async (response) => {
      try {
        const result = await api.post<User>("/auth/google", {
          credential: response.credential,
        });

        setUser(result.data);
        toast.success("Welcome to StudioSpace!");
        router.push("/dashboard");
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Google login failed. Please try again.");
      }
    };

    window.googleGsiCallback = (response) => {
      callbackRef.current?.(response);
    };

    const initializeGoogle = async () => {
      try {
        if (!window.googleGsiScriptPromise) {
          window.googleGsiScriptPromise = new Promise<void>(
            (resolve, reject) => {
              const existingScript = document.querySelector(
                'script[src="https://accounts.google.com/gsi/client"]'
              ) as HTMLScriptElement | null;

              if (window.google?.accounts?.id) {
                resolve();
                return;
              }

              const script = existingScript || document.createElement("script");

              script.src = "https://accounts.google.com/gsi/client";
              script.async = true;
              script.defer = true;

              script.onload = () => resolve();
              script.onerror = () =>
                reject(new Error("Google script failed to load"));

              if (!existingScript) {
                document.head.appendChild(script);
              }
            }
          );
        }

        await window.googleGsiScriptPromise;

        if (cancelled || !window.google || !buttonRef.current) return;

        if (!window.googleGsiInitialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              window.googleGsiCallback?.(response);
            },
          });

          window.googleGsiInitialized = true;
        }

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: 320,
        });
      } catch (error) {
        console.error("Google initialization error:", error);
        toast.error("Could not load Google Login.");
      }
    };

    initializeGoogle();

    return () => {
      cancelled = true;
      callbackRef.current = null;
    };
  }, [router, setUser]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return <div ref={buttonRef} className="google-login-button" />;
}
