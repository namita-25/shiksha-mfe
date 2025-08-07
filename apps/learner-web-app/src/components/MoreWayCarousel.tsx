'use client';
import React from 'react';
import { Box, IconButton, Typography, Button, Grid } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GlobalStyles from '@mui/material/GlobalStyles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SpeakableText from '@shared-lib-v2/lib/textToSpeech/SpeakableText';
import { useColorInversion } from '../context/ColorInversionContext';

const slides = [
  {
    title: 'Pratham Learning App',
    description:
      'Breif description about the app here. Pratham undertook an exploratory study for children to understand the problem of plastic waste management in rural India.',
    image: '/images/banners.png',
  },
  {
    title: 'Digital Learning Expansion',
    description:
      'A new initiative to expand digital learning resources to rural schools. Over 5000 tablets distributed and 200+ workshops conducted.',
    image: '/images/banners.png',
  },
  {
    title: 'Fun Science Lab',
    description:
      'Explore science with fun experiments and activities. Designed for curious young minds to learn by doing.',
    image: '/images/banners.png',
  },
];

const MoreWayCarousel = () => {
  const { isColorInverted } = useColorInversion();

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: '.moreway-swiper-next',
          prevEl: '.moreway-swiper-prev',
        }}
        style={{ paddingBottom: 40 }}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <Grid container sx={{ boxShadow: '0px 6px 16px 4px #0000001A' }}>
              {/* Left: App Description */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    background: '#FDBE16',

                    height: '100%',
                  }}
                >
                  <Box sx={{ padding: '56px 40px 20px 40px' }}>
                    <Typography
                      variant="body8"
                      component="h6"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: 24,
                        letterSpacing: 0,
                        color: '#1F1B13',
                        lineHeight: '32px',
                      }}
                    >
                      <SpeakableText>{slide.title}</SpeakableText>
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 400,
                        // fontSize: 16,
                        // lineHeight: '24px',
                        color: '#1F1B13',
                        mt: 2,
                      }}
                    >
                      <SpeakableText>{slide.description}</SpeakableText>
                    </Typography>
                  </Box>

                  {/* Only show on desktop */}
                  <Box
                    sx={{
                      py: 2,
                      background: '#FFFFFF',
                      px: '36px',
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      gap: 2,
                      height: 76,
                      marginTop: '35px',
                    }}
                  >
                    <img src="/images/playstoreIcon.png" alt="Play Store" />

                    <Button
                      href="https://play.google.com/store/apps/details?id=com.pratham.learning"
                      target="_blank"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        color: '#0D599E',
                        fontFamily: 'Poppins',
                        fontWeight: 500,
                        fontSize: 18,
                        lineHeight: '24px',
                        cursor: 'pointer',
                        letterSpacing: 0.15,
                      }}
                    >
                      <SpeakableText cursor={true}>
                        Get it from Play Store Now!
                      </SpeakableText>
                    </Button>
                  </Box>
                </Box>
              </Grid>

              {/* Right: Phone Mockup (static image) */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#EAEAEA',
                    minHeight: 240,
                    height: '100%',
                    pt: 2,
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    component="img"
                    src={slide.image}
                    alt="Phone Mockup"
                    sx={{
                      width: 285,
                      height: 272,
                      borderRadius: 4,
                      objectFit: 'contain',
                    }}
                  />
                  {/* Only show on mobile */}
                  <Box
                    sx={{
                      py: 2,
                      background: '#FFFFFF',
                      px: '36px',
                      display: { xs: 'flex', md: 'none' },
                      alignItems: 'center',
                      gap: 2,
                      height: 76,
                      justifyContent: 'center',
                      mt: 2,
                      width: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    <img src="/images/playstoreIcon.png" alt="Play Store" />
                    <Button
                      href="https://play.google.com/store/apps/details?id=com.pratham.learning"
                      target="_blank"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        color: '#0D599E',
                        fontFamily: 'Poppins',
                        fontWeight: 500,
                        fontSize: 18,
                        lineHeight: '24px',
                        letterSpacing: 0.15,
                        '@media (max-width: 900px)': {
                          fontSize: '16px',
                        },
                      }}
                    >
                      <SpeakableText cursor={true}>
                        Get it from Play Store Now!
                      </SpeakableText>
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Custom navigation and pagination controls below Swiper */}
      <GlobalStyles
        styles={{
          '.custom-swiper-bullet': {
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#CDC5BD',
            display: 'inline-block',
            margin: '0 4px',
            transition: 'background 0.2s',
            cursor: 'pointer',
          },
          '.custom-swiper-bullet-active': {
            background: '#FDBE16',
          },
          '.custom-swiper-pagination': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 12px',
          },
          '.custom-swiper-nav-btn': {
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '50%',
            width: 36,
            height: 36,
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, border 0.2s',
            cursor: 'pointer',
            boxShadow: '0px 1px 2px 0px #0000004D',
            '&:hover': {
              background: '#ffe082',
              borderColor: '#ffe082',
            },
          },
        }}
      />
      {/* Desktop navigation (left side) */}
      <Box
        sx={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          zIndex: 2,
        }}
      >
        <IconButton
          className="moreway-swiper-prev"
          aria-label="Previous"
          sx={{
            background: isColorInverted ? '#1F1B13' : '#fff',
            width: 40,
            height: 40,
            boxShadow: '0px 4px 16px 0px #0000001A',
            mb: 1,
            '&:hover': {
              background: isColorInverted ? '#2A2520' : '#f5f5f5',
            },
          }}
        >
          <ChevronLeftIcon
            sx={{
              color: isColorInverted ? '#000' : '#222',
              fontSize: 32,
              fontWeight: 900,
            }}
          />
        </IconButton>
        <IconButton
          className="moreway-swiper-next"
          aria-label="Next"
          sx={{
            background: isColorInverted ? '#1F1B13' : '#fff',
            width: 40,
            height: 40,
            boxShadow: '0px 4px 16px 0px #0000001A',
            mt: 1,
            '&:hover': {
              background: isColorInverted ? '#2A2520' : '#f5f5f5',
            },
          }}
        >
          <ChevronLeftIcon
            sx={{
              color: isColorInverted ? '#000' : '#222',
              fontSize: 32,
              fontWeight: 900,
              transform: 'rotate(180deg)',
            }}
          />
        </IconButton>
      </Box>
      {/* Mobile navigation (bottom center) */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          mt: '-62px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <IconButton
          className="moreway-swiper-prev"
          aria-label="Previous"
          sx={{
            background: isColorInverted ? '#1F1B13' : '#fff',
            width: 40,
            height: 40,
            boxShadow: '0px 4px 16px 0px #0000001A',
            '&:hover': {
              background: isColorInverted ? '#2A2520' : '#f5f5f5',
            },
          }}
        >
          <ChevronLeftIcon
            sx={{
              color: isColorInverted ? '#000' : '#222',
              fontSize: 32,
              fontWeight: 900,
            }}
          />
        </IconButton>
        <IconButton
          className="moreway-swiper-next"
          aria-label="Next"
          sx={{
            background: isColorInverted ? '#1F1B13' : '#fff',
            width: 40,
            height: 40,
            boxShadow: '0px 4px 16px 0px #0000001A',
            '&:hover': {
              background: isColorInverted ? '#2A2520' : '#f5f5f5',
            },
          }}
        >
          <ChevronLeftIcon
            sx={{
              color: isColorInverted ? '#000' : '#222',
              fontSize: 32,
              fontWeight: 900,
              transform: 'rotate(180deg)',
            }}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MoreWayCarousel;
