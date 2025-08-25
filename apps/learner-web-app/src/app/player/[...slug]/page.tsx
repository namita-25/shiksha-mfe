"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { checkAuth } from "@shared-lib-v2/utils/AuthService";
import { getUserId } from "@learner/utils/API/LoginService";
import { Box, CircularProgress, Typography } from "@mui/material";

const PlayerWithMobileCheck: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPlayerAccess = async () => {
      try {
        // Check if the URL contains a mobile number pattern
        const pathname = window.location.pathname;
        const playerMobilePattern = /^\/player\/(do_[^\/]+)\/(\d{10,})$/;
        const match = pathname.match(playerMobilePattern);

        console.log("Full URL pathname:", pathname);
        console.log("Slug params:", slug);

        if (match) {
          const [, identifier, mobileNumber] = match;
          console.log("Mobile number detected in URL:", mobileNumber);
          console.log("Extracted identifier:", identifier);

          // Check if user is authenticated
          const isAuthenticated = checkAuth();
          console.log("Authentication check result:", isAuthenticated);

          // Log localStorage items for debugging
          console.log("localStorage items:", {
            userId: localStorage.getItem("userId"),
            tenantId: localStorage.getItem("tenantId"),
            token: localStorage.getItem("token") ? "present" : "missing",
            username: localStorage.getItem("userIdName"),
          });

          if (!isAuthenticated) {
            console.log("User not authenticated, redirecting to login");
            // User not logged in, redirect to login with prefilled mobile number
            const loginUrl = `/login?redirectUrl=/player/${identifier}&prefilledUsername=${mobileNumber}`;
            console.log("Redirecting to:", loginUrl);
            window.location.href = loginUrl;
            return;
          }

          // User is logged in, check if username matches mobile number
          console.log("User authenticated, checking username match");
          try {
            const userResponse = await getUserId();
            console.log("API response:", userResponse);
            const currentUsername = userResponse?.username;
            console.log(
              "Current username:",
              currentUsername,
              "Mobile number:",
              mobileNumber
            );

            if (currentUsername === mobileNumber) {
              // Username matches mobile number, redirect to regular player route
              console.log(
                "Username matches mobile number, redirecting to player"
              );
              window.location.href = `/player/${identifier}`;
            } else {
              // Username doesn't match, close all active sessions and redirect to login
              console.log(
                "Username does not match mobile number, closing sessions and redirecting to login"
              );

              // Close all active sessions by clearing localStorage and cookies
              try {
                // Clear all localStorage items
                localStorage.clear();

                // Clear all cookies
                document.cookie.split(";").forEach(function (c) {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(
                      /=.*/,
                      "=;expires=" + new Date().toUTCString() + ";path=/"
                    );
                });

                // Clear sessionStorage as well
                sessionStorage.clear();

                // Dispatch a custom event to notify other tabs about logout
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("forceLogout", {
                      detail: { reason: "username_mismatch", mobileNumber },
                    })
                  );
                }

                console.log("All active sessions cleared successfully");
              } catch (clearError) {
                console.error("Error clearing sessions:", clearError);
              }

              // Redirect to login with prefilled mobile number
              const loginUrl = `/login?redirectUrl=/player/${identifier}&prefilledUsername=${mobileNumber}`;
              console.log("Redirecting to:", loginUrl);

              // Force redirect using window.location for more reliable redirect
              window.location.href = loginUrl;
              return;
            }
          } catch (apiError) {
            console.error("Error fetching user details:", apiError);
            // On API error, redirect to login
            const loginUrl = `/login?redirectUrl=/player/${identifier}&prefilledUsername=${mobileNumber}`;
            console.log("API error, redirecting to:", loginUrl);
            window.location.href = loginUrl;
          }
        } else {
          // Regular player URL without mobile number, redirect to proper route
          console.log("Regular player URL, redirecting to proper route");
          const identifier = Array.isArray(slug) ? slug[0] : slug;
          window.location.href = `/player/${identifier}`;
        }
      } catch (error) {
        console.error("Error checking player access:", error);
        setError("An error occurred while checking access. Please try again.");
        setIsChecking(false);
      }
    };

    checkPlayerAccess();
  }, [router, slug]);

  if (isChecking) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        gap={2}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Please try refreshing the page or contact support if the issue
          persists.
        </Typography>
      </Box>
    );
  }

  return null;
};

export default PlayerWithMobileCheck;
