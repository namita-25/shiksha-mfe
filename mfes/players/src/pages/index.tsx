<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
=======
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
import {
  fetchContent,
  getHierarchy,
  getQumlData,
<<<<<<< HEAD
} from '../services/PlayerService';
import { Box, Typography } from '@mui/material';
import { MIME_TYPE } from '../utils/url.config';
=======
} from "../services/PlayerService";
import { Box, Typography } from "@mui/material";
import { MIME_TYPE } from "../utils/url.config";
>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
import {
  PlayerConfig,
  V1PlayerConfig,
  V2PlayerConfig,
<<<<<<< HEAD
} from '../utils/url.config';
import Loader from '../components/Loader';

const SunbirdPlayers = dynamic(() => import('../components/players/Players'), {
=======
} from "../utils/url.config";
import Loader from "../components/Loader";

const SunbirdPlayers = dynamic(() => import("../components/players/Players"), {
>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
  ssr: false,
});

interface SunbirdPlayerProps {
  identifier?: string; // Allow identifier as a prop
  playerConfig?: PlayerConfig; // Optional playerConfig prop
}

const Players: React.FC<SunbirdPlayerProps> = ({
  identifier: propIdentifier,
  playerConfig: propPlayerConfig,
}) => {
  const router = useRouter();
  const {
    courseId,
    unitId,
<<<<<<< HEAD
    userId,
=======

>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
    identifier: queryIdentifier,
  } = router.query ?? {}; // Get identifier from the query
  const identifier = propIdentifier || queryIdentifier; // Prefer prop over query
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig | undefined>(
    propPlayerConfig
  );
  const [loading, setLoading] = useState(!propPlayerConfig);
  const [isGenerateCertificate, setIsGenerateCertificate] = useState(true);
  const [trackable, setTrackable] = useState(true);
<<<<<<< HEAD

=======
  const [userId, setUserId] = useState("");

  // Get all query params once router is ready
  useEffect(() => {
    if (router.isReady) {
      const queryUserId = router.query.userId as string;
      if (queryUserId) {
        setUserId(queryUserId);
      } else {
        // Fallback to other sources if not in query params
        const storedUserId = localStorage.getItem("userId") || "";
        setUserId(storedUserId);
      }
    }
  }, [router.isReady, router.query.userId]);
  console.log("userId====", userId);
>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
  useEffect(() => {
    if (playerConfig || !identifier) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        const name = window.name;
        const jsonParse = name ? JSON.parse(name) : {};
        setIsGenerateCertificate(jsonParse.generateCertificate ?? true);
        setTrackable(jsonParse.trackable ?? true);
        const data = await fetchContent(identifier);
        let config: PlayerConfig;

        if (data.mimeType === MIME_TYPE.QUESTION_SET_MIME_TYPE) {
          config = { ...V2PlayerConfig };
          const Q1 = await getHierarchy(identifier);
          const Q2 = await getQumlData(identifier);
          const metadata = { ...Q1?.questionset, ...Q2?.questionset };
          config.metadata = metadata;
        } else if (MIME_TYPE.INTERACTIVE_MIME_TYPE.includes(data?.mimeType)) {
          config = { ...V1PlayerConfig, metadata: data, data: data.body || {} };
          //@ts-ignore
<<<<<<< HEAD
          config.context['contentId'] = identifier;
        } else {
          config = { ...V2PlayerConfig, metadata: data };
          //@ts-ignore
          config.context['contentId'] = identifier;
=======
          config.context["contentId"] = identifier;
        } else {
          config = { ...V2PlayerConfig, metadata: data };
          //@ts-ignore
          config.context["contentId"] = identifier;
>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
        }

        setPlayerConfig(config);
      } catch (error) {
<<<<<<< HEAD
        console.error('Error loading content:', error);
=======
        console.error("Error loading content:", error);
>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [identifier, playerConfig]);

  if (!identifier) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography color="error">No identifier provided</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Loader showBackdrop={false} />
        </Box>
      ) : (
<<<<<<< HEAD
        <Box sx={{ height: 'calc(100vh - 16px)' }}>
=======
        <Box sx={{ height: "calc(100vh - 16px)" }}>
>>>>>>> 1ad3d05f78e1c5100c5f61904bc066d2936fbae7
          {/* <Typography
            color="#024f9d"
            sx={{ padding: '0 0 4px 4px', fontWeight: 'bold' }}
          >
            {playerConfig?.metadata?.name || 'Loading...'}
          </Typography> */}
          <SunbirdPlayers
            player-config={playerConfig}
            courseId={courseId as string}
            unitId={unitId as string}
            userId={userId as string}
            configFunctionality={{ isGenerateCertificate, trackable }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Players;
