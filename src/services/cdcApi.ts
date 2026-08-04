import apiService from '../utils/api';

// Base URL for CDC API
const CDC_API_BASE_URL = 'https://data.cdc.gov/api';

// CDC API service for public health data
const cdcApi = {
  // Vaccination data
  vaccinations: {
    getVaccinationCoverageByState: async (year?: number) => {
      const params: any = {};
      if (year) params.year = year;
      
      return apiService.get(`${CDC_API_BASE_URL}/views/8gvb-jkbp/rows.json`, params);
    },
    
    getChildhoodVaccinationRates: async (params?: any) => {
      return apiService.get(`${CDC_API_BASE_URL}/views/je4h-y3tp/rows.json`, params);
    },
    
    getVaccinationSchedule: async () => {
      return apiService.get(`/api/cdc/vaccination-schedule`);
    },
  },
  
  // Disease outbreak data
  outbreaks: {
    getCurrentOutbreaks: async () => {
      return apiService.get(`/api/cdc/current-outbreaks`);
    },
    
    getOutbreaksByLocation: async (state: string) => {
      return apiService.get(`/api/cdc/outbreaks/${state}`);
    },
    
    getOutbreaksByDisease: async (disease: string) => {
      return apiService.get(`/api/cdc/outbreaks/disease/${disease}`);
    },
  },
  
  // Health statistics
  statistics: {
    getChildhoodMortalityRates: async (params?: any) => {
      return apiService.get(`${CDC_API_BASE_URL}/views/e8kx-wbww/rows.json`, params);
    },
    
    getImmunizationCoverage: async (params?: any) => {
      return apiService.get(`${CDC_API_BASE_URL}/views/n8mc-b4w4/rows.json`, params);
    },
  },
  
  // Health recommendations
  recommendations: {
    getVaccineRecommendations: async (age: number, conditions?: string[]) => {
      const params: any = { age };
      if (conditions) params.conditions = conditions.join(',');
      
      return apiService.get(`/api/cdc/recommendations/vaccines`, params);
    },
    
    getPreventiveCareRecommendations: async (age: number, gender: string) => {
      return apiService.get(`/api/cdc/recommendations/preventive-care`, {
        age,
        gender,
      });
    },
  },
  
  // Educational resources
  education: {
    getVaccineEducationalMaterials: async (vaccine?: string, language = 'en') => {
      const params: any = { language };
      if (vaccine) params.vaccine = vaccine;
      
      return apiService.get(`/api/cdc/education/vaccines`, params);
    },
    
    getDiseasePrevention: async (disease: string, language = 'en') => {
      return apiService.get(`/api/cdc/education/disease-prevention`, {
        disease,
        language,
      });
    },
  },
};

export default cdcApi;