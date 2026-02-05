"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Force activation
          if (registration.waiting) {
            registration.waiting.postMessage({
              type: "SKIP_WAITING",
            });
          }

          registration.addEventListener(
            "updatefound",
            () => {
              const newWorker =
                registration.installing;

              if (!newWorker) return;

              newWorker.addEventListener(
                "statechange",
                () => {
                  if (
                    newWorker.state ===
                    "activated"
                  ) {
                    console.log(
                      "Service Worker activated"
                    );
                  }
                }
              );
            }
          );
        });
    });
  }, []);

  return null;
}
