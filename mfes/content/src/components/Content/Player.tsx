"use client";
import { useParams } from "next/navigation";
import React from "react";
interface PlayerPageProps {
  id?: string; // Define the type for the 'id' prop
}
const PlayerPage: React.FC<PlayerPageProps> = ({ id }) => {
  const params = useParams();
  const { ecml } = params;
  const { identifier, courseId, unitId } = params; // string | string[] | undefined
  if (!identifier) {
    return <div>Loading...</div>;
  }
  console.log("PlayerPage params:", params);
  const iframeSrc = `${
    process.env.NEXT_PUBLIC_LEARNER_SBPLAYER
  }?identifier=${identifier}${
    courseId && unitId ? `&courseId=${courseId}&unitId=${unitId}` : ""
  }`;
  return (
    <iframe
      src={iframeSrc}
      style={{
        // display: 'block',
        // padding: 0,
        border: "none",
        height: "calc(100vh - 20px)",
      }}
      width="100%"
      height="100%"
      title="Embedded Localhost"
    />
  );
};

export default PlayerPage;
