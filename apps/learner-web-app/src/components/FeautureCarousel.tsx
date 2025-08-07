'use client';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  useMediaQuery,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import SpeakableText from '@shared-lib-v2/lib/textToSpeech/SpeakableText';

const mockData = [
  {
    image: '/images/feature-one.png',
    title: 'Count It',
    description:
      'Description: Lorem ipsum dolor sit amet, consectetur dipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
    actions: [{ type: 'video', label: 'Video' }],
  },
  {
    image: '/images/feature-two.png',
    title: 'Family Tree',
    description:
      'Description: Lorem ipsum dolor sit amet, consectetur dipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
    actions: [{ type: 'pdf', label: 'PDF' }],
  },
  {
    image: '/images/feature-three.png',
    title: 'Pictures & Shapes',
    description:
      'Description: Lorem ipsum dolor sit amet, consectetur dipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
    actions: [{ type: 'video', label: 'Video' }],
  },
  {
    image: '/images/feature-one.png',
    title: 'Musical Spoons',
    description:
      'Description: Lorem ipsum dolor sit amet, consectetur dipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
    actions: [{ type: 'video', label: 'Video' }],
  },
  {
    image: '/images/feature-two.png',
    title: "Nature's Recycling",
    description:
      'Description: Lorem ipsum dolor sit amet, consectetur dipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
    actions: [{ type: 'video', label: 'Video' }],
  },
  {
    image: '/images/feature-three.png',
    title: 'Fun Science Lab',
    description:
      'Description: Lorem ipsum dolor sit amet, consectetur dipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
    actions: [{ type: 'pdf', label: 'PDF' }],
  },
  {
    image: '/images/feature-one.png',
    title: 'Creative Art & Craft',
    description:
      'Description: Lorem ipsum dolor sit amet, consectetur dipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
    actions: [{ type: 'video', label: 'Video' }],
  },
];

const FeautureCarousel = () => {
  const mediaMD = useMediaQuery('(max-width: 900px)');

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={28}
        slidesPerView={mockData.length > 5 ? 5.5 : mockData.length}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        loop={true}
        centeredSlides={mockData.length < 6}
        breakpoints={{
          320: { slidesPerView: 1.5 },
          600: { slidesPerView: 2.5 },
          900: { slidesPerView: mockData.length > 5 ? 5.5 : mockData.length },
        }}
        style={{ padding: '20px 0' }}
      >
        {mockData.map((item, idx) => (
          <SwiperSlide key={idx}>
            <Box
              sx={{
                maxWidth: '320px',
                m: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0px 2px 16px 3px #0000000D',
                borderRadius: '10px',
              }}
            >
              <Box
                sx={{
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                />
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography
                  variant={mediaMD ? 'body5' : 'body1'}
                  component="h1"
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    // fontSize: 16,
                    letterSpacing: 0.15,
                    color: '#1F1B13',
                  }}
                >
                  <SpeakableText>{item.title}</SpeakableText>
                </Typography>
                <Typography
                  variant={mediaMD ? 'body5' : 'body1'}
                  component="h1"
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 400,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    color: '#1F1B13',
                    mt: 0.5,
                  }}
                >
                  <SpeakableText>{item.description}</SpeakableText>
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {item.actions.map((action, i) => (
                  <Button
                    key={i}
                    variant={action.type === 'video' ? 'outlined' : 'outlined'}
                    sx={{
                      borderRadius: '10px',
                      border: '1px solid #79747E',
                      color: '#1F1B13',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: 16,
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      padding: '2px 16px',
                    }}
                    startIcon={
                      action.type === 'video' ? (
                        <img src="/images/video.png" alt="video" width={20} />
                      ) : (
                        <img src="/images/pdf.png" alt="pdf" width={20} />
                      )
                    }
                    size="small"
                  >
                    <SpeakableText>{action.label}</SpeakableText>
                  </Button>
                ))}
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default FeautureCarousel;
