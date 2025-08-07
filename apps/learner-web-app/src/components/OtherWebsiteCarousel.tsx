'use client';
import React from 'react';
import { Box, Divider, useTheme } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const OtherWebsiteCarousel = ({
  images,
}: {
  images: { src: string; alt: string }[];
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Swiper
        modules={[Pagination]}
        slidesPerView={'auto'}
        spaceBetween={0}
        style={{ width: '100%', maxWidth: 1100 }}
        allowTouchMove={true}
        pagination={{
          clickable: true,
          enabled: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            pagination: {
              enabled: true,
            },
          },
          600: {
            slidesPerView: 2,
            pagination: {
              enabled: false,
            },
          },
          900: {
            slidesPerView: 4,
            pagination: {
              enabled: false,
            },
          },
        }}
      >
        {images.map((image, idx) => (
          <SwiperSlide
            key={idx}
            style={{
              width: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                px: 3,
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                style={{
                  maxHeight: 60,
                  maxWidth: 140,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
                loading="lazy"
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`
        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 8px;
          position: relative;
        }
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #e0e0e0;
          opacity: 1;
          border-radius: 50%;
          margin: 0 6px !important;
          transition: background 0.3s;
        }
        .swiper-pagination-bullet-active {
          background: #fdbe16;
        }
      `}</style>
    </Box>
  );
};

export default OtherWebsiteCarousel;
