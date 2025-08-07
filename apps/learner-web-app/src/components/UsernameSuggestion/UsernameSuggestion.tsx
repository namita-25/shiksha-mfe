import React from 'react';
import {
  TextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Loader, useTranslation } from '@shared-lib'; // Updated import

interface UsernameSuggestionProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
  onContinue: () => void;
}

const UsernameSuggestion: React.FC<UsernameSuggestionProps> = ({
  value,
  onChange,
  suggestions,
  setSuggestions,
  onContinue,
}) => {
  const { t } = useTranslation();

  // Function to handle clicking a suggestion
  const handleSuggestionClick = (username: string) => {
    onChange(username);
    setSuggestions([]); // Clear suggestions after selection
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        width: '100%',
        margin: '0 auto',
        p: 3,
        bgcolor: '#fff',
        borderRadius: 3,
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}
    >
      <TextField
        label={t('LEARNER_APP.USERNAME_SUGGESTION.USERNAME')} // Internationalized label
        value={value}
        onChange={(e: any) => onChange(e)}
        fullWidth
        variant="outlined"
        InputProps={{
          sx: {
            borderRadius: 2,
            bgcolor: '#fff',
          },
        }}
        InputLabelProps={{
          sx: { fontSize: 14 },
        }}
        sx={{ mb: 2 }}
      />

      {suggestions.length > 0 && (
        <Box sx={{ textAlign: 'left', mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              fontSize: 14,
              fontWeight: 500,
              color: '#4B4B4B',
            }}
          >
            {t('LEARNER_APP.USERNAME_SUGGESTION.AVAILABLE_USERNAMES')}
          </Typography>
          <List dense disablePadding>
            {suggestions.map((username) => (
              <ListItem
                key={username}
                button
                onClick={() => handleSuggestionClick(username)}
                sx={{ pl: 0, cursor: 'pointer' }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon sx={{ color: 'green', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={username}
                  primaryTypographyProps={{
                    fontSize: 14,
                    color: 'green',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={onContinue}
        sx={{
          mt: 3,
          backgroundColor: '#FFC107',
          color: '#000',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#FFB300',
          },
        }}
      >
        {t('LEARNER_APP.USERNAME_SUGGESTION.CONTINUE')}
      </Button>
    </Box>
  );
};

export default UsernameSuggestion;
