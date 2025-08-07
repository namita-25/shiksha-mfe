import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Role } from '@/utils/app.constant';

interface Subject {
  id: string;
  value: string;
  label: string;
}

interface ProfileDetailsProps {
  fullName: string;
  emailId: string;
  state?: string;
  district?: string;
  block?: string;
  designation?: string;
  joinedOn?: string | null;
  phoneNumber?: string;
  mentorId?: string;
  gender?: string;
  age?: number;
  dob?: string;
  village?: string | null;
  middleName?: string | null;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  subjectsITeach?: Subject[];
  myMainSubjects?: Subject[];
}

const Profile: React.FC<ProfileDetailsProps> = ({
  fullName,
  emailId,
  state,
  district,
  block,
  designation,
  joinedOn,
  phoneNumber,
  mentorId,
  gender,
  age,
  dob,
  village,
  userName,
  middleName,
  firstName,
  lastName,
  subjectsITeach = [],
  myMainSubjects = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();

  // Extract IDs of "MY_MAIN_SUBJECTS" for matching
  const mainSubjectIds = new Set(myMainSubjects.map((subject) => subject.id));

  return (
    <Card
      sx={{
        borderRadius: '16px',
        boxShadow: 0,
        border: `1px solid ${theme.palette.warning['A100']}`,
        mt: 2,
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={6}>
            <Typography
              color={theme.palette.warning['500']}
              sx={{ fontSize: '12px', fontWeight: 600, wordWrap: 'break-word' }}
            >
              {t('SCP_PROFILE.DESIGNATION')}
            </Typography>
            <Typography
              color={theme.palette.warning['A200']}
              sx={{ fontSize: '16px', fontWeight: 400, wordWrap: 'break-word' }}
            >
              {designation}
            </Typography>
          </Grid>

          <Grid item xs={12} md={12} lg={6}>
            <>
              <Typography
                color={theme.palette.warning['500']}
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  wordWrap: 'break-word',
                }}
              >
                {t('SCP_PROFILE.USERNAME')}
              </Typography>
              <Typography
                color={theme.palette.warning['A200']}
                sx={{
                  fontSize: '16px',
                  fontWeight: 400,
                  wordWrap: 'break-word',
                }}
                gutterBottom
              >
                {userName}
              </Typography>
            </>
          </Grid>

          <Grid item xs={12} md={12} lg={6}>
            <Typography
              color={theme.palette.warning['500']}
              sx={{ fontSize: '12px', fontWeight: 600, wordWrap: 'break-word' }}
            >
              {t('SCP_PROFILE.EMAIL_ID')}
            </Typography>
            <Typography
              color={theme.palette.warning['A200']}
              sx={{ fontSize: '16px', fontWeight: 400, wordWrap: 'break-word' }}
              gutterBottom
            >
              {emailId}
            </Typography>
          </Grid>

          {/* <Grid item xs={12} md={12} lg={6}>
            <Typography
              color={theme.palette.warning['500']}
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                mt: 2,
                wordWrap: 'break-word',
              }}
            >
              {t('SCP_PROFILE.JOINED_ON')}
            </Typography>
            <Typography
              color={theme.palette.warning['A200']}
              sx={{ fontSize: '16px', fontWeight: 400, wordWrap: 'break-word' }}
            >
              {joinedOn}
            </Typography>
          </Grid> */}

          <Grid item xs={12} md={12} lg={6}>
            <Typography
              color={theme.palette.warning['500']}
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                mt: 2,
                wordWrap: 'break-word',
              }}
            >
              {t('SCP_PROFILE.PHONE_NUMBER')}
            </Typography>
            <Typography
              color={theme.palette.warning['A200']}
              sx={{ fontSize: '16px', fontWeight: 400, wordWrap: 'break-word' }}
            >
              {phoneNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <Typography
              color={theme.palette.warning['500']}
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                mt: 2,
                wordWrap: 'break-word',
              }}
            >
              {t('SCP_PROFILE.GENDER')}
            </Typography>
            <Typography color={theme.palette.warning['A200']}>
              {gender}
            </Typography>
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <Typography
              color={theme.palette.warning['500']}
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                mt: 2,
                wordWrap: 'break-word',
              }}
            >
              {t('SCP_PROFILE.DOB')}
            </Typography>
            <Typography
              sx={{ fontSize: '16px', fontWeight: 400, wordWrap: 'break-word' }}
            >
              {dob}
            </Typography>
          </Grid>
        </Grid>

        {/* Subjects I Teach Section */}
        {designation !== Role.TEAM_LEADER ? (
          <Box mt={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: theme.palette.warning['500'],
              }}
            >
              {t('SCP_PROFILE.SUBJECTS_I_TEACH')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              '{' '}
              {subjectsITeach.map((subject) => {
                // const isHighlighted = mainSubjectIds.has(subject.id);
                return (
                  <Box
                    key={subject.id}
                    sx={{
                      backgroundColor: 'transparent',
                      color: 'black',
                      cursor: 'default !important',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0.1px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      border: '1px solid #DADADA',
                    }}
                  >
                    {t(`FORM.${subject.label}`, {
                      defaultValue: subject.label,
                    })}
                  </Box>
                );
              })}
              '
            </Box>
          </Box>
        ) : null}
        {/* My Main Subjects Section */}
        {designation !== Role.TEAM_LEADER ? (
          <Box mt={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: theme.palette.warning['500'],
              }}
            >
              {t('SCP_PROFILE.MY_MAIN_SUBJECTS')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {myMainSubjects.map((subject: any) => {
                // const isHighlighted = mainSubjectIds.has(subject.id);
                return (
                  <Box
                    key={subject.id}
                    sx={{
                      backgroundColor: 'transparent',
                      color: 'black',
                      cursor: 'default !important',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0.1px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      border: '1px solid #DADADA',
                    }}
                  >
                    {t(`FORM.${subject.label}`, {
                      defaultValue: subject.label,
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default Profile;
