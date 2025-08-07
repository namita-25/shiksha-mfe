import * as React from 'react';
import {
  Box,
  SwipeableDrawer,
  Button,
  Typography,
  IconButton,
  Stack,
  Divider,
  Paper,
  useMediaQuery,
  useTheme,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import MicIcon from '@mui/icons-material/Mic';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import LinkIcon from '@mui/icons-material/Link';
import AccessibleIcon from '@mui/icons-material/Accessible';
import { useFontSize } from '../../context/FontSizeContext';
import { useUnderlineLinks } from '../../context/UnderlineLinksContext';
import { useColorInversion } from '../../context/ColorInversionContext';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import { useSpeechContext } from '@shared-lib-v2/lib/context/SpeechContext';
import { logEvent } from '@learner/utils/googleAnalytics';

export default function AccessibilityOptions() {
  const [open, setOpen] = React.useState(false);
  const { increaseFontSize, decreaseFontSize, resetFontSize, fontSize } =
    useFontSize();
  const { isSpeechEnabled, toggleSpeechEnabled } = useSpeechContext();
  const { isUnderlineLinksEnabled, toggleUnderlineLinks } = useUnderlineLinks();
  const { isColorInverted, toggleColorInversion } = useColorInversion();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isIncreased, setIsIncreased] = React.useState(false);
  const [isDecreased, setIsDecreased] = React.useState(false);

  const defaultFontSize = 1; // Assuming 1 is the default fontSize value

  // Update CSS variable when fontSize changes
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      '--font-size-scale',
      fontSize.toString()
    );

    // Update button highlight states
    setIsIncreased(fontSize > defaultFontSize);
    setIsDecreased(fontSize < defaultFontSize);
  }, [fontSize]);

  const handleIncreaseFontSize = () => {
    increaseFontSize();
    setIsIncreased(true);
    setIsDecreased(false);
      if (typeof window !== 'undefined') {

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl

    logEvent({
      action: 'click-on-increase-font-size-accessibility-options',
      category: cleanedUrl ,
      label: 'Increase Font Size',
    });
  }
  };

  const handleDecreaseFontSize = () => {
    decreaseFontSize();
    setIsDecreased(true);
    setIsIncreased(false);
          if (typeof window !== 'undefined') {

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl

    logEvent({
      action: 'click-on-decrease-font-size-accessibility-options',
      category: cleanedUrl,
      label: 'Decrease Font Size',
    });
  }
  };

  const handleResetFontSize = () => {
    resetFontSize();
    setIsIncreased(false);
    setIsDecreased(false);

    // Clear speech setting from localStorage and disable it
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isSpeechEnabled');
      localStorage.removeItem('isUnderlineLinksEnabled');
      localStorage.removeItem('isColorInverted');
    }
    disableSpeechEnabled();

    // Disable underline links
    if (isUnderlineLinksEnabled) {
      toggleUnderlineLinks();
    }

    // Disable color inversion
    if (isColorInverted) {
      toggleColorInversion();
    }
          if (typeof window !== 'undefined') {

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl
    logEvent({
      action: 'click-on-reset-font-size-accessibility-options',
      category: cleanedUrl,
      label: 'Reset Font Size',
    });
  }
  };

  const disableSpeechEnabled = () => {
    if (isSpeechEnabled) {
      toggleSpeechEnabled();
    }
  };

  const toggleDrawer =
    (openState: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setOpen(openState);
    };

  return (
    <div>
      {isSpeechEnabled && (
        <Alert
          severity="warning"
          sx={{
            position: 'fixed',
            bottom: isMobile ? '60px' : '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1002,
            maxWidth: '90%',
            width: 'auto',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Navigation is disabled while Text-to-Speech is on. Turn off
          Text-to-Speech to enable navigation.
        </Alert>
      )}
      <IconButton
        onClick={toggleDrawer(true)}
        aria-label="Accessibility Options"
        data-no-invert
        sx={{
          bgcolor: isColorInverted ? '#1F1B13' : '#f5f3e7',
          borderRadius: 1,
          padding: 1,
          '&:hover': {
            bgcolor: isColorInverted ? '#2A2520' : '#ebe7d9',
          },
          position: 'absolute',
          right: 8,
          top: isMobile ? 100 : 150,
          zIndex: 1001,
          border: isColorInverted ? '1px solid #CDC5BD' : '1px solid #CDC5BD',
        }}
      >
        <AccessibleIcon
          sx={{
            color: isColorInverted ? '#fff' : '#000',
          }}
        />
      </IconButton>
      <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        disableSwipeToOpen={true}
        swipeAreaWidth={0}
        PaperProps={{
          sx: {
            height: 'auto',
            maxHeight: '95vh',
            marginTop: isMobile ? '100px' : '152px',
            borderRadius: '16px 0 0 16px',
            width: isMobile ? '90%' : '552px',
            maxWidth: '552px',
            zIndex: 99999,
          },
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
        }}
      >
        <Paper
          elevation={0}
          sx={{ width: 'auto', padding: isMobile ? 1.5 : 2, maxWidth: '600px' }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography sx={{ color: '#1F1B13', fontWeight: 500 }} variant="h2">
              Accessibility Options
            </Typography>

            <CloseIcon
              sx={{
                color: isColorInverted ? '#fff' : '#1C1B1F',
                cursor: 'pointer',
              }}
              onClick={toggleDrawer(false)}
              data-speech-control="true"
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <Button
                variant={isIncreased ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<TextIncreaseIcon sx={{ color: '#635E57' }} />}
                onClick={handleIncreaseFontSize}
                sx={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: isIncreased ? '#FDBE16' : '#f5f5f5',
                  '&:hover': {
                    bgcolor: isIncreased ? '#E6AC00' : '',
                  },
                  border: '1px solid #CDC5BD',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#1F1B13',
                    fontWeight: 500,
                  }}
                >
                  Increase Font Size
                </Typography>
              </Button>

              <Button
                variant={isDecreased ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<TextDecreaseIcon sx={{ color: '#635E57' }} />}
                onClick={handleDecreaseFontSize}
                sx={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: isDecreased ? '#FDBE16' : '#f5f5f5',
                  '&:hover': {
                    bgcolor: isDecreased ? '#E6AC00' : '',
                  },
                  border: '1px solid #CDC5BD',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#1F1B13',
                    fontWeight: 500,
                  }}
                >
                  Decrease Font Size
                </Typography>
              </Button>
            </Stack>

            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <Button
                variant={isSpeechEnabled ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<RecordVoiceOverIcon sx={{ color: '#635E57' }} />}
                onClick={() => {
                  if (!isSpeechEnabled && typeof window !== 'undefined') {
                    const windowUrl = window.location.pathname;
                    const cleanedUrl = windowUrl
              
                    logEvent({
                      action: 'text-to-speech-enable',
                      category: cleanedUrl ,
                      label: 'Text to Speech',
                    });
                  }
                  toggleSpeechEnabled();
                }}
                sx={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: isSpeechEnabled ? '#FDBE16' : '#f5f5f5',
                  '&:hover': {
                    bgcolor: isSpeechEnabled ? '#E6AC00' : '',
                  },
                  border: '1px solid #CDC5BD',
                }}
              >
                <Typography variant="subtitle1">Text to Speech</Typography>
              </Button>

              <Button
                variant={isColorInverted ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<InvertColorsIcon sx={{ color: '#635E57' }} />}
                  onClick={() => {
                  if (!isColorInverted && typeof window !== 'undefined') {
                    const windowUrl = window.location.pathname;
                    const cleanedUrl = windowUrl
                    
                    logEvent({
                      action: 'click-on-invert-colours-accessibility-options',
                      category: cleanedUrl ,
                      label: 'Invert Colours',
                    });
                  }
                  toggleColorInversion();
                }}
                sx={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: isColorInverted ? '#FDBE16' : '#f5f5f5',
                  '&:hover': {
                    bgcolor: isColorInverted ? '#E6AC00' : '',
                  },
                  border: '1px solid #CDC5BD',
                }}
              >
                <Typography variant="subtitle1">Invert Colours</Typography>
              </Button>
            </Stack>

            <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
              <Button
                variant={isUnderlineLinksEnabled ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<LinkIcon sx={{ color: '#635E57' }} />}
                 onClick={() => {
                  if (!isUnderlineLinksEnabled && typeof window !== 'undefined') {
                    const windowUrl = window.location.pathname;
                    const cleanedUrl = windowUrl
                  
                    logEvent({
                      action: 'click-on-underline-links-enable-accessibility-options',
                      category: cleanedUrl ,
                      label: 'Underline Links',
                    });
                  }
                  toggleUnderlineLinks();
                }}
                sx={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: isUnderlineLinksEnabled ? '#FDBE16' : '#f5f5f5',
                  '&:hover': {
                    bgcolor: isUnderlineLinksEnabled ? '#E6AC00' : '',
                  },
                  border: '1px solid #CDC5BD',
                }}
              >
                <Typography variant="subtitle1">Underline Links</Typography>
              </Button>
              <Box sx={{ flex: 1 }} />
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="text"
              color="primary"
              onClick={handleResetFontSize}
              sx={{
                color: '#0D599E',
                fontWeight: 500,
                fontSize: '14px',
                borderRadius: 2,
                padding: '6px 16px',
              }}
            >
              Clear Selection
            </Button>
          </Box>
        </Paper>
      </SwipeableDrawer>
    </div>
  );
}
