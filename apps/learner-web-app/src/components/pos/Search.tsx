'use client';
import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@learner/components/pos/Layout';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { SearchButton } from './SearchButton';
import { debounce } from 'lodash';
import SpeakableText from '@shared-lib-v2/lib/textToSpeech/SpeakableText';

const Content = dynamic(() => import('@Content'), {
  ssr: false,
});

const SearchPage = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const [submitText, setSubmitText] = React.useState('');
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const queryParam = searchParams?.get('q') || '';
    setSearchValue(queryParam);
    setSubmitText(queryParam);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const onSearch = useCallback((value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', value);
    window.history.replaceState({}, '', url.toString());
    setSubmitText(value);
  }, []);

  const contentApp = useMemo(
    () => (
      <Content
        filters={{
          query: submitText,
        }}
        isShowLayout={false}
        showFilter={false}
        showSearch={false}
        showHelpDesk={false}
        _config={{
          contentBaseUrl: '/pos',
          _tabs: { variant: 'fullWidth' },
          _card: {
            isHideProgressStatus: true,
            isWrap: true,
            _cardMedia: { sx: { height: '153px' } },
          },
          default_img: '/images/image_ver.png',
        }}
      />
    ),
    [submitText]
  );

  return (
    <Layout _topAppBar={{ _config: {} }}>
      <Box sx={{ bgcolor: '#F1F2F2', p: 7, textAlign: 'center' }}>
        <Typography
          variant="body6"
          sx={{
            mb: 2,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          <SpeakableText>
            Search Subjects, Courses, Guides and Much More..
          </SpeakableText>
        </Typography>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: { md: '40%', xs: '100%' } }}>
            <SearchButton
              searchValue={searchValue}
              onSearch={onSearch}
              handleSearch={handleSearch}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 4 }}>{contentApp}</Box>
    </Layout>
  );
};

export default SearchPage;
