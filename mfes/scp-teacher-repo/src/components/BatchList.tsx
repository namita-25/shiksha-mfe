import { Status } from '@/utils/app.constant';
import { Box, Grid } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Image from 'next/image';
import { useDirection } from '@/hooks/useDirection';
import building from '../assets/images/apartment.png';

interface Batch {
  cohortId: string;
  name: string;
}
interface BatchListProps {
cohortId: string;
  title: string;
  batches: Batch[];
  router?: any;
  theme?: any;
  t: (key: string) => string;
}
const BatchList: React.FC<BatchListProps> = ({
  // cohortId,
  title,
  batches,
  router,
  theme,
  t,
}) => {
  
  const { isRTL } = useDirection();
  return (
    <>
      <Box
        sx={{
          fontSize: '14px',
          fontWeight: '500',
          color: theme.palette.warning['300'],
          marginBottom: '8px',
          m: 2,
        }}
      >
        {t(title)}
      </Box>
      <Box
        sx={{
          borderRadius: '16px',
          p: 2,
          background: theme.palette.action.selected,
          m: 2,
        }}
      >
        <Grid container spacing={2}>
          {batches.map((batch) => (
            <Grid item xs={12} sm={12} md={6} lg={4} key={batch.cohortId}>
              <Box
                onClick={() => {
                  router.push(`/centers/${batch.cohortId}`);
                  localStorage.setItem('cohortId', batch.cohortId);
                  localStorage.setItem('batchName', batch.name.toLowerCase());
                }}
                sx={{ cursor: 'pointer' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: '10px',
                    background: '#fff',
                    height: '56px',
                    borderRadius: '8px',
                  }}
                  mt={1}
                >
                  <Box
                    sx={{
                      width: '56px',
                      display: 'flex',
                      background: theme.palette.primary.light,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderTopLeftRadius: '8px',
                      borderBottomLeftRadius: '8px',
                    }}
                  >
                    <Image src={building} alt="batch" />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '0 10px',
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '16px',
                        fontWeight: '400',
                        color: theme.palette.warning['300'],
                      }}
                    >
                      {batch.name.charAt(0).toUpperCase() + batch.name.slice(1)}
                    </Box>
                    <ChevronRightIcon
                      sx={{
                        color: theme.palette.warning['A200'],
                        transform: isRTL ? ' rotate(180deg)' : 'unset',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};
export default BatchList;