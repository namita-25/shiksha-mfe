import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface FooterProps {
  buttonLabel: string;
  buttonWidth?: string;
  buttonHeight?: string;
  buttonBackgroundColor?: string;
  buttonBorderRadius?: string;
  buttonColor?: string;
  buttonFontSize?: string | number;
  buttonFontWeight?: string | number;
  buttonSupportingText?: string;
  bottompx?: number;
  onButtonClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  buttonLabel = 'Click',
  buttonWidth = '328px',
  buttonHeight = '40px',
  buttonBackgroundColor = '#6750A4',
  buttonBorderRadius = '50px',
  buttonColor = '#FFFFFF',
  buttonFontSize = '16px',
  buttonFontWeight = 500,
  buttonSupportingText = 'Supporting text',
  bottompx = 0,
  onButtonClick,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        position: 'relative',
        bottom: bottompx,
        backgroundColor: '#F9F9F9',
      }}
    >
      <Box
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          paddingTop: 2,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button
          sx={{
            width: buttonWidth,
            height: buttonHeight,
            bgcolor: buttonBackgroundColor,
            borderRadius: buttonBorderRadius,
            color: buttonColor,
            fontSize: buttonFontSize,
            fontWeight: buttonFontWeight,
            '&:hover': {
              bgcolor: buttonBackgroundColor,
              opacity: 0.9,
            },
          }}
          onClick={onButtonClick}
          aria-label={buttonLabel}
        >
          {buttonLabel}
        </Button>
        {buttonSupportingText && (
          <Typography
            variant="body1"
            fontSize={'16px'}
            color="#3B383E"
            fontWeight={500}
          >
            {buttonSupportingText}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
