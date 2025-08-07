'use client';
import React from 'react';
import { Box, useTheme } from '@mui/material';

const KnwoledgeCarousel = ({
  images,
}: {
  images: { src: string; alt: string }[];
}) => {
  const theme = useTheme();

  // Duplicate images array to create seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#fff',
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: 1100,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            animation: `slide ${images.length > 20 ? 90 : 20}s linear infinite`,
            '@keyframes slide': {
              '0%': {
                transform: 'translateX(0)',
              },
              '100%': {
                transform: 'translateX(-50%)',
              },
            },
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
        >
          {duplicatedImages.map((image, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                px: 3,
                borderRight: `1px solid #FDBE16`,
                flexShrink: 0,
                width: 220,
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                style={{ maxHeight: 60, maxWidth: 140, objectFit: 'contain' }}
                loading="lazy"
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default KnwoledgeCarousel;
