import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'next-i18next';
import React from 'react';
import cohortIcon from '../../public/images/apartment.svg';
import deleteIcon from '../../public/images/deleteIcon.svg';
import editIcon from '../../public/images/editIcon.svg';
import reissueIcon from '../../public/images/reissue.png';

import { Role, Status, TelemetryEventType } from '@/utils/app.constant';
import { telemetryFactory } from '@/utils/telemetry';
import Image from 'next/image';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';
interface ActionCellProps {
  onEdit: (rowData: any) => void;
  onDelete: (rowData: any) => void;
  reassignCohort?: (rowData: any) => void;
  reassignType?: string;
  rowData: any;
  disable: boolean;
  userAction?: boolean;
  role?: string;
  onViewCourses?: (rowData: any) => void;
  onViewCertificate?: (rowData: any) => void;
  onIssueCertificate?: (rowData: any) => void;
  onDownloadCertificate?:(rowData: any) => void
}

const ActionIcon: React.FC<ActionCellProps> = ({
  rowData,
  onEdit,
  onDelete,
  reassignCohort,
  userAction = false,
  disable = false,
  reassignType,
  onViewCourses,
  onViewCertificate,
  onIssueCertificate,
  onDownloadCertificate,
  role,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  if (rowData.courseStatus === Status.ISSUED && onViewCertificate && onIssueCertificate && onDownloadCertificate) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          alignItems: 'center',
          pointerEvents: disable ? 'none' : 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            p: '10px',
          }}
          onClick={() => {
            onViewCertificate(rowData);
          }}
        >
          <PreviewIcon />
          <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>
            {t('CERTIFICATES.VIEW_CERTIFICATE')}

          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            p: '10px',
          }}
          onClick={() => {onIssueCertificate(rowData)}}
        >
          <Image src={reissueIcon} alt="" width={24} height={24} />
          <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>
            {t('CERTIFICATES.REISSUE_CERTIFICATE')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            p: '10px',
          }}
          onClick={() => {onDownloadCertificate(rowData)}}
        >
          <DownloadIcon/>
          <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>
            {t('CERTIFICATES.DOWNLOAD')}
          </Typography>
        </Box>
      </Box>
    );
  }
  if (rowData.courseStatus === 'Not Issued' && onIssueCertificate) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',

          cursor: 'pointer',
          p: '10px',
        }}
        onClick={() => {
          onIssueCertificate(rowData);
        }}
      >
        <AddBoxIcon />
        <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>
           {t('CERTIFICATES.ISSUE_CERTIFICATE')}
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        alignItems: 'center',
        pointerEvents: disable ? 'none' : 'auto',
      }}
    >
      <Tooltip title={t("COMMON.EDIT")}>
        <Box
          onClick={() => {
            onEdit(rowData);
            const windowUrl = window.location.pathname;
            const cleanedUrl = windowUrl.replace(/^\//, '');
            const env = cleanedUrl.split("/")[0];
        
            const telemetryInteract = {
              context: {
                env: env,
                cdata: [],
              },
              edata: {
                id: rowData?.cohortId?'click-edit-delete-action:'+rowData?.cohortId:rowData?.userId? 'edit-on-delete-action:'+rowData?.userId:'edit-on-delete-action',

                type: TelemetryEventType.CLICK,
                subtype: '',
                pageid: cleanedUrl,
              },
            };
            telemetryFactory.interact(telemetryInteract);
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            color: disable ? theme?.palette?.secondary.contrastText : "",
            backgroundColor:"#E3EAF0",
            p:"10px"


          }}
        >
<Image src={editIcon} alt="" />
          {/* <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.EDIT")}
          </Typography> */}
        </Box>
      </Tooltip>
      <Tooltip title={t("COMMON.DELETE")}>
        <Box
          onClick={() => {

            onDelete(rowData);
            const windowUrl = window.location.pathname;
            const cleanedUrl = windowUrl.replace(/^\//, '');
            const env = cleanedUrl.split("/")[0];
        
            const telemetryInteract = {
              context: {
                env: env,
                cdata: [],
              },
              edata: {
                id: rowData?.cohortId?'click-on-delete-action:'+rowData?.cohortId:rowData?.userId? 'click-on-delete-action:'+rowData?.userId:'click-on-delete-action',
                type: TelemetryEventType.CLICK,
                subtype: '',
                pageid: cleanedUrl,
              },
            };
            telemetryFactory.interact(telemetryInteract);
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            color: disable ? theme?.palette?.secondary.contrastText : "",
            backgroundColor:"#F8EFE7",
            p:"10px"
          }}
        >
        <Image src={deleteIcon} alt="" />
{/* 
          <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.DELETE")}
          </Typography> */}
        </Box>
      </Tooltip>

     { userAction && reassignType && ( <Tooltip title={reassignType}>
        <Box
          onClick={() => {
            if(reassignCohort)
            {
              reassignCohort(rowData);
              const windowUrl = window.location.pathname;
              const cleanedUrl = windowUrl.replace(/^\//, '');
              const env = cleanedUrl.split("/")[0];
          
              const telemetryInteract = {
                context: {
                  env: env,
                  cdata: [],
                },
                edata: {
                  id: 'click-on-reassign-action:'+rowData?.userId,
                  type: TelemetryEventType.CLICK,
                  subtype: '',
                  pageid: cleanedUrl,
                },
              };
              telemetryFactory.interact(telemetryInteract);
            }

          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            color: disable ? theme?.palette?.secondary.contrastText : "",
            backgroundColor:"#E5E5E5",
            p:"10px"
          }}
        >
        <Image src={cohortIcon} alt=""  />
{/* 
          <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.DELETE")}
          </Typography> */}
        </Box>
      </Tooltip>)}
      
    </Box>
  );
};

export default ActionIcon;
