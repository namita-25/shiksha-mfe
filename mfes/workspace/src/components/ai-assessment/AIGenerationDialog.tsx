import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Fade,
  Button,
  CircularProgress,
} from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { useRouter } from 'next/router';
import Image from 'next/image';
const poppinsFont = {
  fontFamily: 'Poppins',
};

interface AIGenerationDialogProps {
  open: boolean;
  state: 'loader' | 'success' | 'failed' | 'processing';
  aiStatus?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  onGoToEditor?: () => void;
}

const AIGenerationDialog: React.FC<AIGenerationDialogProps> = ({
  open,
  state,
  aiStatus = null,
  onRetry,
  onClose,
  onGoToEditor,
}) => {
  const router = useRouter();
  // Helper for close button in failed state
  const handleFailedClose = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Footer button handler
  const handleGoBackToWorkspace = () => {
    router.push('/');
  };

  // Timer state for loader
  const [timer, setTimer] = useState(60);
  useEffect(() => {
    if (state === 'loader' && open) {
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev > 0) return prev - 1;
          return 0;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state, open]);

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: '#fff',
          boxShadow: '0px 8px 32px rgba(31, 27, 19, 0.12)',
          p: 0,
          minWidth: 310,
          maxWidth: 600,
        },
      }}
      transitionDuration={400}
      TransitionComponent={Fade}
      hideBackdrop={false}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: { xs: 3, sm: 4 },
          width: { xs: 320, sm: 536 },
        }}
      >
        {/* Processing State */}
        {state === 'processing' && (
          <>
            <Box sx={{ mb: 2 }}>
              <PendingOutlinedIcon sx={{ fontSize: 40, color: '#B1AAA2' }} />
            </Box>
            <Typography
              sx={{
                ...poppinsFont,
                fontWeight: 400,
                fontSize: 22,
                color: '#1F1B13',
                mb: 2,
                textAlign: 'center',
              }}
            >
              Taking longer than expected..
            </Typography>
            <Typography
              sx={{
                ...poppinsFont,
                fontWeight: 400,
                fontSize: 16,
                color: '#635E57',
                mb: 2,
                textAlign: 'center',
                maxWidth: 400,
                lineHeight: 1.5,
              }}
            >
              You can continue to wait here or check back later
            </Typography>
            <CircularProgress sx={{ mb: 4, color: '#635E57' }} />
          </>
        )}
        {/* Loader State */}
        {state === 'loader' && (
          <>
            <Box sx={{ mb: 3 }}>
              <Image
                src="/mfe_workspace/logo.png"
                alt="Logo"
                height={64}
                width={69}
                loading="lazy"
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  ...poppinsFont,
                  fontWeight: 400,
                  fontSize: 22,
                  color: '#1F1B13',
                  mb: 3,
                }}
              >
                Generating your questions in
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                <Box sx={{ position: 'relative' }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={120}
                    thickness={4}
                    sx={{ color: '#987100' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={((60 - timer) / 60) * 100}
                    size={120}
                    thickness={4}
                    sx={{
                      color: '#DED8E1',
                      position: 'absolute',
                      left: 0,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <Typography
                      sx={{
                        ...poppinsFont,
                        fontWeight: 400,
                        fontSize: 32,
                        color: '#1F1B13',
                        textAlign: 'center',
                      }}
                    >
                      {timer}
                    </Typography>
                    <Typography
                      sx={{
                        ...poppinsFont,
                        fontWeight: 400,
                        fontSize: 32,
                        color: '#B1AAA2',
                        textAlign: 'center',
                      }}
                    >
                      s
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            {/* <Typography
              sx={{
                ...poppinsFont,
                fontWeight: 400,
                fontSize: 16,
                color: '#1976d2',
                mb: 1,
              }}
            >
              {`AI Status: ${aiStatus ?? 'Loading... '}`}
            </Typography> */}

            <Typography
              sx={{
                ...poppinsFont,
                fontWeight: 400,
                fontSize: 16,
                color: '#1F1B13',
                opacity: 0.8,
                letterSpacing: '3.1%',
                textAlign: 'center',
                mb: 3,
              }}
            >
              Sit tight while we create a tailored set of questions based on
              your content.
            </Typography>
            <Typography
              sx={{
                ...poppinsFont,
                fontWeight: 400,
                fontSize: 15,
                color: '#7C766F',
                textAlign: 'center',
                mb: 2,
              }}
            >
              You can continue to wait here or check back later in the list view
            </Typography>
          </>
        )}
        {/* Success State */}
        {state === 'success' && (
          <>
            <Box sx={{ mb: 3 }}>
              <CheckCircleOutlineOutlinedIcon
                sx={{ fontSize: 40, color: '#019722' }}
              />
            </Box>
            <Typography
              sx={{
                ...poppinsFont,
                fontWeight: 400,
                fontSize: 22,
                color: '#1F1B13',
                textAlign: 'center',
                mb: 2,
              }}
            >
              Questions generated successfully!
            </Typography>
            <Typography
              sx={{
                ...poppinsFont,
                fontWeight: 400,
                fontSize: 16,
                color: '#635E57',
                mb: 4,
                textAlign: 'center',
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              You can head to the editor and review the questions.
            </Typography>
          </>
        )}
        {/* Failed/Retry State */}
        {state === 'failed' && (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                gap: 2,
              }}
            >
              <ReportProblemOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: '#BA1A1A',
                }}
              />
              <Typography
                sx={{
                  ...poppinsFont,
                  fontWeight: 600,
                  fontSize: 24,
                  color: '#1F1B13',
                  textAlign: 'center',
                }}
              >
                Something Went Wrong
              </Typography>
              <Typography
                sx={{
                  ...poppinsFont,
                  fontWeight: 400,
                  fontSize: 16,
                  color: '#635E57',
                  mb: 1,
                  textAlign: 'center',
                  maxWidth: 600,
                  lineHeight: 1.5,
                }}
              >
                We couldn&apos;t generate the questions due to a technical
                issue. Please try again or restart after some time
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  width: '100%',
                  borderTop: '1px solid #D0C5B4',
                  pt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: '100px',
                    py: 1.5,
                    borderColor: '#635E57',
                    color: '#1E1B16',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#1F1B13',
                      color: '#1F1B13',
                    },
                  }}
                  onClick={handleGoBackToWorkspace}
                >
                  Go Back to Workspace
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#FDBE16',
                    color: '#1E1B16',
                    borderRadius: '100px',
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: '#E5AB14',
                    },
                  }}
                  onClick={onRetry}
                >
                  Try Again
                </Button>
              </Box>
            </Box>
          </>
        )}
        {/* Sub-message and Footer Button for all states */}
        {state !== 'failed' && (
          <Box
            sx={{
              width: '100%',
              borderTop: '1px solid #D0C5B4',
              pt: 4,
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={
                state === 'success' ? onGoToEditor : handleGoBackToWorkspace
              }
            >
              {state === 'success' ? 'Go to Editor' : 'Go Back to Workspace'}
            </Button>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default AIGenerationDialog;
