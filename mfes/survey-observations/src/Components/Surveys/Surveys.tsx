import { Box, Typography } from '@mui/material';
import React from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useTheme } from '@mui/material/styles';
// import { useTranslation } from 'next-i18next';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useTranslation } from '@shared-lib';
interface SurveysProps {
  title: string;
  date?: string;
  villages?: number;
  status?: string;
  actionRequired?: string;
  isActionRequired?: boolean;
  onClick?: () => void;
  minHeight?: string;
}
function Surveys({
  title,
  date,
  onClick,
  status,
  villages,
  actionRequired,
  minHeight,
}: SurveysProps) {
  const theme = useTheme<any>();
  const { t } = useTranslation();

  return (
    <Box onClick={onClick}>
      <Box
        sx={{
          border: '1px solid #D0C5B4',
          borderRadius: '12px',
          padding: '10px 16px',
          cursor: 'pointer',
          background: '#fff', // White background
          minHeight: minHeight || '60px',
          width: '320px', // Set fixed width based on image
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: '400',
                color: theme.palette.warning['300'],
              }}
              className="one-line-text"
            >
              {title}
            </Typography>
            {status && (
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme?.palette?.success?.main,
                }}
                className="one-line-text"
              >
                {status}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            {villages && (
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: theme.palette.warning['400'],
                }}
                className="one-line-text"
              >
                {villages} {t('SURVEYS.VILLAGES')}
              </Typography>
            )}
            {date && (
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: theme.palette.warning['400'],
                }}
                className="one-line-text"
              >
                {t('SURVEYS.CLOSED_ON')} {date}
              </Typography>
            )}
          </Box>

          {actionRequired && (
            <Box sx={{ display: 'flex', gap: '2px', mt: '3px' }}>
              <Box>
                <PriorityHighIcon
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '20px',
                    color: theme?.palette?.error?.main,
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: theme?.palette?.error?.main,
                }}
                className="one-line-text"
              >
                {actionRequired}
              </Typography>
            </Box>
          )}
        </Box>
        <Box>
          <KeyboardArrowRightIcon />
        </Box>
      </Box>
    </Box>
  );
}

export default Surveys;
