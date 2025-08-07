'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import {
  LayoutProps,
  Layout,
  useTranslation,
  DrawerItemProp,
  transformRenderForm,
} from '@shared-lib';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Popper,
  Paper,
  Grow,
  MenuList,
  Select,
} from '@mui/material';
import { Footer } from './Footer';
import { getDeviceIdUUID } from '@shared-lib-v2/DynamicForm/utils/Helper';
import { validate as uuidValidate } from 'uuid';
import { useGlobalData } from '../Provider/GlobalProvider';
import AccessibilityOptions from '../AccessibilityOptions/AccessibilityOptions';
import { useColorInversion } from '../../context/ColorInversionContext';
import { SearchButton } from './SearchButton';
import { logEvent } from '@learner/utils/googleAnalytics';

interface SubMenuItem {
  title: string | React.ReactNode;
  to: () => void;
  isActive: boolean;
  code?: string;
}

interface BaseDrawerItemProp {
  title: React.ReactNode;
  icon?: React.ReactNode;
  to?: ((event: React.MouseEvent<HTMLAnchorElement>) => void) | (() => void);
  variant?: 'contained' | 'text';
  isActive?: boolean;
  customStyle?: React.CSSProperties;
  child?: SubMenuItem[];
}

type NewDrawerItemProp = BaseDrawerItemProp;

interface AppBarProps {
  title?: string;
  showBackIcon?: boolean;
  backIconClick?: () => void;
  navLinks?: NewDrawerItemProp[];
  rightComponent?: React.ReactNode;
  isShowLang?: boolean;
  onLanguageChange?: (lang: string) => void;
  _navLinkBox?: React.CSSProperties;
  _brand?: any;
  _topAppBar?: any;
}

const NavButton: React.FC<{
  link: NewDrawerItemProp;
  index: number;
}> = ({ link, index }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (link.child) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const handleClick = () => {
    if (typeof link.to === 'function') {
      link.to({} as any);
    }
    setAnchorEl(null);
  };

  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Button
        key={index}
        variant={
          link.variant ??
          (link.isActive ? 'top-bar-link-button' : 'top-bar-link-text')
        }
        startIcon={link?.icon}
        onClick={handleClick}
        sx={{
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        {link.title}
      </Button>
      {link.child && (
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          transition
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
                <MenuList>
                  {link?.child?.map((childItem, childIndex) => (
                    <MenuItem
                      key={childIndex}
                      onClick={() => {
                        childItem.to();
                        setAnchorEl(null);
                      }}
                    >
                      {childItem.title}
                    </MenuItem>
                  ))}
                </MenuList>
              </Paper>
            </Grow>
          )}
        </Popper>
      )}
    </Box>
  );
};

