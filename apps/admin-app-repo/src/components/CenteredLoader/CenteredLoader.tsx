import { Box, CircularProgress } from '@mui/material';

const CenteredLoader = () => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%" // or specify a fixed height like "300px"
            width="100%"
            sx={{ mt: 10 }}
        >
            <CircularProgress />
        </Box>
    );
};

export default CenteredLoader;
