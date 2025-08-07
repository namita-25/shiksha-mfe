import { Box, Tab, Tabs } from "@mui/material";
import { ContentItem, Loader, useTranslation } from "@shared-lib"; // Updated import
import React, { memo } from "react";
import { ContentSearchResponse } from "@content-mfes/services/Search";
import ContentCardGrid from "@content-mfes/components/Card/ContentCardGrid";
import ContentCardCarousel from "@content-mfes/components/Card/ContentCardCarousel";

const RenderTabContent = memo(
  ({
    contentData,
    _config,
    trackData,
    type,
    handleCardClick,
    hasMoreData,
    handleLoadMore,
    tabs,
    value,
    onChange,
    ariaLabel,
    isLoadingMoreData,
    isPageLoading,
    isHideEmptyDataMessage,
  }: {
    contentData: ContentSearchResponse[];
    _config: any;
    trackData?: [];
    type: string;
    handleCardClick: (content: ContentItem, e?: any) => void;
    hasMoreData: boolean;
    handleLoadMore: (e: any) => void;
    tabs?: any[];
    value?: number;
    onChange?: (event: React.SyntheticEvent, newValue: number) => void;
    ariaLabel?: string;
    isLoadingMoreData: boolean;
    isPageLoading: boolean;
    isHideEmptyDataMessage?: boolean;
  }) => {
    const { t } = useTranslation();
    const { _box, _tabs } = _config ?? {};

    return (
      <Box sx={{ width: "100%", ...(_box?.sx ?? {}) }}>
        {tabs?.length !== undefined && tabs?.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              {..._tabs}
              value={value ?? 0}
              onChange={onChange}
              aria-label={ariaLabel}
            >
              {tabs.map((tab: any, index: number) => (
                <Tab
                  key={tab.label}
                  icon={tab.icon ?? undefined}
                  label={tab.label}
                  {...{
                    id: `simple-tab-${index}`,
                    "aria-controls": `simple-tabpanel-${index}`,
                  }}
                />
              ))}
            </Tabs>
          </Box>
        )}
        <Box
          sx={{
            flexGrow: 1,
            mt: tabs?.length !== undefined && tabs?.length > 1 ? 2 : 0,
          }}
        >
          <Loader
            isLoading={isPageLoading}
            layoutHeight={197}
            isHideMaxHeight
            _loader={{ backgroundColor: "transparent" }}
          >
            {contentData?.length > 0 && _config?.isShowInCarousel && (
              <ContentCardCarousel
                contentData={contentData}
                _config={_config}
                type={type}
                handleCardClick={handleCardClick}
                trackData={trackData}
                hasMoreData={hasMoreData}
                handleLoadMore={handleLoadMore}
                isLoadingMoreData={isLoadingMoreData}
                isHideEmptyDataMessage={isHideEmptyDataMessage}
              />
            )}
            {!_config?.isShowInCarousel && (
              <ContentCardGrid
                contentData={contentData}
                _config={_config}
                type={type}
                handleCardClick={handleCardClick}
                trackData={trackData}
                hasMoreData={hasMoreData}
                handleLoadMore={handleLoadMore}
                isLoadingMoreData={isLoadingMoreData}
                isHideEmptyDataMessage={isHideEmptyDataMessage}
              />
            )}
          </Loader>
        </Box>
      </Box>
    );
  }
);

RenderTabContent.displayName = "RenderTabContent";
export default RenderTabContent;
