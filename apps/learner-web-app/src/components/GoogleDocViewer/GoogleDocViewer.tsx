'use client';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

interface GoogleDocViewerProps {
  getDocUrl: (language: string) => string;
  title?: string;
}

const GoogleDocViewer: React.FC<GoogleDocViewerProps> = ({
  getDocUrl,
  title = 'FAQs',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const router = useRouter();

  const handleLanguageChange = (event: any) => {
    setSelectedLanguage(event.target.value);
  };

  const docUrl = getDocUrl(selectedLanguage);

  return (
    <Box sx={{ position: 'relative', px: 2 }}>
      {/* Title */}
      <Box
      flexDirection={"row"}
      display={"flex"}
      mt= {"2px"}
      >
      <Box
          // sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}
          onClick={() => router.push('/profile')}
        >
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
        </Box>

      <Typography
        variant="h2"
        sx={{ color: 'warning.A200', fontWeight: 500, mt: 1, mb: 2 }}
      >
        {title}
      </Typography>

      </Box>
      
      {/* Language Selector */}
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 24,
          mt: '20px',
        }}
      >
        <FormControl size="small">
          <InputLabel id="language-select-label">Select Language</InputLabel>
          <Select
            labelId="language-select-label"
            value={selectedLanguage}
            label="Select Language"
            onChange={handleLanguageChange}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="hindi">Hindi</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Embedded Google Doc */}
      <Box
        sx={{
          height: 'calc(100vh - 200px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 4,
        }}
      >
        <iframe
          src={docUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          title="Google Doc Viewer"
        />
      </Box>
    </Box>
  );
};

export default GoogleDocViewer;
