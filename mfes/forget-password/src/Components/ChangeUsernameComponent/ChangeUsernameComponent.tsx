'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
type ChangeUsernameProps = {
  suggestedUsernames: string[];
  handleContinue: (username: string) => void;
};

const ChangeUsernameComponent: React.FC<ChangeUsernameProps> = ({
  suggestedUsernames,
  handleContinue,
}) => {
  const [username, setUsername] = useState('');

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      sx={{ backgroundColor: '#fffaf1' }} // soft yellowish background
    >
      <Typography
        fontFamily="Poppins"
        fontWeight={600}
        fontSize="24px"
        lineHeight="32px"
        textAlign="center"
        gutterBottom
      >
        Change Username
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          width: '100%',
          maxWidth: 420,
          textAlign: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          InputProps={{
            sx: {
              fontFamily: 'Poppins',
              fontSize: '14px',
            },
          }}
          InputLabelProps={{
            sx: {
              fontFamily: 'Poppins',
              fontSize: '14px',
            },
          }}
        />

        <Box textAlign="left" mt={2}>
          <Typography
            fontFamily="Poppins"
            fontWeight={500}
            fontSize="14px"
            mb={1}
          >
            Available usernames
          </Typography>

          <List disablePadding>
            {suggestedUsernames.map((name) => (
              <ListItem
                key={name}
                disableGutters
                sx={{
                  px: 0,
                  py: 0.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => setUsername(name)}
              >
                <ListItemIcon sx={{ minWidth: '32px' }}>
                  <CheckIcon sx={{ color: '#28a745' }} /> {/* normal green */}
                </ListItemIcon>
                <ListItemText
                  primary={name}
                  primaryTypographyProps={{
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: '#28a745', // green text
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: '#FFC107',
            color: '#000',
            fontWeight: 'bold',
            fontFamily: 'Poppins',
            borderRadius: '999px',
            py: 1.3,
            fontSize: '14px',
            '&:hover': {
              backgroundColor: '#ffb300',
            },
          }}
          onClick={() => handleContinue(username)}
        >
          Continue
        </Button>
      </Paper>
    </Box>
  );
};

export default ChangeUsernameComponent;
