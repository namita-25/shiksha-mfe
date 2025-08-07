import Link from 'next/link';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Container,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import SpeakableText from '@shared-lib-v2/lib/textToSpeech/SpeakableText';
import { useColorInversion } from '../../context/ColorInversionContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation('footer');
  const { isColorInverted } = useColorInversion();

  const usefulLinks = [
    {
      label: t('Pratham'),
      href: 'https://www.pratham.org/',
    },
    {
      label: t('Our Interns'),
      href: 'https://prathamopenschool.org/Team/Interns',
    },
    {
      label: t('PraDigi Creativity Club'),
      href: 'https://www.pradigi.org/creative-club/',
    },
    {
      label: t('Community Projects'),
      href: 'https://prathamopenschool.org/CommunityProjects/Contents/Pradigicp',
    },
    {
      label: t('Covid-19 Resources'),
      href: 'https://prathamopenschool.org/Covid19Resources',
    },
    {
      label: t('Mohalla Learning Camp'),
      href: 'https://prathamopenschool.org/MohallaLearningCamp/Contents/mohallalc',
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#F3F3F3',
        color: 'primary.contrastText',
        py: 4,
        px: '56px',
        '@media (max-width: 600px)': {
          px: '16px',
        },
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} md={6} lg={6}>
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Link href="/" passHref legacyBehavior>
                <Image
                  src={
                    isColorInverted
                      ? '/images/pradigi-white.png'
                      : '/images/pradigi.png'
                  }
                  alt="Pratham"
                  width={97}
                  height={32}
                  style={{ height: '32px' }}
                />
              </Link>
            </Grid>
            <Grid item>
              <Typography
                variant="body1"
                sx={{ fontWeight: 400, color: '#1F1B13' }}
              >
                <SpeakableText>
                  {t(`
  Over the past 30 years, Pratham Education Foundation has worked across India on diverse educational initiatives. 
  The Pratham-Shah PraDigi Innovation Centre, also known as PraDigi Centre (India), was established to develop an open learning model designed to foster lifelong learning and equip children and youth with essential skills for school, life, and work. The centre aims to leverage technology to transform educational experiences and to create engaging, supportive, contextual, and relevant learning environments.
`)}
                </SpeakableText>
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Typography
                variant="h1"
                component="h3"
                sx={{ fontWeight: 600, color: '#1F1B13' }}
              >
                <SpeakableText>{t('Useful Links')}</SpeakableText>
              </Typography>
            </Grid>
            <Grid item>
              <Grid container direction="column" spacing={1}>
                {usefulLinks.map(({ label, href }) => (
                  <Grid item key={href}>
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 400,
                          color: '#1F1B13',
                          cursor: 'pointer',
                        }}
                      >
                        {label}
                      </Typography>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Typography
                variant="h1"
                component="h3"
                sx={{
                  fontWeight: 600,
                  color: '#1F1B13',
                }}
              >
                <SpeakableText>{t('Follow Us')}</SpeakableText>
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <IconButton
                    aria-label="Facebook"
                    component={Link}
                    href="https://www.facebook.com/PrathamEducationFoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: '#3b5998' }}
                  >
                    <Facebook />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    aria-label="Twitter"
                    component={Link}
                    href="https://x.com/Pratham_India"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: '#1DA1F2' }}
                  >
                    <Twitter />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    aria-label="Instagram"
                    component={Link}
                    href="https://www.instagram.com/prathameducation?igsh=MWM3aXJoeTZoYzNxNg%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: '#E4405F' }}
                  >
                    <Instagram />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    aria-label="LinkedIn"
                    component={Link}
                    href="https://www.linkedin.com/company/pratham/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: '#0077B5' }}
                  >
                    <LinkedIn />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    aria-label="YouTube"
                    component={Link}
                    href="https://www.youtube.com/@PrathamEducationFoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: '#FF0000' }}
                  >
                    <YouTube />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Divider />
      </Box>
      <Grid container justifyContent="center" sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#7C766F', fontWeight: 500 }}
            >
              <SpeakableText>
                {t(
                  'All resources on the website are licensed under a CC BY-NC-ND 4.0 International License © Pratham Open School | Terms and Conditions'
                )}
              </SpeakableText>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
