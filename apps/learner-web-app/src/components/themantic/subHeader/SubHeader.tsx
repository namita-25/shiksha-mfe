'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  InputBase,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { SearchButton } from '../SearchButton';
import { useRouter } from 'next/navigation';
import { logEvent } from '@learner/utils/googleAnalytics';

const languages = ['English', 'Marathi', 'Hindi'];
const STORAGE_KEY = 'selectedLanguage';

const SubHeader = ({
  showFilter,
  getFilter,
  resourceCount = 0,
}: {
  showFilter: boolean;
  getFilter?: (lang: string) => void;
  resourceCount?: number;
}) => {
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Initialize selectedLang with value from localStorage to prevent flash
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && languages.includes(savedLang)) {
        return savedLang;
      }
    }
    return 'English';
  };

  const [selectedLang, setSelectedLang] = React.useState(getInitialLanguage);
  const open = Boolean(anchorEl);
  const router = useRouter();

  // Load selected language from localStorage on component mount and call getFilter
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && languages.includes(savedLang) && getFilter) {
      getFilter(savedLang);
    }
  }, [getFilter]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked button:', selectedLang);
          if (typeof window !== 'undefined') {     

     const windowUrl = window.location.pathname;
                 const cleanedUrl = windowUrl;

                logEvent({
                  action: 'filter thematic content by language ' + selectedLang,
                  category: cleanedUrl,
                  label: 'Filter thematic content by language ',
                });
              }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (lang?: string) => {
    setAnchorEl(null);
    if (lang) {
      setSelectedLang(lang);
      // Save selected language to localStorage
      localStorage.setItem(STORAGE_KEY, lang);
    }
    if (getFilter) getFilter(lang || '');
  };

  return (
    <>
      {/* Main Title */}
      <Box
        sx={{
          fontSize: { xs: '24px', sm: '28px', md: '32px', lg: '36px' },
          fontWeight: 700,
          color: '#3891CE',
          fontFamily: '"Montserrat", sans-serif',
          textAlign: 'center',
          bgcolor: '#fff',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          wordWrap: 'break-word',
          lineHeight: 1.2,
        }}
      >
        STEM Education for Innovation : Experimento India
      </Box>

      {/* Main Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 2, sm: 3 },
          bgcolor: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          borderRadius: 2,
          minHeight: { xs: 'auto', md: 64 },
          width: '100%',
          gap: { xs: 2, md: 2 },
        }}
      >
        {/* Language Dropdown */}
        {showFilter && (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClick}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                bgcolor: '#fff',
                color: '#222',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                border: '1px solid #d1d5db',
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1.5, sm: 1 },
                minWidth: { xs: 140, sm: 120 },
                maxWidth: { xs: 200, sm: 'none' },
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                justifyContent: 'space-between',
                '&:hover': { bgcolor: '#f5f6fa', border: '1px solid #d1d5db' },
              }}
            >
              {selectedLang}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => handleClose()}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: { xs: 140, sm: 120 },
                },
              }}
            >
              {languages.map((lang) => (
                <MenuItem key={lang} onClick={() => handleClose(lang)}>
                  {lang}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}

        {/* Centered Label */}
        {showFilter && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              order: { xs: 2, md: 1 },
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '16px', sm: '18px' },
                  color: 'black',
                  mb: 0.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                {resourceCount} Resources
              </Typography>
              <Box
                sx={{
                  height: 3,
                  width: { xs: 40, sm: 48 },
                  mx: 'auto',
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                  opacity: 0.2,
                }}
              />
            </Box>
          </Box>
        )}

        {/* Search Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-end' },
            width: '100%',
            order: { xs: 1, md: 2 },
          }}
        >
          <Box
            sx={{
              minWidth: { xs: '100%', sm: 260 },
              maxWidth: { xs: '100%', sm: 340 },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <SearchButton
              searchValue={search}
 onSearch={() => 
              {
                if (typeof window !== 'undefined') {

                 const windowUrl = window.location.pathname;
                 const cleanedUrl = windowUrl;

                logEvent({
                  action: 'search in thematic coneten by ' + search,
                  category: cleanedUrl,
                  label: 'Search thematic content',
                });
                router.push('/themantic/search?q=' + search)
              }}

            }              handleSearch={setSearch}
              _box={{
                mx: 'auto',
                mt: { xs: 0, sm: 4 },
                '@media (min-width: 900px)': {
                  mb: '100px',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SubHeader;