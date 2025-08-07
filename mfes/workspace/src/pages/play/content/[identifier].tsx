import {
  fetchContent,
  getHierarchy,
  getQumlData,
} from "@workspace/services/PlayerService";
// import { PlayerConfig } from "@/utils/Interfaces";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { MIME_TYPE } from "@workspace/utils/app.config";

import {
  V1PlayerConfig,
  playerConfig as V2PlayerConfig,
} from "../../../components/players/PlayerConfig";
import Loader from "@/components/Loader";
import Players from "@workspace/components/players/Players";
import V1Player from "@workspace/components/V1-Player/V1Player";
import Layout from "@workspace/components/Layout";
import $ from "jquery";
let playerConfig: any;

interface SunbirdPlayerProps {
  playerConfig: any;
}

const SunbirdPlayers: React.FC<SunbirdPlayerProps> = () => {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState("discover-contents");
  const { identifier } = router.query;
  const [loading, setLoading] = useState(true);
  const [isContentInteractiveType, setIsContentInteractiveType] =
    useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.$ = window.jQuery = $;
    }
    const loadContent = async () => {
      try {
        if (identifier) {
          const data = await fetchContent(identifier);
          if (data.mimeType === MIME_TYPE.QUESTIONSET_MIME_TYPE) {
            setIsContentInteractiveType(false);
            playerConfig = V2PlayerConfig;
            const Q1 = await getHierarchy(identifier);
            const Q2 = await getQumlData(identifier);
            const metadata = { ...Q1?.questionset, ...Q2?.questionset };
            playerConfig.metadata = metadata;
          } else if (MIME_TYPE.INTERACTIVE_MIME_TYPE.includes(data?.mimeType)) {
            playerConfig = V1PlayerConfig;
            playerConfig.metadata = data;
            playerConfig.context["contentId"] = identifier;
            setIsContentInteractiveType(true);
          } else {
            setIsContentInteractiveType(false);
            playerConfig = V2PlayerConfig;
            playerConfig.metadata = data;
            playerConfig.context["contentId"] = identifier;
          }
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    loadContent();
  }, [identifier]);
  return (
    <Layout selectedKey={selectedKey} onSelect={setSelectedKey}>
      <Box>
        <Box
          sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }}
          onClick={() => router.back()}
        >
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">{"Back"}</Typography>
        </Box>
        {loading && (
          <Box
            width={"100%"}
            id="check"
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            mt={"5rem"}
          >
            <Loader showBackdrop={false} />
          </Box>
        )}
        <Box margin={"1rem 0"}>
          <Typography
            color={"#024f9d"}
            sx={{ padding: "0 0 4px 4px", fontWeight: "bold" }}
          >
            {playerConfig?.metadata?.name}
          </Typography>
          {!loading && (
            <div style={{ height: "100vh", width: "100%" }}>
              {isContentInteractiveType ? (
                <V1Player playerConfig={playerConfig} />
              ) : (
                <Players playerConfig={playerConfig} />
              )}
            </div>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default SunbirdPlayers;
