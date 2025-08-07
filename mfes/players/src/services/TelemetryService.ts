import { ContentCreate, ContentType } from "../utils/Interface";
import {
  createContentTracking,
  fetchBulkContents,
  updateCOurseAndIssueCertificate,
} from "./PlayerService";

const lastAccessOn = new Date().toISOString();

export const handleExitEvent = () => {
  const previousPage = sessionStorage.getItem("previousPage");
  if (previousPage) {
    window.location.href = previousPage;
  } else {
    window.history.go(-1);
  }
};

export const handlePlayerEvent = (event: any) => {
  console.log("Player Event", event.detail);
  if (event?.detail?.edata?.type === "EXIT") {
    handleExitEvent();
  }
};

export const handleTelemetryEventPDF = (event: any) => {
  getTelemetryEvents(event.detail, "pdf");
};

export const handleTelemetryEventQuml = (
  event: any,
  { courseId, unitId, userId, configFunctionality }: any = {}
) => {
  getTelemetryEvents(event.data, "quml", {
    courseId,
    unitId,
    userId,
    configFunctionality,
  });
};

export const getTelemetryEvents = async (
  eventData: any,
  contentType: string,
  { courseId, unitId, userId, configFunctionality }: any = {}
) => {
  console.log("getTelemetryEvents hit", eventData);

  if (!eventData || (!eventData.object?.id && !eventData.gdata?.id)) {
    console.error("Invalid event data");
    return;
  }

  const identifier = eventData.object?.id || eventData.gdata?.id;
  const { eid, edata } = eventData;
  const telemetryKey = `${contentType}_${identifier}_${eid}`;
  console.log("telemetryKey", telemetryKey);
  console.log("eventData", eventData);
  const telemetryData = {
    eid,
    edata,
    identifier,
    contentType,
  };

  console.log(`${eid}Telemetry`, telemetryData);

  localStorage.setItem(telemetryKey, JSON.stringify(telemetryData));

  if (eid === "START") {
    await contentWithTelemetryData({
      identifier,
      detailsObject: [telemetryData],
      courseId,
      unitId,
      userId,
      configFunctionality,
    });
  }

  if (eid === "END" || (contentType === "quml" && eid === "SUMMARY")) {
    try {
      const detailsObject: any[] = [];

      if (typeof window !== "undefined" && window.localStorage) {
        const keys = Object.keys(localStorage);

        // Filter keys for relevant telemetry events based on identifier
        const relevantKeys = keys.filter((key) => key.includes(identifier));

        relevantKeys.forEach((key) => {
          const telemetryEvent = localStorage.getItem(key);
          if (telemetryEvent) {
            const parsedTelemetryEvent = JSON.parse(telemetryEvent);
            let progressFromSummary = null;
            let progressFromExtra = null;

            // Check `summary` for progress
            if (parsedTelemetryEvent?.edata?.summary?.length > 0) {
              progressFromSummary =
                parsedTelemetryEvent.edata.summary[0]?.progress;
            }

            // Check `extra` for progress
            if (parsedTelemetryEvent?.edata?.extra?.length > 0) {
              const progressEntry = parsedTelemetryEvent.edata.extra.find(
                (entry: any) => entry.id === "progress"
              );
              if (progressEntry) {
                progressFromExtra = parseInt(progressEntry.value, 10);
              }
            }

            // Skip event if `eid === 'END'` and progress is not 100 in either `summary` or `extra`
            // if (
            //   parsedTelemetryEvent?.eid === 'END' &&
            //   ((progressFromSummary !== 100 && progressFromSummary !== null) ||
            //     (progressFromExtra !== 100 && progressFromExtra !== null))
            // ) {
            //   return;
            // }

            // Push parsed telemetry event
            detailsObject.push(parsedTelemetryEvent);
          }
        });

        // After processing all keys, check if an END event exists in detailsObject for html or h5p
        let hasEndEvent = true;

        if (
          localStorage.getItem("mimeType") === ContentType.H5P ||
          localStorage.getItem("mimeType") === ContentType.HTML
        ) {
          detailsObject.forEach((event) => {
            if (event.eid === "END") {
              hasEndEvent = false;
            }
          });
          if (!hasEndEvent) {
            detailsObject.push({
              eid: "END",
              edata: {
                duration: 0,
                mode: "play",
                pageid: "sunbird-player-Endpage",
                summary: [
                  {
                    progress: 100,
                  },
                  {
                    totallength: "",
                  },
                  {
                    visitedlength: "",
                  },
                  {
                    visitedcontentend: "",
                  },
                  {
                    totalseekedlength: "",
                  },
                  {
                    endpageseen: false,
                  },
                ],
                type: "content",
              },
            });
          }
          // });
        }
      }

      try {
        await contentWithTelemetryData({
          identifier,
          detailsObject,
          courseId,
          unitId,
          userId,
          configFunctionality,
        });
      } catch (error) {
        console.log(error);
      }
      console.log("Telemetry END event successfully logged:");
    } catch (error) {
      console.error("Error logging telemetry END event:", error);
    }
  }
};

