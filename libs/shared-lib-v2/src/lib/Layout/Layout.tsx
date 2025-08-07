//@ts-nocheck
'use client';
import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Footer } from '../Footer/Footer';
import { AppBarProps, TopAppBar } from '../Header/TopAppBar';
import { Button, debounce, Typography } from '@mui/material';
import { Loader } from '../Loader/Loader';

export interface LayoutProps {
  isLoadingChildren?: boolean;
  children: React.ReactNode;
  onlyShowElements?: string[];
  onlyHideElements?: string[];
  backTitle?: string;
  backIconClick?: () => void;
  _topAppBar?: AppBarProps;
  footerComponent?: React.ReactNode;
  sx?: object;
  _children?: object;
}

export const Layout: React.FC<LayoutProps> = ({
  isLoadingChildren = false,
  children,
  onlyShowElements,
  onlyHideElements,
  backTitle,
  backIconClick,
  _topAppBar,
  _children,
  footerComponent,
  sx = {},
}) => {
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [showElements, setShowElements] = useState([]);
  const refs = useRef({});

  useEffect(() => {
    const handleResize = debounce(() => {
      const totalHeight = Object.keys(refs.current).reduce((acc, key) => {
        const ref: HTMLElement | undefined =
          refs.current[key as keyof typeof refs.current];
        if (ref) {
          return acc + ref.offsetHeight;
        }
        return acc;
      }, 0);

      setLayoutHeight(totalHeight);
    }, 500);
    const init = () => {
      const arr = ['footer', 'back', 'logo', 'topBar'];
      if (onlyShowElements) {
        arr.push(...onlyShowElements);
      } else if (onlyHideElements) {
        setShowElements(
          arr.filter((item) => !onlyHideElements?.includes(item))
        );
      } else {
        setShowElements(arr);
      }
    };
    init();
    window.addEventListener('resize', handleResize);

    if (Object.keys(refs.current).length) {
      handleResize();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [Object.keys(refs.current).length, onlyHideElements, onlyShowElements]);

  const handleButtonClick = () => {
    console.log('Footer button clicked!');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...sx,
      }}
    >
      <Box
        ref={(refAppBar) => {
          if (
            !Object.prototype.hasOwnProperty.call(refs.current, 'topAppBar')
          ) {
            refs.current = { ...refs.current, topAppBar: refAppBar };
          }
        }}
        sx={{
          zIndex: 2,
          bgcolor: 'transparent',
        }}
      >
        {showElements?.includes('topBar') && (
          <Box
            sx={{
              display: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                width: '100%',
                bgcolor: '#FFFFFF',
              }}
              minHeight={'64px'}
            >
              <TopAppBar title="Dashboard" {..._topAppBar} />
            </Box>
          </Box>
        )}

        {/* Render Back Button Below the TopAppBar */}
        {showElements?.includes('back') && backIconClick && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={backIconClick}
            sx={{
              textTransform: 'none',
              color: '#1E1B16',
              fontSize: '16px',
            }}
          >
            <Typography fontSize={'22px'} fontWeight={400}>
              {backTitle}
            </Typography>
          </Button>
        )}
      </Box>

      <Loader
        isLoading={isLoadingChildren}
        layoutHeight={layoutHeight}
        {..._children}
      >
        {children}
      </Loader>

      {/* Render Loader above the Footer */}
      {showElements?.includes('footer') && (
        <Box
          sx={{
            width: '100%',
            bgcolor: 'white',
          }}
          ref={(refFoot) => {
            if (!Object.prototype.hasOwnProperty.call(refs.current, 'footer')) {
              refs.current = { ...refs.current, footer: refFoot };
            }
          }}
        >
          {footerComponent ?? (
            <Footer
              buttonLabel="Continue"
              // buttonWidth="328px"
              buttonHeight="40px"
              buttonBorderRadius="50px"
              buttonBackgroundColor="#FDBE16"
              buttonColor="#1E1B16"
              buttonFontSize="14px"
              buttonFontWeight={500}
              buttonSupportingText=""
              bottompx={0}
              onButtonClick={handleButtonClick}
            />
          )}
        </Box>
      )}
    </Box>
  );
};
