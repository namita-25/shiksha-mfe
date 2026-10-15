import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';
import { post } from './RestClient';

export interface LocationOption {
  value: string;
  label: string;
}

export const MasterDataService = {
  getStates: async (): Promise<LocationOption[]> => {
    try {
      const response = await post(API_ENDPOINTS.fieldOptionsRead, {
        fieldName: 'state',
        limit: 100,
        offset: 0,
      });
      if (response?.data?.result?.values) {
        return response.data.result.values.map((v: any) => ({
          value: v.value || v.id || v.name,
          label: v.name || v.label || v.value,
        }));
      }
    } catch (e) {
      // Fallback defaults for Maharashtra / Gujarat
    }
    return [
      { value: 'maharashtra', label: 'Maharashtra' },
      { value: 'gujarat', label: 'Gujarat' },
      { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
    ];
  },

  getDistricts: async (stateValue?: string): Promise<LocationOption[]> => {
    try {
      if (stateValue) {
        const response = await post(API_ENDPOINTS.fieldOptionsRead, {
          fieldName: 'district',
          controllingfieldfk: stateValue,
          limit: 100,
          offset: 0,
        });
        if (response?.data?.result?.values?.length > 0) {
          return response.data.result.values.map((v: any) => ({
            value: v.value || v.id || v.name,
            label: v.name || v.label || v.value,
          }));
        }
      }
    } catch (e) {
      // Fallback
    }

    if (stateValue === 'gujarat') {
      return [
        { value: 'ahmedabad', label: 'Ahmedabad' },
        { value: 'surat', label: 'Surat' },
        { value: 'vadodara', label: 'Vadodara' },
      ];
    }
    return [
      { value: 'pune', label: 'Pune' },
      { value: 'nagpur', label: 'Nagpur' },
      { value: 'nashik', label: 'Nashik' },
      { value: 'mumbai_suburban', label: 'Mumbai Suburban' },
    ];
  },

  getBlocks: async (districtValue?: string): Promise<LocationOption[]> => {
    try {
      if (districtValue) {
        const response = await post(API_ENDPOINTS.fieldOptionsRead, {
          fieldName: 'block',
          controllingfieldfk: districtValue,
          limit: 100,
          offset: 0,
        });
        if (response?.data?.result?.values?.length > 0) {
          return response.data.result.values.map((v: any) => ({
            value: v.value || v.id || v.name,
            label: v.name || v.label || v.value,
          }));
        }
      }
    } catch (e) {
      // Fallback
    }

    if (districtValue === 'nagpur') {
      return [
        { value: 'nagpur_rural', label: 'Nagpur Rural' },
        { value: 'kamthi', label: 'Kamthi' },
        { value: 'hingna', label: 'Hingna' },
      ];
    }
    return [
      { value: 'haveli', label: 'Haveli' },
      { value: 'pune_city', label: 'Pune City' },
      { value: 'baramati', label: 'Baramati' },
      { value: 'khed', label: 'Khed' },
    ];
  },

  getVillages: async (blockValue?: string): Promise<LocationOption[]> => {
    try {
      if (blockValue) {
        const response = await post(API_ENDPOINTS.fieldOptionsRead, {
          fieldName: 'village',
          controllingfieldfk: blockValue,
          limit: 100,
          offset: 0,
        });
        if (response?.data?.result?.values?.length > 0) {
          return response.data.result.values.map((v: any) => ({
            value: v.value || v.id || v.name,
            label: v.name || v.label || v.value,
          }));
        }
      }
    } catch (e) {
      // Fallback
    }
    return [
      { value: 'branch_central', label: 'Central CFL Branch' },
      { value: 'branch_north', label: 'North Sub-center' },
      { value: 'branch_rural_1', label: 'Rural Kendra 1' },
    ];
  },

  getPrograms: (): LocationOption[] => {
    return [
      { value: 'financial_inclusion', label: 'Financial Inclusion (CFL)' },
      { value: 'micro_enterprise', label: 'Micro-Enterprise Skillset' },
      { value: 'digital_saksharta', label: 'Digital Saksharta' },
    ];
  },

  getRoles: (): LocationOption[] => {
    return [
      { value: 'ARM', label: 'Area Relationship Manager (ARM)' },
      { value: 'DI', label: 'Development Inspector (DI)' },
      { value: 'Trainer', label: 'Field Trainer' },
      { value: 'State_Lead', label: 'State Operations Lead' },
    ];
  },
};

export default MasterDataService;