export const contentWithTelemetryData = async ({
  identifier,
  detailsObject,
  courseId,
  unitId,
  userId: propUserId,
  configFunctionality,
}: any) => {
  if (configFunctionality.trackable === false) {
    console.log("not trackable");
    return false;
  }
  try {
    const response = await fetchBulkContents([identifier, courseId]);
    const course = response?.find(
      (content: any) => content.identifier === courseId
    );
    const resolvedMimeType = response?.[0]?.mimeType || null;
    console.log("fetchBulkContents", response, resolvedMimeType);
    if (!resolvedMimeType) {
      console.error("Failed to fetch mimeType.");
      return;
    }

    let userId = localStorage.getItem("userId");
    // if (propUserId) {
    //   userId = propUserId;
    // } else {
    //   userId = localStorage.getItem("userId") ?? "";
    // }
    console.log("Final userId===", localStorage.getItem("userId"));
    // Provide a default userId if none is available
    if (!userId || userId === "") {
      userId = "anonymous-user";
      console.warn("No userId provided, using default anonymous user");
    }

    console.log("propUserId===", propUserId);

    const ContentTypeReverseMap = Object.fromEntries(
      Object.entries(ContentType).map(([key, value]) => [value, key])
    );

    // Determine content type with proper fallback
    let contentType = ContentTypeReverseMap[resolvedMimeType] || "";
    if (!contentType || contentType === "") {
      // Provide fallback based on mime type
      if (resolvedMimeType === "application/vnd.ekstep.ecml-archive") {
        contentType = "quml"; // For ECML question sets
      } else if (resolvedMimeType === "application/pdf") {
        contentType = "pdf";
      } else if (resolvedMimeType.includes("video")) {
        contentType = "video";
      } else if (resolvedMimeType === "application/epub") {
        contentType = "epub";
      } else {
        contentType = "interactive"; // Default fallback
      }
      console.warn(
        `No content type mapping found for ${resolvedMimeType}, using fallback: ${contentType}`
      );
    }

    const reqBody: ContentCreate = {
      userId: userId,
      contentId: identifier,
      courseId: courseId && unitId ? courseId : identifier,
      unitId: courseId && unitId ? unitId : identifier,
      contentType: contentType,
      contentMime: resolvedMimeType,
      lastAccessOn: lastAccessOn,
      detailsObject: detailsObject,
    };

    console.log("Sending telemetry request:", reqBody);

    const telemetryResponse = await createContentTracking(reqBody);
    if (
      telemetryResponse &&
      configFunctionality.isGenerateCertificate !== false
    ) {
      await updateCOurseAndIssueCertificate({
        userId,
        course,
        unitId,
        isGenerateCertificate: configFunctionality.isGenerateCertificate,
      });
    }
  } catch (error) {
    console.error("Error in contentWithTelemetryData:", error);
  }
};
