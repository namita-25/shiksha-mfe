'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HomeCards from '@learner/app/themantic/HomeCards/HomeCards';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import Layout from '../layout/Layout';
import SubHeader from '../subHeader/SubHeader';

// Dynamic import of Content component with SSR disabled
const Content = dynamic(() => import('@Content'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4">
      Loading content...
    </div>
  ),
});

interface ListProps {
  items?: any[];
  title?: string;
  className?: string;
}

const List: React.FC<ListProps> = ({
  items = [],
  // title = 'Content List',
  className = '',
}) => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<any>('');

  // Load selectedFilter from localStorage on component mount
  useEffect(() => {
    const savedFilter = localStorage.getItem('selectedFilter');
    if (savedFilter) {
      setSelectedFilter(savedFilter);
    }
  }, []);

  const handleTotalCountChange = (count: number) => {
    setTotalCount(count);
  };

  // Update localStorage when selectedFilter changes
  const handleFilterChange = (filter: any) => {
    setSelectedFilter(filter);
    localStorage.setItem('selectedFilter', filter);
  };

  console.log(selectedFilter, 'selectedFilter');

  return (
    <Layout>
      <SubHeader
        showFilter={true}
        resourceCount={totalCount}
        getFilter={(e) => handleFilterChange(e)}
      />
      <Box
        sx={{
          backgroundImage: `url('/images/mainpagebig.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: { xs: 2, md: 4 },
          py: 4,
        }}
      >
        <div className={`list-container ${className}`}>
          {/* <h2 className="text-xl font-semibold mb-4">{title}</h2> */}

          <div className="content-wrapper">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  Loading...
                </div>
              }
            >
              <Container maxWidth="lg">
                <Box
                  sx={{
                    '& .css-17kujh3': {
                      overflowY: 'unset !important',
                    },
                  }}
                >
                  <Content
                    key={`course-${selectedFilter}`}
                    isShowLayout={false}
                    contentTabs={['Course']}
                    pageName="Course"
                    onTotalCountChange={handleTotalCountChange}
                    filters={{
                      limit: 3,
                      filters: {
                        program: 'Experimento India',
                        contentLanguage: [selectedFilter || 'English'],
                      },
                    }}
                    _config={{
                      contentBaseUrl: '/themantic',
                      _grid: {
                        xs: 12,
                        sm: 6,
                        md: 4,
                        lg: 4,
                        xl: 4,
                      },
                      _containerGrid: {
                        spacing: { xs: 6, sm: 6, md: 6 },
                      },
                      default_img: '/images/image_ver.png',
                      _card: {
                        cardComponent: mainCourseCard,
                      },
                    }}
                    hasMoreData={false}
                  />
                </Box>
              </Container>
            </Suspense>
          </div>
        </div>
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Box
            sx={{
              backgroundColor: '#fff',
              padding: 3,
              position: 'relative',
              zIndex: 1000,
              borderRadius: '0px 6px 6px 6px',
              mt: '110px',
              '& .css-17kujh3': {
                overflowY: 'unset !important',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFC107',
                width: 'fit-content',
                position: 'absolute',
                top: '-46px',
                left: 0,
                p: 1,
                border: '1px solid white',
                borderTopLeftRadius: '0.25rem',
                borderTopRightRadius: '0.25rem',
              }}
            >
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#000',
                }}
              >
                New Arrivals
              </Typography>
            </Box>
            <Box
              sx={{
                '& .css-4oqe9z': {
                  display: 'none !important',
                  marginBottom: '0 !important',
                },
                '& .css-17kujh3': {
                  overflowY: 'unset !important',
                },
              }}
            >
              <Content
                key={`content-${selectedFilter}`}
                isShowLayout={false}
                contentTabs={['content']}
                pageName="content"
                onTotalCountChange={handleTotalCountChange}
                filters={{
                  limit: 3,
                  sort_by: { lastUpdatedOn: 'desc' },
                  filters: {
                    program: 'Experimento India',
                    contentLanguage: [selectedFilter || 'English'],
                  },
                }}
                _config={{
                  contentBaseUrl: '/themantic',
                  _grid: {
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 4,
                    xl: 4,
                  },
                  _containerGrid: {
                    spacing: { xs: 6, sm: 6, md: 6 },
                  },
                  default_img: '/images/image_ver.png',
                  _card: {
                    cardComponent: cardHideExplore,
                  },
                }}
                hasMoreData={false}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default List;

export const mainCourseCard = (props: any) => (
  <CardComponent
    {...props}
    titleFontSize="24px"
    fontWeight={700}
    minHeight="317px"
  />
);

export const cardHideExplore = (props: any) => (
  <CardComponent
    {...props}
    titleFontSize="16px"
    isExplore={false}
    minHeight="286px"
  />
);
export const CardComponent = ({
  item,
  default_img,
  handleCardClick,
  isExplore = true,
  titleFontSize,
  fontWeight,
  minHeight,
}: {
  item: any;
  default_img: any;
  handleCardClick: any;
  isExplore?: boolean;
  titleFontSize?: string;
  fontWeight?: number;
  minHeight?: string;
}) => {
  const onClick = (id: string) => {
    if (handleCardClick) {
      handleCardClick(id);
    }
  };

  return (
    <Box
      onClick={() => onClick(item)}
      sx={{
        backgroundColor: '#fff',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        boxShadow: '0 0.15rem 1.75rem 0 rgba(33, 40, 50, 0.15)',
        border: '1px solid rgba(0, 0, 0, .125)',
        minHeight: minHeight || '317px',
        borderRadius: '.25rem',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ margin: '8px' }}>
          <img
            height={'200px'}
            src={
              item.posterImage || item.appIcon || item.thumbnail || default_img
            }
            alt={item.name || item.title || 'Content'}
            style={{ width: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: fontWeight || 400,
            textAlign: 'center',
            fontSize: titleFontSize || '16px',
            letterSpacing: '1px',
            lineHeight: 1.2,
            mt: 1,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#212529',
            px: '16px',
          }}
        >
          {item.name || item.title || 'Untitled'}
        </Typography>

        {/* Explore Button */}

        {isExplore && (
          <>
            <Divider
              sx={{
                mt: 2,
                mb: 2,
                width: '100%',
                borderColor: '#e0e0e0',
                borderWidth: '1px',
              }}
              variant="fullWidth"
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                px: 2,
                pb: 2,
              }}
            >
              <Box sx={{ fontSize: '16px', color: '#363d47', fontWeight: 600 }}>
                Explore
              </Box>
              <Box>
                <img height={'20px'} src={'/images/arrow.png'} alt="arrow" />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
