import React, { memo } from "react";
import { Box, Grid, Typography, Button, CircularProgress } from "@mui/material";
import { ContentItem, useTranslation } from "@shared-lib";
import ContentCard from "./ContentCard";
import { ContentSearchResponse } from "@content-mfes/services/Search";

interface ContentCardGridProps {
  contentData: ContentSearchResponse[];
  _config: any;
  type: string;
  handleCardClick: (content: ContentItem, e?: any) => void;
  trackData?: any[];
  hasMoreData: boolean;
  handleLoadMore: (e: any) => void;
  isLoadingMoreData: boolean;
  isHideEmptyDataMessage?: boolean;
}

const ContentCardGrid = memo((props: ContentCardGridProps) => {
  const { t } = useTranslation();
  const { default_img, _subBox, _grid, _containerGrid, _card } =
    props._config ?? {};

  return (
    <Box {..._subBox} sx={{ ...(_subBox?.sx ?? {}) }}>
      <Grid container spacing={{ xs: 1, sm: 1, md: 2 }} {..._containerGrid}>
        {props.contentData?.map((item: any) => (
          <Grid
            key={item?.identifier}
            id={item?.identifier}
            item
            xs={6}
            sm={6}
            md={4}
            lg={3}
            xl={2.4}
            {..._grid}
          >
            <ContentCard
              item={item}
              type={props.type}
              default_img={default_img}
              _card={_card}
              handleCardClick={props.handleCardClick}
              trackData={props.trackData as [] | undefined}
            />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ textAlign: "center", mt: 4 }}>
        {props.hasMoreData && (
          <Button
            variant="contained"
            onClick={props.handleLoadMore}
            disabled={props.isLoadingMoreData}
          >
            {props.isLoadingMoreData ? (
              <CircularProgress size={20} />
            ) : (
              t("LEARNER_APP.CONTENT_TABS.LOAD_MORE")
            )}
          </Button>
        )}
      </Box>
      {!props.contentData?.length && !props.isHideEmptyDataMessage && (
        <Typography
          variant="body1"
          sx={{
            minHeight: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {t("LEARNER_APP.CONTENT_TABS.NO_MORE_DATA")}
        </Typography>
      )}
    </Box>
  );
});

ContentCardGrid.displayName = "ContentCardGrid";

export default ContentCardGrid;
