"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button } from "@mui/material";
import {
  calculateTrackDataItem,
  CommonSearch,
  ContentItem,
  getData,
} from "@shared-lib";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import BackToTop from "@content-mfes/components/BackToTop";
import RenderTabContent from "@content-mfes/components/ContentTabs";
import HelpDesk from "@content-mfes/components/HelpDesk";
import {
  ContentSearch,
  ContentSearchResponse as ImportedContentSearchResponse,
} from "@content-mfes/services/Search";
import FilterDialog from "@content-mfes/components/FilterDialog";
import { trackingData } from "@content-mfes/services/TrackingService";
import LayoutPage from "@content-mfes/components/LayoutPage";
import { getUserCertificates } from "@content-mfes/services/Certificate";
import { getUserId } from "@shared-lib-v2/utils/AuthService";

// Constants
const SUPPORTED_MIME_TYPES = [
  "application/vnd.ekstep.ecml-archive",
  "application/vnd.ekstep.html-archive",
  "application/vnd.ekstep.h5p-archive",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "application/epub",
  "video/x-youtube",
  "application/vnd.sunbird.questionset",
];

const DEFAULT_TABS = [
  { label: "Courses", type: "Course" },
  { label: "Content", type: "Learning Resource" },
];

const LIMIT = 5;
const DEFAULT_FILTERS = {
  limit: LIMIT,
  offset: 0,
};

interface TrackDataItem {
  courseId: string;
  enrolled: boolean;
  [key: string]: any;
}

export interface ContentProps {
  _config?: any;
  filters?: object;
  contentTabs?: string[];
  pageName?: string;
  handleCardClick?: (content: ContentItem) => void | undefined;
  showFilter?: boolean;
  showSearch?: boolean;
  showBackToTop?: boolean;
  showHelpDesk?: boolean;
  isShowLayout?: boolean;
  hasMoreData?: boolean;
  onTotalCountChange?: (count: number) => void;
}

