'use client';
import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // You can replace this with an ice cream emoji if needed
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Image from 'next/image';
import tada from '../../../images/tada.gif';
import CertificateModal from '../CertificateModal/CertificateModal';
interface CourseCompletionBannerProps {
  certificateId: string;
}
export const CourseCompletionBanner: React.FC<CourseCompletionBannerProps> = ({
  certificateId,
}) => {
  const [showCertificate, setShowCertificate] = useState(false);

  const handlePreviewClick = () => {
    setShowCertificate(true);
  };
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          p: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 5 },
          flexDirection: { xs: 'column', sm: 'row' },
          background: 'linear-gradient(90deg, #fff9f0 0%, #fefcee 100%)',
          borderRadius: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#f2e4ca',
            px: 2,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          <Image
            src={tada}
            alt="Smiley face"
            width={30}
            height={30}
            style={{ marginBottom: '16px' }}
          />{' '}
          <Typography fontWeight="500">
            Congratulations on completing the course!
          </Typography>
        </Paper>

        {/* Right box with button */}
        <Button
          variant="contained"
          onClick={handlePreviewClick}
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: '#ffd600',
            color: 'black',
            borderRadius: 999,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#ffcc00',
            },
          }}
        >
          Preview Certificate
        </Button>
      </Box>
      <CertificateModal
        open={showCertificate}
        setOpen={setShowCertificate}
        certificateId={certificateId}
      />
    </>
  );
};
