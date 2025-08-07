import { Box, Button, Divider, Grid, Modal, Typography } from '@mui/material';

import { modalStyles } from '@/styles/modalStyles';
import { toPascalCase, translateString } from '@/utils/Helper';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

// CSS variables
const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
};

const titleStyles = (theme: any) => ({
  lineHeight: '0.15px',
  fontSize: '16px',
  fontWeight: '500',
  color: theme.palette.warning.A200,
  m: 0,
});

const dividerStyles = (theme: any) => ({
  backgroundColor: theme.palette.warning.A100,
});

const contentBoxStyles = {
  padding: '25px 20px',
};

const fieldContainerStyles = {
  border: '1px solid #D0C5B4',
  borderRadius: '16px',
  padding: 2,
};

const fieldTitleStyles = (theme: any) => ({
  margin: 0,
  lineHeight: '16px',
  fontSize: '12px',
  fontWeight: '600',
  color: theme.palette.warning['500'],
});

const fieldValueStyles = (theme: any) => ({
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '24px',
  margin: 0,
  color: theme.palette.warning.A200,
  wordBreak: 'break-word',
  whiteSpace: 'normal',
});

const buttonContainerStyles = {
  padding: '20px',
  display: 'flex',
  gap: '20px',
  justifyContent: 'flex-end',
};

const closeButtonStyles = (theme: any) => ({
  border: `1px solid ${theme.components.MuiButton.styleOverrides.root.border}`,
  width: '100px',
  borderRadius: '100px',
  boxShadow: 'none',
  fontSize: '14px',
  fontWeight: 500,
  color: theme.components.MuiButton.styleOverrides.root.color,
});

const profileButtonStyles = (theme: any) => ({
  borderColor: theme.palette.warning.A400,
  width: '164px',
  borderRadius: '100px',
  boxShadow: 'none',
  fontSize: '14px',
  fontWeight: 500,
  color: theme.components.MuiButton.styleOverrides.root.color,
});

const LearnerModal = ({
  userId,
  open,
  onClose,
  data,
  userName,
  contactNumber,
  enrollmentNumber,
  gender,
  email,
}: {
  userId?: string;
  open: boolean;
  data: any;
  onClose: () => void;
  userName?: string;
  contactNumber?: any;
  enrollmentNumber?: any;
  gender?: any;
  email?: any;
}) => {
  const { t } = useTranslation();

  const theme = useTheme<any>();
  const router = useRouter();

  const handleLearnerFullProfile = () => {
    router.push(`/learner/${userId}`);
  };

  const learnerDetailsByOrder = [
    {
      label: t('PROFILE.FULL_NAME'),
      value: userName ? toPascalCase(userName) : '-',
    },
    {
      label: t('PROFILE.CONTACT_NUMBER'),
      value: contactNumber || '-',
    },
    {
      label: t('PROFILE.ENROLLMENT_NUMBER'),
      value: enrollmentNumber || '-',
    },

    {
      label: 'Gender',
      value: toPascalCase(gender) || '-',
    },
    {
      label: 'Email',
      value: email || '-',
    },
    ...data.map((field: any) => ({
      label: field.label
        ? t(`FORM.${field.label.toUpperCase()}`, field.label)
        : field.label,
      value: Array.isArray(field.selectedValues)
        ? toPascalCase(
            field.selectedValues.map((item: any) => item.value).join(', ')
          )
        : field.selectedValues || '-',
    })),
  ];

  return (
    <>
      {data && (
        <Modal open={open} onClose={onClose}>
          <Box sx={modalStyles(theme)}>
            <Box sx={headerStyles}>
              <Typography sx={titleStyles(theme)}>
                {t('PROFILE.LEARNER_DETAILS')}
              </Typography>
              <CloseSharpIcon
                sx={{ cursor: 'pointer' }}
                onClick={onClose}
                aria-label="Close"
              />
            </Box>
            <Box>
              <Divider sx={dividerStyles(theme)} />
              <Box sx={contentBoxStyles}>
                <Box sx={fieldContainerStyles}>
                  <Grid container spacing={2}>
                    {learnerDetailsByOrder.map((item: any, index: number) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Typography sx={fieldTitleStyles(theme)}>
                          {item.label}
                        </Typography>
                        <Typography sx={fieldValueStyles(theme)}>
                          {item.value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
              <Divider sx={dividerStyles(theme)} />
            </Box>
            <Box sx={buttonContainerStyles}>
              <Button
                sx={closeButtonStyles(theme)}
                style={{ width: 'fit-content', padding: '5px 16px' }}
                onClick={onClose}
                variant="outlined"
              >
                {t('COMMON.CLOSE')}
              </Button>
              <Button
                sx={profileButtonStyles(theme)}
                style={{ width: 'fit-content', padding: '5px 16px' }}
                variant="contained"
                onClick={handleLearnerFullProfile}
                fullWidth
              >
                {t('PROFILE.VIEW_FULL_PROFILE')}
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
};

LearnerModal.propTypes = {
  userId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LearnerModal;
