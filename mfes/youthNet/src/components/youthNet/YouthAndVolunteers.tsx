import React, { useEffect, useState } from 'react';
import {
  MenuItem,
  Select,
  FormControl,
  Typography,
  SelectChangeEvent,
  Grid,
  Box,
} from '@mui/material';
import RegistrationStatistics from './RegistrationStatistics';
import {  getVillages, getYouthDataByDate } from '../../services/youthNet/Dashboard/UserServices';
import { useTranslation } from 'next-i18next';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { categorizeUsers } from '../../utils/Helper';

interface Props {
  selectOptions: { label: string; value: string }[];
  data?: string;
  userId:string;
  managedVillageCount?:any
}

const YouthAndVolunteers: React.FC<Props> = ({ selectOptions,managedVillageCount, data , userId}) => {
  const [selectedValue, setSelectedValue] = useState<string>(
    selectOptions[0]?.value || ''
  );
  const { t } = useTranslation();
 const [youthCount, setYouthCount] = useState<number>(0);
 const [volunteerCount, setVolunteerCount] = useState<number>(0);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedValue(event.target.value);
  };
  useEffect(() => {
    const getYouthData = async () => {
      try {
        let fromDate = new Date(2024, 3, 1);
            const villages=await getVillages(userId)
            const villageIds=villages?.map((item: any) => item.id) || []
       let toDate ;
        if (selectedValue === 'today') {
          toDate = new Date();
        }
        if(selectedValue === 'month') {
        const date = new Date();

       //  fromDate = new Date(toDate.getFullYear(), toDate.getMonth() - 1, toDate.getDate())
          toDate = new Date(date.getFullYear(), date.getMonth(), 0);

        }
        if(selectedValue==='year') {
          // fromDate = new Date(toDate.getFullYear() - 1, toDate.getMonth(), toDate.getDate())
          toDate = new Date(new Date().getFullYear(), 0, 0);


        }
        if(fromDate && toDate)
         {const response = await getYouthDataByDate(
          fromDate,
          toDate,
          villageIds
        );
        console.log(response?.getUserDetails);
        const { volunteerUsers, youthUsers } = categorizeUsers(response?.getUserDetails)
     setYouthCount(youthUsers?.length)
     setVolunteerCount(volunteerUsers?.length)

      }

      } catch (error) {
        setYouthCount(0)
        setVolunteerCount(0)
        console.log(error);
      }
      // setUserData(data);
    };
if(userId && userId!=="")
    getYouthData();
  }, [selectedValue, userId]);
  return (
    <div style={{ padding: '16px' }}>
      {data && (
        <Typography
          variant="h2"
          sx={{ fontSize: '16px', color: 'black' }}
          gutterBottom
        >
            {t('YOUTHNET_DASHBOARD.TOTAL_YOUTH')}
        </Typography>
      )}
      <FormControl style={{ marginBottom: '8px', width: '100%' }}>
        <Select
          value={selectedValue}
          onChange={handleChange}
          style={{
            borderRadius: '8px',

            fontSize: '16px',
          }}
          displayEmpty
        >
          {selectOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box display={'flex'} flexDirection="row" gap="10px">
      <Typography variant="body1" style={{ fontWeight: 300, color: 'black' }}>
         {managedVillageCount} { managedVillageCount>=1 ? t('YOUTHNET_DASHBOARD.VILLAGE'): t('YOUTHNET_DASHBOARD.VILLAGES')}
      </Typography>
      <FiberManualRecordIcon 
      sx={{ color: '#B1AAA2', width: 12, height: 12  , marginTop:"8px"}} 
    />
      <Typography variant="body1" style={{ fontWeight: 300, color: 'black' }}>
        {t('YOUTHNET_DASHBOARD.YOUTH_VOLUNTEER_COUNT', {count: youthCount+volunteerCount})}

      </Typography>
      </Box>
    
      { (
        <Box p={2}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <RegistrationStatistics
                avatar={true}
                statistic={youthCount}
                subtile={'Youth'}
              />
            </Grid>
            <Grid item xs={6}>
              <RegistrationStatistics
                avatar={true}
                statistic={volunteerCount}
                subtile={'Volunteer'}
                isVolunteer={true}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
};

export default YouthAndVolunteers;