const LanguageSelect = ({
  onLanguageChange,
}: {
  onLanguageChange?: (lang: string) => void;
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  React.useEffect(() => {
    const storedLanguage = localStorage.getItem('lang');
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  const handleChange = (event: any) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    } else {
      localStorage.setItem('lang', newLanguage);
    }
  };

  return (
    <Select
      value={selectedLanguage}
      size="small"
      onChange={handleChange}
      sx={{
        minWidth: 80,
        height: 40,
      }}
    >
      <MenuItem value="en">EN</MenuItem>
      <MenuItem value="hi">HI</MenuItem>
    </Select>
  );
};

const App: React.FC<LayoutProps> = ({ children, ...props }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isColorInverted } = useColorInversion();
  const [defaultNavLinks, setDefaultNavLinks] = useState<NewDrawerItemProp[]>(
    []
  );
  const {
    globalData: { filterFramework },
  } = useGlobalData();

  React.useEffect(() => {
    const init = async () => {
      const did = localStorage.getItem('did');
      if (!did || !(did && uuidValidate(did))) {
        const visitorId = await getDeviceIdUUID();
        localStorage.setItem(
          'did',
          typeof visitorId === 'string' ? visitorId : ''
        );
        console.log('Device fingerprint generated successfully', visitorId);
      }
    };
    init();
    let currentPage = '';
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const activeLink = searchParams.get('activeLink');
      currentPage = activeLink
        ? activeLink
        : window.location.pathname
        ? window.location.pathname
        : '';
    }

    const categories = filterFramework?.framework?.categories ?? [];
    const transformedCategories = transformRenderForm(categories);
    const option = transformedCategories?.find(
      (item) => item.code === 'se_domains'
    )?.options;

    const schoolSubCategory =
      option?.find((category: any) => category.code === 'learningForSchool')
        ?.associations?.subDomain ?? [];
    const workSubCategory =
      option?.find((category: any) => category.code === 'learningForWork')
        ?.associations?.subDomain ?? [];
    const lifeSubCategory =
      option?.find((category: any) => category.code === 'learningForLife')
        ?.associations?.subDomain ?? [];
    const navLinks: NewDrawerItemProp[] = [
      {
        title: t('LEARNER_APP.POS.ABOUT_US'),
        to: () => router.push('/pos/about-us'),
        isActive: currentPage === '/pos/about-us',
      },
      {
        title: t('LEARNER_APP.POS.SCHOOL'),
        to: () => router.push('/pos/school'),
        isActive: currentPage === '/pos/school',
        child: schoolSubCategory.map((item: any) => ({
          title: item?.name,
          to: () => router.push(`/pos/school?se_subDomains=${item?.code}`),
          isActive: currentPage === `/pos/school?se_subDomains=${item?.code}`,
          code: item?.code,
        })),
      },
      {
        title: t('LEARNER_APP.POS.WORK'),
        to: () => router.push('/pos/work'),
        isActive: currentPage === '/pos/work',
        child: workSubCategory.map((item: any) => ({
          title: item?.name,
          to: () => router.push(`/pos/work?se_subDomains=${item?.code}`),
          isActive: currentPage === `/pos/work?se_subDomains=${item?.code}`,
          code: item?.code,
        })),
      },
      {
        title: t('LEARNER_APP.POS.LIFE'),
        to: () => router.push('/pos/life'),
        isActive: currentPage === '/pos/life',
        child: lifeSubCategory.map((item: any) => ({
          title: item?.name,
          to: () => router.push(`/pos/life?se_subDomains=${item?.code}`),
          isActive: currentPage === `/pos/life?se_subDomains=${item?.code}`,
          code: item?.code,
        })),
      },
      {
        title: t('LEARNER_APP.POS.PROGRAM'),
        isActive: currentPage === '/pos/program',
        child: [
          { code: 'Vocational Training', name: 'YouthNet' },
          { name: 'Second Chance Program', code: 'SCP' },
        ].map((item: any) => ({
          title: item?.name,
          to: () => router.push(`/pos/program?program=${item?.code}`),
          isActive: currentPage === `/pos/program?program=${item?.code}`,
          code: item?.code,
        })),
      },
      {
        title: t('LEARNER_APP.POS.THEMATIC_REPOSITORY'),
        to: () => {
          const domain = process.env.NEXT_PUBLIC_THEMATIC_DOMAIN || '';
          window.open(`${domain}`, '_blank');
        },
        isActive: currentPage === '/themantic',
      },
    ];
    setDefaultNavLinks(navLinks);
  }, [t, filterFramework?.framework?.categories, router]);

  return (
    <Layout
      {...props}
      onlyHideElements={['footer']}
      _topAppBar={{
        _config: {
          middleComponent: (
            <SearchButton
              onSearch={(search) =>
                {
                        if (typeof window !== 'undefined') {     

                       const windowUrl = window.location.pathname;
                                   const cleanedUrl = windowUrl
                  
                                  logEvent({
                                    action: 'Searched on about page by ' + search,
                                    category: cleanedUrl,
                                    label: 'Searched on about page',
                                  });
                                }
                  router.push('/pos/search?q=' + search)
                }
                }
              isHideSubmitButton
              _box={{
                sx: {
                  maxWidth: '260px',
                  height: '48px',
                  '@media (max-width: 1200px)': {
                    display: 'none',
                  },
                },
              }}
            />
          ),
        },
        isShowLang: false,
        isColorInverted: isColorInverted,
        _brand: {
          _box: {
            brandlogo: <Brand />,
            onClick: () => router.push('/pos'),
          },
        },
        navLinks: defaultNavLinks,
        _navLinkBox: { gap: '12px', cursor: 'pointer' },
        ...props?._topAppBar,
      }}
    >
      <Box>
        <AccessibilityOptions />

        {children}
      </Box>
      <Footer />
    </Layout>
  );
};
export default App;

const Brand = () => {
  const router = useRouter();
  const { isColorInverted } = useColorInversion();

  return (
    <Box
      display="flex"
      gap={1}
      onClick={() => router.push('/pos')}
      sx={{ cursor: 'pointer' }}
    >
      <Image
        src={
          isColorInverted
            ? '/images/PrathamLogowhite.png'
            : '/images/appLogo.svg'
        }
        alt="Pratham"
        width={146}
        height={32}
      />
      <Image
        src={
          isColorInverted ? '/images/pradigi-white.png' : '/images/pradigi.png'
        }
        alt="Pradigi"
        width={94}
        height={32}
        style={{ height: '32px' }}
      />
    </Box>
  );
};

const DesktopBar: React.FC<AppBarProps> = ({
  navLinks = [],
  rightComponent,
  isShowLang = true,
  onLanguageChange,
  _navLinkBox,
  _brand,
}) => {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Brand {..._brand} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'center',
          ..._navLinkBox,
        }}
      >
        {navLinks.map((link: NewDrawerItemProp, index: number) => (
          <NavButton key={index} link={link} index={index} />
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {rightComponent}
          {isShowLang && <LanguageSelect onLanguageChange={onLanguageChange} />}
        </Box>
      </Box>
    </Box>
  );
};
