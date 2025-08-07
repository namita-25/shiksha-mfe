'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  Paper,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';

interface UserAccount {
  name: string;
  username: string;
}

interface AccountSelectionFormProps {
  userAccounts: UserAccount[];
  onNext: (selected: string) => void;
}

const AccountSelectionForm: React.FC<AccountSelectionFormProps> = ({
  userAccounts,
  onNext,
}) => {
  const [selectedUsername, setSelectedUsername] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUsername(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedUsername) {
      onNext(selectedUsername);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#fefbe9"
      px={2}
      sx={{ overflowX: 'hidden' }} // Prevent horizontal scroll
    >
      <Typography variant={'subtitle1'} mb={3} textAlign="center">
        Which account are you having trouble logging into?
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          bgcolor: '#fff',
          borderRadius: 3,
          width: '100%',
          maxWidth: { xs: '100%', sm: '700px' },
          overflow: 'hidden', // Prevent internal overflow
        }}
      >
        <RadioGroup value={selectedUsername} onChange={handleChange}>
          {userAccounts?.map((account) => (
            <Box
              key={account.username}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #ccc',
                borderRadius: 2,
                px: 2,
                py: 1,
                mb: 1,
                backgroundColor:
                  selectedUsername === account.username ? '#f3f3f3' : '#fff',
                cursor: 'pointer',
                flexWrap: 'nowrap',
                width: '100%', // Prevent horizontal overflow
              }}
              onClick={() => setSelectedUsername(account.username)}
            >
              <Box
                flexGrow={1}
                sx={{
                  overflow: 'hidden',
                  minWidth: 0, // Essential to prevent overflow inside flex
                }}
              >
                <Typography
                  fontWeight="bold"
                  noWrap
                  fontSize={{ xs: '0.9rem', sm: '1rem' }}
                >
                  {account.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  }}
                >
                  {account.username}
                </Typography>
              </Box>

              <Radio
                checked={selectedUsername === account.username}
                value={account.username}
                onChange={handleChange}
                sx={{ ml: 1 }}
              />
            </Box>
          ))}
        </RadioGroup>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: '#FFC107',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#ffb300',
            },
          }}
          disabled={!selectedUsername}
          onClick={handleSubmit}
        >
          Next
        </Button>
      </Paper>
    </Box>
  );
};

export default AccountSelectionForm;
