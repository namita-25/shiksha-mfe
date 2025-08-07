import React from 'react';
import {
  fetchCohortMemberList,
  getCohortList,
} from '@/services/CohortService/cohortService';
import { Typography } from '@mui/material';
import { Status } from '@/utils/app.constant';
import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';

const ActiveArchivedBatch = ({ cohortId, type }: any) => {
  const [countLabel, setCountLabel] = React.useState('-');

  React.useEffect(() => {
    let isMounted = true;
    const fetchLabel = async () => {
      const label = await getCountLabel(cohortId, type);
      if (isMounted) {
        setCountLabel(label);
      }
    };
    fetchLabel();

    return () => {
      isMounted = false;
    };
  }, [cohortId]);

  return (
    <Typography sx={{ color: type == Status.ACTIVE ? 'green' : 'red' }}>
      {countLabel}
    </Typography>
  );
};

const getCountLabel = async (cohortId: any, type: any) => {
  try {
    //get batch from center id
    const url = API_ENDPOINTS.cohortSearch;
    const header = {
      tenantId: localStorage.getItem('tenantId') || '',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      academicyearid: localStorage.getItem('academicYearId') || '',
    };
    const responseBatch = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...header,
      },
      body: JSON.stringify({
        limit: 200,
        offset: 0,
        filters: {
          type: 'BATCH',
          status: [type],
          parentId: [cohortId],
        },
      }),
    });
    const dataBatch = await responseBatch.json();
    if (dataBatch?.result?.results?.cohortDetails) {
      return dataBatch.result.results.cohortDetails.length;
    } else {
      return '-';
    }
  } catch (e) {
    console.log(e);
    return '-';
  }

  //  console.log(resp)
};
export default ActiveArchivedBatch;
