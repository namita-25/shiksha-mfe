import type { NextApiRequest, NextApiResponse } from "next";

// Mock data
export const mockData: Record<string, any> = {
  "ef99949b-7f3a-4a5f-806a-e67e683e38f3": {
    CHANNEL_ID: "scp-channel",
    CONTENT_FRAMEWORK: "pos-framework",
    COLLECTION_FRAMEWORK: "scp-framework",
  },
  "29f8c9a6-032f-48c7-a14a-9e3db3d7b76e": {
    CHANNEL_ID: "pos-channel",
    CONTENT_FRAMEWORK: "pos-framework",
    COLLECTION_FRAMEWORK: "pos-framework",
  },
  "6c8b810a-66c2-4f0d-8c0c-c025415a4414": {
    CHANNEL_ID: "pos-channel",
    CONTENT_FRAMEWORK: "pos-framework",
    COLLECTION_FRAMEWORK: "pos-framework",
  },
  "914ca990-9b45-4385-a06b-05054f35d0b9": {
    CHANNEL_ID: "pos-channel",
    CONTENT_FRAMEWORK: "pos-framework",
    COLLECTION_FRAMEWORK: "pos-framework",
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tenantId } = req.query;

  if (!tenantId || typeof tenantId !== "string") {
    return res.status(400).json({ error: "Invalid or missing tenantId" });
  }

  const config = mockData[tenantId];

  if (!config) {
    return res.status(404).json({ error: "Tenant not found" });
  }

  return res.status(200).json(config);
}
