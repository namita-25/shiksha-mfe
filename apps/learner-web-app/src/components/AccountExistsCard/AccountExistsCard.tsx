'use client';

import React from 'react';
import { Box, Typography, Paper, Stack, Button, Divider } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

type AccountExistsCardProps = {
  fullName: string;
  usernames: string[];
  onLoginClick: (username: string) => void;
};

const AccountExistsCard: React.FC<AccountExistsCardProps> = ({
  fullName,
  usernames,
  onLoginClick,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      //  p={3}
    >
      <ErrorOutlineIcon color="error" fontSize="large" />

      <Typography
        mt={2}
        variant="body1"
        component="h2"
        // fontFamily="Poppins"
        // fontSize="16px"
        fontWeight={400}
        lineHeight="24px"
        letterSpacing="0.5px"
        textAlign="center"
        sx={{
          display: 'inline-block', // to handle vertical-align
          verticalAlign: 'middle', // ensures vertical alignment
        }}
      >
        One or more accounts with this name, email ID, and/or phone number
        already exist, as listed below
      </Typography>

      <Typography
        mt={2}
        variant="body5"
        component="h2"
        // fontFamily="Poppins"
        // fontSize="18px"
        fontWeight={600}
        lineHeight="28px"
      >
        {fullName}
      </Typography>

      <Stack spacing={2} width="100%" maxWidth={400} mt="10px">
        {usernames.map((username, idx) => (
          <Paper
            key={idx}
            elevation={1}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1.5, // reasonable side padding
              py: 1,
              borderRadius: 2,
              backgroundColor: '#f5e8d8',
              cursor: 'pointer',
            }}
            onClick={() => onLoginClick(username)}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                ml: 0.5, // ← This brings it closer to the left edge
              }}
            >
              <Typography
                // fontSize="14px"
                variant="h3"
                color="text.primary"
                lineHeight={1.4}
                mb={0.2}
              >
                {username}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: '#0071E3',
                  lineHeight: 1.4,
                }}
              >
                Login with this username
              </Typography>
            </Box>

            <ArrowForwardIcon sx={{ color: '#000', ml: 1 }} />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default AccountExistsCard;
