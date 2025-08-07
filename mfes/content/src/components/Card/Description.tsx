import { Box, Typography } from '@mui/material';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';

const Description = () => {
  return (
    <Box>
      <Typography
        sx={{
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: '15.4px',
          lineHeight: '23.09px',
          letterSpacing: '0.48px',
        }}
      >
        No description available but plenty to explore
      </Typography>
      <SentimentSatisfiedIcon style={{ fontSize: 20, color: 'grey' }} />
    </Box>
  );
};

export default Description;
