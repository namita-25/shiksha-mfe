import { Box, CSSObject, useTheme } from "@mui/material";
import { CommonCard, ContentItem } from "@shared-lib";
import AppConst from "../../utils/AppConst/AppConst";
import { getBestImageUrl } from "../../utils/imageUtils";
import { StatusIcon } from "../CommonCollapse";
import Description from "./Description";

const ContentCard = ({
  item,
  type,
  default_img,
  _card,
  handleCardClick,
  trackData,
}: {
  item: ContentItem;
  type: any;
  default_img?: string;
  _card?: any;
  handleCardClick: (content: ContentItem, e?: any) => void;
  trackData?: [];
}) => {
  const { isWrap } = _card ?? {};

  if (_card?.cardComponent) {
    return (
      <CardWrap isWrap={isWrap && type === "Course"} _card={_card}>
        <_card.cardComponent
          item={item}
          type={type}
          default_img={default_img}
          _card={_card}
          handleCardClick={handleCardClick}
          trackData={trackData}
        />
      </CardWrap>
    );
  }
  return (
    <CardWrap isWrap={isWrap && type === "Course"} _card={_card}>
      <CommonCard
        title={(item?.name || "").trim()}
        image={
          (getBestImageUrl(item, process.env.NEXT_PUBLIC_MIDDLEWARE_URL) ||
            default_img) ??
          `${AppConst.BASEPATH}/assests/images/image_ver.png`
        }
        content={item?.description ? item?.description : <Description />}
        actions={
          type !== "Course" && (
            <StatusIcon
              showMimeTypeIcon
              mimeType={item?.mimeType}
              _icon={{
                isShowText: true,
                _box: {
                  py: "7px",
                  px: "8px",
                  borderRadius: "10px",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#79747E",
                },
              }}
            />
          )
        }
        orientation="horizontal"
        item={item}
        TrackData={trackData}
        type={type}
        onClick={(e: any) => handleCardClick(item, e)}
        _card={{
          _contentParentText: {
            sx: { height: type !== "Course" ? "156px" : "172px" },
          },
          ..._card,
        }}
      />
    </CardWrap>
  );
};

export default ContentCard;

export const CardWrap = ({
  children,
  isWrap,
  _card,
}: {
  children: React.ReactNode;
  isWrap?: boolean;
  _card?: any;
}) => {
  const theme = useTheme();
  const borderRadius = (
    theme?.components?.MuiCard?.styleOverrides?.root as CSSObject
  )?.borderRadius;
  if (!isWrap) {
    return children;
  }
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        mt: 1,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -8,
          zIndex: 0,
          width: _card?.sx?.width ?? "100%",
          px: 2,
        }}
      >
        <Box
          sx={{
            border: "1px solid #fff",
            boxShadow: "2px 0px 6px 2px #00000026, 1px 0px 2px 0px #0000004D",
            backgroundColor: "#DED8E1",
            height: "32px",
            borderRadius: borderRadius,
          }}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: -4,
          zIndex: 0,
          width: _card?.sx?.width ?? "100%",
          px: 1,
        }}
      >
        <Box
          sx={{
            border: "1px solid #fff",
            boxShadow: "2px 0px 6px 2px #00000026, 1px 0px 2px 0px #0000004D",
            backgroundColor: "#DED8E1",
            height: "32px",
            borderRadius: borderRadius,
          }}
        />
      </Box>
      <Box sx={{ zIndex: 1, width: _card?.sx?.width ?? "100%" }}>
        {children}
      </Box>
    </Box>
  );
};
