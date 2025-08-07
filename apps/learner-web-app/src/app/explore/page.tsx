'use client';
import React, { useEffect, useState } from 'react';
import Layout from '@learner/components/Layout';
import LearnerCourse from '@learner/components/Content/LearnerCourse';
import SkillCenter from '@learner/components/SkillCenter/SkillCenter';
import { gredientStyle } from '@learner/utils/style';
import { Box } from '@mui/material';
import {
  CohortDetails,
  getUserCohortsRead,
  searchCohort,
} from '@learner/utils/API/CohortService';
import { useTranslation } from '@shared-lib';
interface Center {
  name: string;
  category: string;
  address: string;
  distance: string;
  mapsUrl: string;
  images: string[];
  moreImages: number;
  customFields?: {
    label: string;
    selectedValues: string[];
  }[];
}

const App = () => {
  const [visibleCenters, setVisibleCenters] = useState<any>([]);
  const { t } = useTranslation();

  const getCustomFieldValue = (
    cohort: CohortDetails,
    fieldLabel: string
  ): string | null => {
    console.log(fieldLabel, 'fieldLabel');
    console.log(cohort, 'cohort');
    const field = cohort.customFields.find((f) => f.label === fieldLabel);
    console.log(field, 'field');

    if (field && field.selectedValues.length > 0) {
      return field.selectedValues[0] as any;
    }
    return null;
  };
  const getIndustryValues = (cohort: CohortDetails): string[] => {
    const industryField = cohort.customFields.find(
      (f) => f.label === 'INDUSTRY'
    );
    if (industryField) {
      return industryField.selectedValues.map((v) => v.label || v.value);
    }
    return [];
  };
  const fetchCenters = async (currentOffset: number) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }
      const userCohorts = await getUserCohortsRead({
        userId: userId,
        fieldvalue: true,
      });

      console.log(userCohorts, 'userCohorts');

      // Extract state, district, block and village IDs from user data
      const userData = userCohorts?.result?.userData;
      const customFields = userData?.customFields || [];

      interface CustomField {
        fieldId: string;
        label: string;
        type: string;
        selectedValues: any[];
      }

      const stateField = customFields.find(
        (field: CustomField) => field.label === 'STATE'
      );
      const districtField = customFields.find(
        (field: CustomField) => field.label === 'DISTRICT'
      );
      const blockField = customFields.find(
        (field: CustomField) => field.label === 'BLOCK'
      );
      const villageField = customFields.find(
        (field: CustomField) => field.label === 'VILLAGE'
      );

      const stateId = stateField?.selectedValues[0]?.id;
      const districtId = districtField?.selectedValues[0]?.id;
      const blockId = blockField?.selectedValues[0]?.id;
      const villageId = villageField?.selectedValues[0]?.id;

      console.log(
        stateId,
        districtId,
        blockId,
        villageId,
        'stateId, districtId, blockId, villageId'
      );

      const response = await searchCohort({
        //  limit: 3,
        offset: currentOffset,
        filters: {
          state: stateId,
          // district: districtId,
          // block: blockId,
          // village: villageId,
        },
      });
      console.log('searchdata', response);

      if (response?.result.results?.cohortDetails) {
        const apiCenters: Center[] = response.result.results.cohortDetails.map(
          (cohort: CohortDetails) => ({
            name: cohort.name,
            category: getIndustryValues(cohort)[0] || 'General',
            address:
              getCustomFieldValue(cohort, 'ADDRESS') || 'Address not available',
            distance: '0 km',
            mapsUrl: getCustomFieldValue(cohort, 'GOOGLE_MAP_LINK') || '#',
            images: cohort.image || ['/images/default.png'],
            moreImages: cohort.image?.length > 3 ? cohort.image.length - 3 : 0,
          })
        );
        setVisibleCenters(apiCenters);
      } else {
        setVisibleCenters([]);
      }
    } catch (error) {
      setVisibleCenters([]);
      console.error('Failed to fetch centers:', error);
    } finally {
      //  setLoading(false);
    }
  };
  console.log('visibleCenters', visibleCenters);
  useEffect(() => {
    fetchCenters(0);
    // console.log("response", response)
  }, []);

  return (
    <Layout sx={gredientStyle}>
      <LearnerCourse
        title={'LEARNER_APP.EXPLORE.EXPLORE_ADDITIONAL_COURSES'}
        _content={{
          pageName: 'explore_Content',
          onlyFields: ['contentLanguage', 'se_subDomains', 'se_subjects'],
          isOpenColapsed: ['contentLanguage', 'se_subDomains', 'se_subjects'],
          contentTabs: ['courses', 'content'],
        }}
      />
      <Box
        sx={{
          background: '#fff',
          py: 2,
        }}
      >
        <SkillCenter
          viewAll={false}
          Limit={3}
          title={t('COMMON.SKILLING_CENTERS_NEAR_YOU')}
          visibleCenters={visibleCenters}
          setVisibleCenters={setVisibleCenters}
        />
      </Box>
    </Layout>
  );
};

export default App;