export default function Content(props: Readonly<ContentProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [searchValue, setSearchValue] = useState("");
  const [tabValue, setTabValue] = useState<number>(0);
  const [tabs, setTabs] = useState<typeof DEFAULT_TABS>([]);
  const [contentData, setContentData] = useState<
    ImportedContentSearchResponse[]
  >([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [localFilters, setLocalFilters] = useState<
    typeof DEFAULT_FILTERS & {
      type?: string;
      query?: string;
      filters?: object;
      identifier?: string;
    }
  >(DEFAULT_FILTERS);
  const [trackData, setTrackData] = useState<TrackDataItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filterShow, setFilterShow] = useState(false);
  const [propData, setPropData] = useState<ContentProps>();
  const abortControllerRef = useRef<AbortController | null>(null);
  console.log("props", props);
  // Session keys
  const sessionKeys = {
    filters: `${props?.pageName}_savedFilters`,
    search: `${props?.pageName}_searchValue`,
    scrollId: `${props?.pageName}_scrollToContentId`,
  };

  // Save filters to session
  const persistFilters = useCallback(
    (f: any) => sessionStorage.setItem(sessionKeys.filters, JSON.stringify(f)),
    [sessionKeys.filters]
  );

  const handleSetFilters = useCallback(
    (updater: any) => {
      const updated =
        typeof updater === "function"
          ? updater(localFilters)
          : { ...localFilters, ...updater };
      setLocalFilters({ ...updated, loadOld: false });
    },
    [localFilters]
  );

  // Restore saved state
  useEffect(() => {
    const init = async () => {
      const savedFilters = JSON.parse(
        sessionStorage.getItem(sessionKeys.filters) || "null"
      );
      const savedSearch = sessionStorage.getItem(sessionKeys.search) || "";

      // Get tab value from URL parameter
      const urlTab = searchParams.get("tab");
      const savedTab = urlTab ? parseInt(urlTab) : 0;

      const config = props ?? (await getData("mfes_content_pages_content"));
      setPropData(config);
      setSearchValue(savedSearch);
      if (savedFilters) {
        setLocalFilters({
          ...(config?.filters ?? {}),
          type:
            props?.contentTabs?.length === 1
              ? props.contentTabs[savedTab]
              : DEFAULT_TABS[savedTab].type,
          ...savedFilters,
          loadOld: true,
        });
      } else {
        setLocalFilters((prev) => ({
          ...prev,
          ...(config?.filters ?? {}),
          type:
            props?.contentTabs?.length === 1
              ? props.contentTabs[savedTab]
              : DEFAULT_TABS[savedTab].type,
          loadOld: false,
        }));
      }

      setTabs(
        DEFAULT_TABS.filter((tab) =>
          config?.contentTabs?.length
            ? config.contentTabs.includes(tab.label.toLowerCase())
            : true
        )
      );
      setTabValue(savedTab);
      setIsPageLoading(false);
    };
    init();
  }, [
    props.contentTabs,
    sessionKeys.filters,
    sessionKeys.search,
    searchParams,
  ]);
  // Fetch content with loop to load full data up to offset
  const fetchAllContent = useCallback(
    async (filter: any) => {
      const content: any[] = [];
      const QuestionSet: any[] = [];
      let count = 0;

      if (!filter.type) {
        return { content, QuestionSet, count };
      }

      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Calculate adjusted limit if loadOld is true
      const adjustedLimit = filter.loadOld
        ? filter.offset + filter.limit
        : filter.limit;
      const adjustedOffset = filter.loadOld ? 0 : filter.offset;

      const resultResponse = await ContentSearch({
        ...filter,
        offset: adjustedOffset,
        limit: adjustedLimit,
        signal: controller.signal,
        type: props.contentTabs,
      });
      console.log("resultResponse", resultResponse);
      console.log("props?._config", props?._config);
      if (resultResponse?.result?.count) {
        setTotalCount(resultResponse?.result?.count);
      }

      const response = resultResponse?.result;
      if (props?._config?.getContentData) {
        props._config.getContentData(response);
      }

      content.push(...(response?.content || []));
      QuestionSet.push(...(response?.QuestionSet || []));
      count = response?.count || 0;

      return {
        content,
        QuestionSet,
        count,
      };
    },
    [props?._config]
  );

  // Memoized track data fetching
  const fetchDataTrack = useCallback(
    async (
      resultData: ImportedContentSearchResponse[]
    ): Promise<TrackDataItem[]> => {
      if (!resultData.length) return [];

      try {
        const courseList = resultData
          .map((item) => item.identifier)
          .filter((id): id is string => id !== undefined);
        const userId = getUserId(props?._config?.userIdLocalstorageName);

        if (!userId || !courseList.length) return [];
        const userIdArray = userId.split(",").filter(Boolean);
        const [courseTrackData, certificates] = await Promise.all([
          trackingData(userIdArray, courseList),
          getUserCertificates({
            userId: userId,
            courseId: courseList,
            limit: localFilters.limit,
            offset: localFilters.offset,
          }),
        ]);

        if (!courseTrackData?.data) return [];

        const userTrackData =
          courseTrackData.data.find((course: any) => course.userId === userId)
            ?.course ?? [];

        return userTrackData.map((item: any) => ({
          ...item,
          ...calculateTrackDataItem(
            item,
            resultData.find(
              (subItem) => item.courseId === subItem.identifier
            ) ?? {}
          ),
          enrolled: Boolean(
            certificates.result.data.find(
              (cert: any) => cert.courseId === item.courseId
            )?.status === "enrolled"
          ),
        }));
      } catch (error) {
        console.error("Error fetching track data:", error);
        return [];
      }
    },
    [
      localFilters.limit,
      localFilters.offset,
      props?._config?.userIdLocalstorageName,
    ]
  );

  // Load content when filters change
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (
        !localFilters.type ||
        !localFilters.limit ||
        localFilters.offset === undefined
      )
        return;

      setIsLoading(true);
      try {
        const response = await fetchAllContent(localFilters);
        if (!response || !isMounted) return;
        const newContentData = [
          ...(response.content ?? []),
          ...(response?.QuestionSet ?? []),
        ];
        console.log("newContentData", newContentData);
        const userTrackData = await fetchDataTrack(newContentData);
        if (!isMounted) return;
        if (localFilters.offset === 0) {
          setContentData(newContentData);
          setTrackData(userTrackData);
        } else {
          setContentData((prev) => [...(prev ?? []), ...newContentData]);
          setTrackData((prev) => [...prev, ...userTrackData]);
        }

        setHasMoreData(
          propData?.hasMoreData === false
            ? false
            : response.count > localFilters.offset + newContentData.length
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty arrays on error to maintain array type
        if (localFilters.offset === 0) {
          setContentData([]);
          setTrackData([]);
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
      abortControllerRef.current?.abort();
    };
  }, [
    localFilters,
    fetchAllContent,
    fetchDataTrack,
    propData?.hasMoreData,
    propData?.filters,
  ]);

  // Scroll to saved card ID
  useEffect(() => {
    const scrollId = sessionStorage.getItem(sessionKeys.scrollId);
    if (!scrollId || !contentData?.length) return;
    const el = document.getElementById(scrollId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      sessionStorage.removeItem(sessionKeys.scrollId);
      sessionStorage.removeItem(sessionKeys.filters);
    } else {
      // Retry in the next animation frame if element not yet mounted
      requestAnimationFrame(() => {
        const retryEl = document.getElementById(scrollId);
        if (retryEl) {
          retryEl.scrollIntoView({ behavior: "smooth" });
          sessionStorage.removeItem(sessionKeys.scrollId);
          sessionStorage.removeItem(sessionKeys.filters);
        }
      });
    }
  }, [contentData, sessionKeys.scrollId]);

  // Event handlers
  const handleLoadMore = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const type =
        tabs[tabValue]?.label === "Course"
          ? ["Course"]
          : ["Learning Resource", "Practice Question Set"];
      handleSetFilters({
        ...localFilters,
        offset: localFilters.offset + localFilters.limit,
        type,
      });
    },
    [handleSetFilters, localFilters]
  );

  // UI Handlers
  const handleSearchClick = useCallback(() => {
    sessionStorage.setItem(sessionKeys.search, searchValue);
    handleSetFilters((prev: any) => ({
      ...prev,
      query: searchValue.trim(),
      offset: 0,
    }));
  }, [searchValue, sessionKeys.search, handleSetFilters]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
    },
    []
  );

  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);

    // Update URL with new tab parameter
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newValue.toString());
    router.replace(url.pathname + url.search);

    handleSetFilters({
      offset: 0,
      type: tabs[newValue].type,
    });
  };
  console.log("tabValue", props?.pageName);
  const handleCardClickLocal = useCallback(
    async (content: ContentItem) => {
      console.log("handleCardClickLocal", content);

      try {
        sessionStorage.setItem(sessionKeys.scrollId, content.identifier);
        persistFilters(localFilters);
        if (propData?.handleCardClick) {
          propData.handleCardClick(content);
        } else if (SUPPORTED_MIME_TYPES.includes(content?.mimeType)) {
          // Get unitId from URL params if available
          const unitId = params?.unitId as string;
          const courseId = params?.courseId as string;

          // Build URL with unitId if available
          let playerUrl = `${props?._config?.contentBaseUrl ?? ""}/player/${
            content?.identifier
          }?activeLink=${window.location.pathname}`;

          if (unitId) {
            playerUrl += `&unitId=${unitId}`;
          }
          if (courseId) {
            playerUrl += `&courseId=${courseId}`;
          }

          router.push(playerUrl);
        } else {
          // Get unitId from URL params if available
          const unitId = params?.unitId as string;
          const courseId = params?.courseId as string;
          console.log("content----", content);
          // Build URL with unitId if available
          let contentDetailsUrl = `${
            props?._config?.contentBaseUrl ?? ""
          }/content-details/${content?.identifier}?activeLink=${
            window.location.pathname
          }`;

          if (unitId) {
            contentDetailsUrl += `&unitId=${unitId}`;
          }
          if (courseId) {
            contentDetailsUrl += `&courseId=${courseId}`;
          }

          router.push(contentDetailsUrl);
        }
      } catch (error) {
        console.error("Failed to handle card click:", error);
      }
    },
    [
      propData?.handleCardClick,
      props?._config?.contentBaseUrl,
      sessionKeys.scrollId,
      router,
      localFilters,
      persistFilters,
      params,
    ]
  );

  const handleApplyFilters = useCallback((selectedValues: any) => {
    setFilterShow(false);
    handleSetFilters((prev: any) => ({
      ...prev,
      offset: 0,
      filters:
        Object.keys(selectedValues).length === 0
          ? {}
          : { ...prev.filters, ...selectedValues },
    }));
  }, []);

  // Memoized JSX
  const searchAndFilterSection = useMemo(
    () =>
      (propData?.showSearch ?? propData?.showFilter) && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            overflow: "unset !important",
          }}
        >
          {propData?.showSearch && (
            <CommonSearch
              placeholder="Search content.."
              rightIcon={<SearchIcon />}
              onRightIconClick={handleSearchClick}
              inputValue={searchValue}
              onInputChange={handleSearchChange}
              onKeyPress={(ev: any) =>
                ev.key === "Enter" && handleSearchClick()
              }
              sx={{
                backgroundColor: "#f0f0f0",
                padding: "4px",
                borderRadius: "50px",
                width: "100%",
                marginLeft: "10px",
              }}
            />
          )}
          {propData?.showFilter && (
            <Box>
              <Button variant="outlined" onClick={() => setFilterShow(true)}>
                <FilterAltOutlinedIcon />
              </Button>
              <FilterDialog
                open={filterShow}
                onClose={() => setFilterShow(false)}
                filterValues={localFilters}
                onApply={handleApplyFilters}
              />
            </Box>
          )}
        </Box>
      ),
    [
      propData?.showSearch,
      propData?.showFilter,
      searchValue,
      filterShow,
      localFilters,
      handleSearchClick,
      handleSearchChange,
      handleApplyFilters,
    ]
  );

  // Call onTotalCountChange callback when totalCount changes
  useEffect(() => {
    if (props?.onTotalCountChange) {
      props.onTotalCountChange(totalCount);
    }
  }, [totalCount, props?.onTotalCountChange]);

  return (
    <LayoutPage
      isLoadingChildren={isPageLoading}
      isShow={propData?.isShowLayout}
    >
      {searchAndFilterSection}
      <RenderTabContent
        {...propData}
        value={tabValue}
        onChange={handleTabChange}
        contentData={contentData}
        _config={propData?._config ?? {}}
        trackData={trackData as any}
        type={localFilters?.type ?? ""}
        handleCardClick={handleCardClickLocal}
        hasMoreData={hasMoreData}
        handleLoadMore={handleLoadMore}
        isLoadingMoreData={isLoading}
        isPageLoading={isLoading && localFilters?.offset === 0}
        tabs={tabs}
        isHideEmptyDataMessage={propData?.hasMoreData !== false}
      />
      {propData?.showHelpDesk && <HelpDesk />}
      {propData?.showBackToTop && <BackToTop />}
    </LayoutPage>
  );
}
