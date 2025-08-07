'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SpeakableText from '@shared-lib-v2/lib/textToSpeech/SpeakableText';
import { useColorInversion } from '../context/ColorInversionContext';
import { useGlobalData } from './Provider/GlobalProvider';
import { transformRenderForm } from '@shared-lib-v2/lib/Filter/FilterForm';
import { useRouter } from 'next/navigation';

interface Subject {
  name: string;
  code: string;
  identifier: string;
  description: string;
  status: string;
  category: string;
  index: number;
}

interface SubDomain {
  name: string;
  description?: string;
  code: string;
  identifier: string;
  status: string;
  category: string;
  index: number;
}

interface SubDomainOption {
  code: string;
  name: string;
  identifier: string;
  associations: {
    subject: Subject[];
  };
}

interface DomainOption {
  code: string;
  name: string;
  identifier: string;
  associations: {
    subDomain?: SubDomain[];
  };
}

interface Category {
  name: string;
  code: string;
  old_code: string;
  options: DomainOption[] | SubDomainOption[];
  index: number;
}

const Learning = ({
  descriptions,
  aboutDescriptionStyle = false,
}: {
  descriptions: any;
  aboutDescriptionStyle?: boolean;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const { isColorInverted } = useColorInversion();
  const [domainData, setDomainData] = useState<any[]>([]);
  const router = useRouter();

  const mediaMD = useMediaQuery('(max-width: 900px)');

  const {
    globalData: { filterFramework },
  } = useGlobalData();

  useEffect(() => {
    const categories = filterFramework?.framework?.categories ?? [];
    const transformedCategories = transformRenderForm(categories);

    console.log(transformedCategories, 'transformedCategories');

    // Find the Domain and SubDomain categories
    const domainCategory = transformedCategories.find(
      (cat: Category) => cat.name === 'Domain'
    );
    const subDomainCategory = transformedCategories.find(
      (cat: Category) => cat.name === 'Sub Domain'
    );

    if (!domainCategory || !subDomainCategory) return;

    // Map the learning domains to their subdomains with subjects
    const mappedData = domainCategory.options.map((option: DomainOption) => {
      const subDomains = option.associations.subDomain || [];
      return subDomains.map((subDomain: SubDomain) => {
        // Find matching subdomain in subDomainCategory to get associated subjects
        const subDomainDetails = (
          subDomainCategory.options as SubDomainOption[]
        ).find((opt) => opt.name === subDomain.name);

        // Get subject names as a comma-separated string
        const subjectNames = subDomainDetails?.associations.subject
          .map((subject) => subject.name)
          .join(', ');

        return {
          title: subDomain.name,
          desc: subjectNames || subDomain.name,
        };
      });
    });

    setDomainData(mappedData);
  }, [filterFramework]);

  return (
    <Grid container spacing={4}>
      {['School', 'Work', 'Life'].map((pillar, index) => (
        <Grid
          item
          xs={12}
          md={4}
          key={pillar}
          sx={{ position: 'relative', minHeight: 350 }}
        >
          <Box
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            sx={{
              height: '100%',
              marginTop: '20px',
              position: 'relative',
              '@media (min-width: 900px)': {
                display: hovered === index ? '' : '',
              },
            }}
          >
            {/* Default Card Content */}
            <Box
              data-no-invert={isColorInverted}
              sx={{
                background: `url(/images/pillar-${
                  index + 1
                }.png) no-repeat center center`,
                backgroundSize: 'cover',
                height: '273px',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                transition: 'all 0.3s',
              }}
            >
              <Typography
                variant={mediaMD ? 'body5' : 'body4'}
                component="h1"
                sx={{
                  mt: 2,
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  letterSpacing: '0px',
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                <SpeakableText>Learning for</SpeakableText>
              </Typography>
              <Typography
                variant={mediaMD ? 'body9' : 'body7'}
                component="h1"
                sx={{
                  mt: 1,
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                  letterSpacing: '0px',
                  textAlign: 'center',
                  color: '#FDBE16',
                }}
              >
                <SpeakableText>{pillar}</SpeakableText>
              </Typography>
            </Box>

            {/* Hover Card Overlay */}
            {hovered === index && domainData[index] && (
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  bottom: 50,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                  borderRadius: '12px',
                  zIndex: 10,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  '@media (max-width: 900px)': {
                    display: 'none',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    color: '#7C766F',
                    mb: 2,
                    letterSpacing: '1px',
                  }}
                >
                  <SpeakableText>KEY THEMES</SpeakableText>
                </Typography>
                {domainData[index]?.map((theme: any) => (
                  <Box key={theme.title} sx={{ mb: 1 }}>
                    <Typography
                      variant="body5"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 500,
                        lineHeight: '24px',
                        letterSpacing: '0.15px',
                        color: '#F17B06',
                      }}
                    >
                      <SpeakableText>{theme.title}</SpeakableText>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 400,
                        lineHeight: '20px',
                        letterSpacing: '0.25px',
                        color: '#635E57',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      <SpeakableText>{theme.desc}</SpeakableText>
                    </Typography>
                  </Box>
                ))}
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => router.push(`/pos/${pillar.toLowerCase()}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Typography
                    variant="body5"
                    sx={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      lineHeight: '24px',
                      letterSpacing: '0.15px',
                      color: '#0D599E',
                      cursor: 'pointer',
                    }}
                  >
                    <SpeakableText cursor={true}>View All</SpeakableText>
                  </Typography>
                  <ArrowForwardIcon
                    sx={{
                      fontSize: '25px',
                      color: '#0D599E',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Description below the card */}
            {aboutDescriptionStyle ? (
              <Box sx={{ mt: '20px', textAlign: 'left' }}>
                {Array.isArray(descriptions[index]) ? (
                  <>
                    {/* First line - normal text */}
                    <Typography
                      variant="body1"
                      component="h1"
                      sx={{
                        fontWeight: 400,
                        color: '#7C766F',
                        fontFamily: 'Poppins',
                        mb: '8px',
                      }}
                    >
                      <SpeakableText>
                        {typeof descriptions[index][0] === 'object'
                          ? descriptions[index][0].cardDesc
                          : descriptions[index][0]}
                      </SpeakableText>
                    </Typography>
                    {/* All three description lines with their headings */}
                    {descriptions[index]
                      .slice(1)
                      .map((desc: string, i: number) => (
                        <Box key={i}>
                          {/* Heading for each description */}
                          <Typography
                            variant="body1"
                            component="h1"
                            sx={{
                              fontWeight: 600,
                              color: '#1F1B13',
                              fontFamily: 'Poppins',
                              mb: '2px',
                              mt: i > 0 ? '16px' : '0',
                            }}
                          >
                            <SpeakableText>Heading</SpeakableText>
                          </Typography>
                          {/* Description text */}
                          <Typography
                            variant="body1"
                            component="h1"
                            sx={{
                              fontWeight: 400,
                              color: '#7C766F',
                              fontFamily: 'Poppins',
                            }}
                          >
                            <SpeakableText>{desc}</SpeakableText>
                          </Typography>
                        </Box>
                      ))}
                  </>
                ) : (
                  <Typography
                    variant="body1"
                    component="h1"
                    sx={{
                      fontWeight: 400,
                      color: '#7C766F',
                      fontFamily: 'Poppins',
                    }}
                  >
                    <SpeakableText>{descriptions[index]}</SpeakableText>
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography
                variant={mediaMD ? 'h5' : 'body1'}
                component="h1"
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  lineHeight: '24px',
                  letterSpacing: '0.5px',
                  color: '#7C766F',
                  marginTop: '20px',
                }}
              >
                <SpeakableText>{descriptions[index]}</SpeakableText>
              </Typography>
            )}

            {/* mobile accordion */}
            <Box
              sx={{
                '@media (min-width: 900px)': {
                  display: 'none',
                },
                boxShadow: '0px 3.89px 7.78px 2.92px #00000026',
                borderRadius: '12px',
                mt: 2,
                backgroundColor: '#fff',
              }}
            >
              <Accordion
                sx={{
                  boxShadow: 'none',
                  bgcolor: 'transparent',
                  borderRadius: '8px',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<KeyboardArrowDownIcon />}
                  aria-controls="key-themes-content"
                  id="key-themes-header"
                  sx={{
                    minHeight: 48,
                    borderRadius: '8px',
                    px: 2.5,
                    py: 1.5,
                    bgcolor: '#fff',
                  }}
                >
                  <Typography
                    variant="body1"
                    component="h1"
                    sx={{
                      fontWeight: 600,
                      color: '#7C766F',
                    }}
                  >
                    <SpeakableText>KEY THEMES</SpeakableText>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
                  {domainData[index]?.map((theme: any) => (
                    <Box key={theme.title} sx={{ mb: 2 }}>
                      <Typography
                        variant="body1"
                        component="h1"
                        sx={{
                          fontFamily: 'Poppins',
                          fontWeight: 600,
                          color: '#F17B06',
                          mb: 0.2,
                        }}
                      >
                        <SpeakableText>{theme.title}</SpeakableText>
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'Poppins',
                          fontWeight: 400,
                          color: '#7C766F',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        <SpeakableText>{theme.desc}</SpeakableText>
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mt: 1,
                    }}
                    onClick={() => router.push(`/pos/${pillar.toLowerCase()}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Typography
                      variant="body1"
                      component="h1"
                      sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 500,
                        color: '#0D599E',
                        mr: 1,
                      }}
                    >
                      <SpeakableText>View All</SpeakableText>
                    </Typography>
                    <ArrowForwardIcon
                      sx={{ fontSize: '20px', color: '#0D599E' }}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default Learning;
