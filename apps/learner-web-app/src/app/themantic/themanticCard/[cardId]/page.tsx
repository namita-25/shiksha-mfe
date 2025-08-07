'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import Layout from '../../../../components/themantic/layout/Layout';
import SubHeader from '../../../../components/themantic/subHeader/SubHeader';

// Reusable Breadcrumb Component
const CustomBreadcrumbs = ({
  items,
}: {
  items: Array<{ label: string; onClick?: () => void; isActive?: boolean }>;
}) => (
  <Box sx={{ mb: 4 }}>
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: 'white' }} />}
      sx={{
        '& .MuiBreadcrumbs-li': {
          display: 'flex',
          alignItems: 'center',
        },
      }}
    >
      {items.map((item, index) =>
        item.isActive ? (
          <Typography
            key={index}
            sx={{
              color: 'black',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {item.label}
          </Typography>
        ) : (
          <Link
            key={index}
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onClick={item.onClick}
          >
            {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: '20px' }} />}
            {item.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  </Box>
);

// Reusable Card Component for Energy Cards
const EnergyCard = ({
  card,
  index,
  onClick,
}: {
  card: any;
  index: number;
  onClick: (id: number) => void;
}) => (
  <Grid item xs={12} md={4} key={card.id}>
    <Card
      onClick={() => onClick(card.id)}
      sx={{
        backgroundColor: '#fff',
        position: 'relative',
      }}
    >
      {/* Circular Icons positioned around the card */}

      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ margin: '8px' }}>
          <img height={'200px'} src={card.image} alt="" />
        </Box>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            color: index === 2 ? 'white' : '#2C3E50',
            fontSize: '18px',
            letterSpacing: '1px',
            lineHeight: 1.2,
            mt: 2,
            mb: 2,
          }}
        >
          {card.title}
        </Typography>

        {/* Main Illustration Area with Characters */}

        {/* Explore Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Box>{card.subtitle}</Box>
          <Box>
            <img height={'20px'} src={'/images/arrow.png'} alt="" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

// Reusable Card Component for Basics Cards
const BasicsCard = ({
  card,
  index,
  onClick,
}: {
  card: any;
  index: number;
  onClick: (id: number) => void;
}) => (
  <Grid item xs={12} sm={6} md={4} key={card.id}>
    <Card
      onClick={() => onClick(card.id)}
      sx={{
        backgroundColor: '#fff',
        position: 'relative',
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ margin: '8px' }}>
          <img height={'200px'} src={card.image} alt="" />
        </Box>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#2C3E50',
            fontSize: '18px',
            letterSpacing: '1px',
            lineHeight: 1.2,
            mt: 2,
            mb: 2,
          }}
        >
          {card.title}
        </Typography>

        {/* Explore Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Box>{card.subtitle}</Box>
          <Box>
            <img height={'20px'} src={'/images/arrow.png'} alt="" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

// Reusable Grid Container
const CardGrid = ({ children }: { children: React.ReactNode }) => (
  <Grid container spacing={4} justifyContent="center">
    {children}
  </Grid>
);

const ThemanticCard = () => {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'basics-of-energy', or 'energy-companion'

  const energyCards = [
    {
      id: 1,
      title: 'BASICS OF ENERGY',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
    {
      id: 2,
      title: 'ELECTRICITY PART-1',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
    {
      id: 3,
      title: 'ELECTRICITY PART-2',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
  ];

  const basicsOfEnergyCards = [
    {
      id: 1,
      title: 'ENERGY OUR INVISIBLE COMPANION',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
    {
      id: 2,
      title: 'DID YOU WORK TODAY?',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
    {
      id: 3,
      title: 'RENEWABLE ENERGY: INFINITE SOURCES OF ENERGY',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
    {
      id: 4,
      title: 'NON-RENEWABLE ENERGY: LIMITED SOURCES OF ENERGY',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
    {
      id: 5,
      title: 'HARNESSING SOLAR ENERGY: MAKING A SIMPLE SOLAR COOKER',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
    {
      id: 6,
      title: 'FROM REST TO MOTION: ENERGY EVERYWHERE',
      subtitle: 'Explore',
      image: '/images/Basics_of_energ.png',
    },
  ];

  const handleNavigate = (cardId: number) => {
    if (cardId === 1) {
      setCurrentView('basics-of-energy');
    } else {
      console.log(`Navigating to card: ${cardId}`);
    }
  };

  const handleBasicsCardClick = (cardId: number) => {
    if (cardId === 1) {
      setCurrentView('energy-companion');
    } else {
      console.log(`Exploring: ${cardId}`);
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleBackToBasics = () => {
    setCurrentView('basics-of-energy');
  };

  const getBreadcrumbItems = () => {
    const baseItems = [{ label: 'Home', onClick: handleBackToMain }];

    if (currentView === 'main') {
      return [...baseItems, { label: 'Energy', isActive: true }];
    } else if (currentView === 'basics-of-energy') {
      return [
        ...baseItems,
        { label: 'Energy', onClick: handleBackToMain },
        { label: 'Basics of Energy', isActive: true },
      ];
    } else if (currentView === 'energy-companion') {
      return [
        ...baseItems,
        { label: 'Energy', onClick: handleBackToMain },
        { label: 'Basics of Energy', onClick: handleBackToBasics },
        { label: 'Energy Our Invisible Companion', isActive: true },
      ];
    }
    return baseItems;
  };

  const renderMainView = () => (
    <>
      <CustomBreadcrumbs items={getBreadcrumbItems()} />
      <CardGrid>
        {energyCards.map((card, index) => (
          <EnergyCard
            key={card.id}
            card={card}
            index={index}
            onClick={handleNavigate}
          />
        ))}
      </CardGrid>
    </>
  );

  const renderBasicsOfEnergyView = () => (
    <>
      <CustomBreadcrumbs items={getBreadcrumbItems()} />
      <CardGrid>
        {basicsOfEnergyCards.map((card, index) => (
          <BasicsCard
            key={card.id}
            card={card}
            index={index}
            onClick={handleBasicsCardClick}
          />
        ))}
      </CardGrid>
    </>
  );

  const renderEnergyCompanionView = () => (
    <>
      <CustomBreadcrumbs items={getBreadcrumbItems()} />
      {/* Content Layout */}
      <Grid container spacing={4}>
        {/* Left Sidebar - Content Info */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: '#E8F4FD',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '3px solid white',
              overflow: 'hidden',
            }}
          >
            {/* Card Image */}
            <Box
              sx={{
                height: '250px',
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Circular icons */}
              {['🌊', '⚡', '🏠', '🔋'].map((icon, index) => {
                const positions = [
                  { top: '20px', left: '20px' },
                  { top: '20px', right: '20px' },
                  { bottom: '20px', left: '20px' },
                  { bottom: '20px', right: '20px' },
                ];
                return (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      ...positions[index],
                      width: '50px',
                      height: '50px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      border: '2px solid white',
                    }}
                  >
                    {icon}
                  </Box>
                );
              })}

              {/* Running person illustration */}
              <Box
                sx={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  border: '2px solid white',
                }}
              >
                🏃‍♂️
              </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: '#2C3E50',
                  fontSize: '20px',
                  letterSpacing: '0.5px',
                  lineHeight: 1.2,
                  mb: 3,
                  textDecoration: 'underline',
                }}
              >
                Energy Our Invisible Companion
              </Typography>

              {/* Description */}
              <Typography
                sx={{
                  color: '#2C3E50',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  textAlign: 'justify',
                }}
              >
                This resource is designed to explain the concept of energy. It
                explores what energy is, why it is called an invisible
                companion, and why it is essential in our lives. To make
                learning more engaging and effective, the resource includes
                interactive questions that help in better understanding these
                aspects.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Video Player */}
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              backgroundColor: '#000',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              height: { xs: '300px', md: '500px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* Video Player Interface */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1a1a',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Video placeholder */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                }}
              >
                📹
              </Box>

              {/* Video Controls */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '60px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px',
                  color: 'white',
                }}
              >
                {/* Play button */}
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    mr: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  ▶
                </Box>

                {/* Time display */}
                <Typography sx={{ fontSize: '14px', mr: 2 }}>
                  0:00 / 3:31
                </Typography>

                {/* Progress bar */}
                <Box
                  sx={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '2px',
                    position: 'relative',
                    mr: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: '0%',
                      height: '100%',
                      backgroundColor: '#29B6F6',
                      borderRadius: '2px',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Layout>
      <SubHeader showFilter={false} />
    <Box
      sx={{
        backgroundImage: `url('/images/energy-background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: { xs: 2, md: 4 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(135deg, rgba(135,206,235,0.8) 0%, rgba(70,130,180,0.8) 50%, rgba(30,144,255,0.8) 100%)',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 60% 20%, rgba(255,255,255,0.1) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100px 100px, 80px 80px, 120px 120px',
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {currentView === 'main'
          ? renderMainView()
          : currentView === 'basics-of-energy'
          ? renderBasicsOfEnergyView()
          : renderEnergyCompanionView()}
      </Box>
    </Box>
    </Layout>
  );
};

export default ThemanticCard;
