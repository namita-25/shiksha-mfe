import React, { useRef, useEffect } from "react";
import { getTelemetryEvents } from "../../services/TelemetryService";
import { useParams } from "next/navigation";

interface PlayerProps {
  playerConfig: any;
  relatedData?: any;
  configFunctionality?: boolean;
}

const iframeREcml = useParams(); // Note: This console.log will run on every render, maybe move inside useEffect for specific use

const basePath = process.env.NEXT_PUBLIC_ASSETS_CONTENT || "/sbplayer";

const V1Player = ({
  playerConfig,
  relatedData: { courseId, unitId, userId },
  configFunctionality,
}: PlayerProps) => {
  const previewRef = useRef<HTMLIFrameElement | null>(null);
  console.log("V1Player Component is rendering!"); // <--- ADD THIS LINE
  console.log("Initial playerConfig received:", playerConfig); // <--- ADD THIS LINE
  useEffect(() => {
    const preview: any = previewRef.current;
    console.log("V1Player useEffect triggered."); // ADD THIS
    console.log("V1Player playerConfig on useEffect:", playerConfig); // ADD THIS

    if (preview) {
      // --- BEGIN Original V1Player content ---
      const originalSrc = preview.src;
      preview.src = "";
      preview.src = originalSrc;
      console.log("V1Player iframe src reset and reloaded."); // ADD THIS

      const handleLoad = () => {
        console.log("V1Player iframe loaded event triggered."); // ADD THIS

        // Ensure contentWindow and initializePreview exist before calling
        if (preview.contentWindow) {
          console.log("V1Player contentWindow available."); // ADD THIS
          if (typeof preview.contentWindow.initializePreview === "function") {
            console.log(
              "V1Player initializePreview function found. Calling it with:",
              playerConfig
            ); // ADD THIS

            // Add error handling for ECML content
            try {
              preview.contentWindow.initializePreview(playerConfig);
              console.log("V1Player initializePreview called successfully."); // ADD THIS
            } catch (error) {
              console.error("V1Player initializePreview error:", error);
            }
          } else {
            console.warn(
              "V1Player: initializePreview function not found in iframe contentWindow."
            ); // ADD THIS
            // This is a critical warning if you see it!
          }
        } else {
          console.warn("V1Player: iframe contentWindow is null or undefined."); // ADD THIS
        }

        // Add error event listener for iframe
        preview.addEventListener("error", (event: Event) => {
          console.error("V1Player iframe error:", event);
        });

        preview.addEventListener(
          "renderer:telemetry:event",
          async (event: any) => {
            console.log("V1 player telemetry event ===>", event); // Keep this
            if (event.detail.telemetryData.eid === "START") {
              console.log("V1 player telemetry START event ===>", event); // Keep this
            }
            if (event.detail.telemetryData.eid === "END") {
              console.log("V1 player telemetry END event ===>", event); // Keep this
            }

            await getTelemetryEvents(event.detail.telemetryData, "v1", {
              courseId,
              unitId,
              userId,
              configFunctionality,
            });
          }
        );
      };

      preview.addEventListener("load", handleLoad);

      return () => {
        console.log("V1Player useEffect cleanup."); // ADD THIS
        preview.removeEventListener("load", handleLoad);
      };
    } else {
      console.warn("V1Player: previewRef.current is null."); // ADD THIS
    }
  }, [playerConfig, courseId, unitId, userId, configFunctionality]); // Add all dependencies to useEffect
  // console.log("V1Player playerConfig on render:", playerConfig); // Keep this, useful for initial render check

  return (
    <>
      <iframe
        ref={previewRef}
        id="contentPlayer"
        title="Content Player"
        src={`${basePath}/content/preview/preview.html?webview=true`}
        aria-label="Content Player"
        style={{ border: "none" }}
        width={"100%"}
        height={"100%"}
      ></iframe>
    </>
  );
};

export default V1Player;
