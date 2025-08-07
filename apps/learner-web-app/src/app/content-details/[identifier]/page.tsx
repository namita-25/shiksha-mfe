// pages/content-details/[identifier].tsx

import React from "react";
import Layout from "../../../components/Layout";
// import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { gredientStyle } from "@learner/utils/style";
import { Box } from "@mui/material";
import { getMetadata } from "@learner/utils/API/metabaseService";

export async function generateMetadata({ params }: any) {
  return await getMetadata(params.identifier);
}
const ContentEnrollDetails = dynamic(() => import("@ContentEnrollDetails"), {
  ssr: false,
});
const App = () => {
  // const router = useRouter();

  return (
    <Layout sx={gredientStyle}>
      <Box>
        <ContentEnrollDetails
          isShowLayout={false}
          _config={{
            default_img: "/images/image_ver.png",
            _infoCard: {
              _cardMedia: { maxHeight: { xs: "200px", sm: "280px" } },
              default_img: "/images/image_ver.png",
            },
          }}
        />
      </Box>
    </Layout>
  );
};

export default App;
