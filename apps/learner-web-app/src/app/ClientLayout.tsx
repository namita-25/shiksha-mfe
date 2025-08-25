"use client";

import React, { useEffect } from "react";
import { FontSizeProvider } from "../context/FontSizeContext";
import { UnderlineLinksProvider } from "../context/UnderlineLinksContext";
import { telemetryFactory } from "@shared-lib-v2/DynamicForm/utils/telemetry";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    telemetryFactory.init();

    // Listen for force logout events from other tabs
    const handleForceLogout = (event: CustomEvent) => {
      console.log("Force logout event received:", event.detail);

      // Clear all storage
      try {
        localStorage.clear();
        sessionStorage.clear();

        // Clear all cookies
        document.cookie.split(";").forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });

        console.log("All sessions cleared due to force logout event");

        // Redirect to login page
        window.location.href = "/login";
      } catch (error) {
        console.error("Error during force logout:", error);
        // Fallback redirect
        window.location.href = "/login";
      }
    };

    // Add event listener for force logout
    window.addEventListener("forceLogout", handleForceLogout as EventListener);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener(
        "forceLogout",
        handleForceLogout as EventListener
      );
    };
  }, []);

  return (
    <FontSizeProvider>
      <UnderlineLinksProvider>{children}</UnderlineLinksProvider>
    </FontSizeProvider>
  );
}
