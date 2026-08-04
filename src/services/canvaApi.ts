import apiService from '../utils/api';

// Base URL for Canva API
const CANVA_API_BASE_URL = 'https://api.canva.com/v1';

// Canva API service
const canvaApi = {
  // Design templates
  templates: {
    // Get available templates
    getTemplates: async (category?: string) => {
      const params: any = {};
      if (category) params.category = category;
      
      return apiService.get(`${CANVA_API_BASE_URL}/templates`, params);
    },
    
    // Get template details
    getTemplateDetails: async (templateId: string) => {
      return apiService.get(`${CANVA_API_BASE_URL}/templates/${templateId}`);
    },
    
    // Get healthcare-specific templates
    getHealthcareTemplates: async () => {
      return apiService.get(`${CANVA_API_BASE_URL}/templates`, {
        category: 'healthcare',
      });
    },
  },
  
  // Design creation and editing
  designs: {
    // Create a new design
    createDesign: async (templateId: string, name: string) => {
      return apiService.post(`${CANVA_API_BASE_URL}/designs`, {
        templateId,
        name,
      });
    },
    
    // Get design details
    getDesign: async (designId: string) => {
      return apiService.get(`${CANVA_API_BASE_URL}/designs/${designId}`);
    },
    
    // Update design
    updateDesign: async (designId: string, data: any) => {
      return apiService.put(`${CANVA_API_BASE_URL}/designs/${designId}`, data);
    },
    
    // Delete design
    deleteDesign: async (designId: string) => {
      return apiService.delete(`${CANVA_API_BASE_URL}/designs/${designId}`);
    },
  },
  
  // Brand assets
  brand: {
    // Get brand assets
    getBrandAssets: async () => {
      return apiService.get(`${CANVA_API_BASE_URL}/brand/assets`);
    },
    
    // Upload brand asset
    uploadBrandAsset: async (file: File, assetType: string, onProgress?: (percentage: number) => void) => {
      return apiService.uploadFile(
        `${CANVA_API_BASE_URL}/brand/assets`,
        file,
        onProgress,
        {
          assetType,
        }
      );
    },
  },
  
  // Design export
  export: {
    // Export design as PDF
    exportAsPdf: async (designId: string) => {
      return apiService.post(`${CANVA_API_BASE_URL}/designs/${designId}/exports`, {
        format: 'pdf',
      });
    },
    
    // Export design as PNG
    exportAsPng: async (designId: string, width?: number, height?: number) => {
      const params: any = {
        format: 'png',
      };
      
      if (width) params.width = width;
      if (height) params.height = height;
      
      return apiService.post(`${CANVA_API_BASE_URL}/designs/${designId}/exports`, params);
    },
    
    // Export design as JPG
    exportAsJpg: async (designId: string, quality = 100) => {
      return apiService.post(`${CANVA_API_BASE_URL}/designs/${designId}/exports`, {
        format: 'jpg',
        quality,
      });
    },
    
    // Get export status
    getExportStatus: async (designId: string, exportId: string) => {
      return apiService.get(`${CANVA_API_BASE_URL}/designs/${designId}/exports/${exportId}`);
    },
  },
  
  // Canva App SDK helpers
  sdk: {
    // Initialize Canva Design Button
    initDesignButton: (buttonId: string, options: any) => {
      if (typeof window !== 'undefined' && window.Canva) {
        window.Canva.DesignButton.initialize(buttonId, options);
      } else {
        console.error('Canva SDK not loaded');
      }
    },
    
    // Initialize Canva Preview
    initPreview: (containerId: string, designId: string, options: any) => {
      if (typeof window !== 'undefined' && window.Canva) {
        window.Canva.Preview.initialize(containerId, designId, options);
      } else {
        console.error('Canva SDK not loaded');
      }
    },
  },
  
  // Template categories for healthcare
  categories: {
    // Get healthcare template categories
    getHealthcareCategories: async () => {
      return [
        { id: 'vaccination', name: 'Vaccination Certificates' },
        { id: 'medical-records', name: 'Medical Records' },
        { id: 'educational', name: 'Educational Materials' },
        { id: 'appointment', name: 'Appointment Cards' },
        { id: 'prescription', name: 'Prescription Templates' },
        { id: 'infographics', name: 'Health Infographics' },
      ];
    },
  },
  
  // Mock data for development (when API is not available)
  mock: {
    // Get mock templates
    getMockTemplates: () => {
      return {
        templates: [
          {
            id: 'template_001',
            name: 'Vaccination Certificate',
            thumbnail: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'vaccination',
            description: 'Official vaccination certificate template',
          },
          {
            id: 'template_002',
            name: 'Child Health Record',
            thumbnail: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'medical-records',
            description: 'Comprehensive child health record template',
          },
          {
            id: 'template_003',
            name: 'Vaccine Information Sheet',
            thumbnail: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'educational',
            description: 'Educational material about vaccines',
          },
          {
            id: 'template_004',
            name: 'Appointment Reminder',
            thumbnail: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'appointment',
            description: 'Appointment reminder card template',
          },
          {
            id: 'template_005',
            name: 'Immunization Schedule',
            thumbnail: 'https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'educational',
            description: 'Visual immunization schedule for parents',
          },
          {
            id: 'template_006',
            name: 'Health Infographic',
            thumbnail: 'https://images.pexels.com/photos/4386468/pexels-photo-4386468.jpeg?auto=compress&cs=tinysrgb&w=300',
            category: 'infographics',
            description: 'Customizable health infographic template',
          },
        ],
      };
    },
  },
};

// Add type definitions for Canva SDK
declare global {
  interface Window {
    Canva?: {
      DesignButton: {
        initialize: (buttonId: string, options: any) => void;
      };
      Preview: {
        initialize: (containerId: string, designId: string, options: any) => void;
      };
    };
  }
}

export default canvaApi;