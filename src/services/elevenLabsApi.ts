import apiService from '../utils/api';

// Base URL for Eleven Labs API
const ELEVEN_LABS_API_BASE_URL = 'https://api.elevenlabs.io/v1';

// Eleven Labs API service
const elevenLabsApi = {
  // Text to speech endpoints
  textToSpeech: {
    // Convert text to speech
    convert: async (text: string, voiceId: string, options?: any) => {
      // In a real implementation, you would call the Eleven Labs API directly
      // Here we're using a proxy API to avoid exposing API keys in the frontend
      return apiService.post(`/api/elevenlabs/text-to-speech`, {
        text,
        voiceId,
        options
      });
    },
    
    // Stream audio response
    stream: async (text: string, voiceId: string, options?: any) => {
      return apiService.post(`/api/elevenlabs/text-to-speech/stream`, {
        text,
        voiceId,
        options
      }, {
        responseType: 'blob'
      });
    },
  },
  
  // Voice management endpoints
  voices: {
    // Get available voices
    getVoices: async () => {
      return apiService.get(`/api/elevenlabs/voices`);
    },
    
    // Get voice details
    getVoiceDetails: async (voiceId: string) => {
      return apiService.get(`/api/elevenlabs/voices/${voiceId}`);
    },
    
    // Get default voice settings
    getDefaultVoiceSettings: async () => {
      return apiService.get(`/api/elevenlabs/voices/settings/default`);
    },
  },
  
  // Voice generation and cloning
  voiceGeneration: {
    // Add a new voice
    addVoice: async (name: string, files: File[], description?: string, onProgress?: (percentage: number) => void) => {
      const formData = new FormData();
      formData.append('name', name);
      
      if (description) {
        formData.append('description', description);
      }
      
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      return apiService.post(
        `/api/elevenlabs/voices/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percentage);
            }
          },
        }
      );
    },
    
    // Edit voice settings
    editVoice: async (voiceId: string, settings: any) => {
      return apiService.post(`/api/elevenlabs/voices/${voiceId}/edit`, settings);
    },
    
    // Delete voice
    deleteVoice: async (voiceId: string) => {
      return apiService.delete(`/api/elevenlabs/voices/${voiceId}`);
    },
  },
  
  // History endpoints
  history: {
    // Get generation history
    getHistory: async (pageSize = 100, startAfterHistoryItemId?: string) => {
      const params: any = { pageSize };
      
      if (startAfterHistoryItemId) {
        params.startAfterHistoryItemId = startAfterHistoryItemId;
      }
      
      return apiService.get(`/api/elevenlabs/history`, params);
    },
    
    // Get history item by ID
    getHistoryItem: async (historyItemId: string) => {
      return apiService.get(`/api/elevenlabs/history/${historyItemId}`);
    },
    
    // Download history item audio
    downloadHistoryAudio: async (historyItemId: string) => {
      return apiService.get(`/api/elevenlabs/history/${historyItemId}/audio`, {
        responseType: 'blob'
      });
    },
    
    // Delete history item
    deleteHistoryItem: async (historyItemId: string) => {
      return apiService.delete(`/api/elevenlabs/history/${historyItemId}`);
    },
  },
  
  // User endpoints
  user: {
    // Get user information
    getUserInfo: async () => {
      return apiService.get(`/api/elevenlabs/user`);
    },
    
    // Get subscription information
    getSubscriptionInfo: async () => {
      return apiService.get(`/api/elevenlabs/user/subscription`);
    },
  },
  
  // Healthcare-specific voice endpoints
  healthcare: {
    // Generate vaccination reminder
    generateVaccinationReminder: async (
      childName: string, 
      vaccineName: string, 
      appointmentDate: string, 
      clinicName: string,
      language = 'en',
      voiceId?: string
    ) => {
      return apiService.post(`/api/elevenlabs/healthcare/vaccination-reminder`, {
        childName,
        vaccineName,
        appointmentDate,
        clinicName,
        language,
        voiceId
      });
    },
    
    // Generate medication instructions
    generateMedicationInstructions: async (
      patientName: string,
      medicationName: string,
      dosage: string,
      frequency: string,
      specialInstructions?: string,
      language = 'en',
      voiceId?: string
    ) => {
      return apiService.post(`/api/elevenlabs/healthcare/medication-instructions`, {
        patientName,
        medicationName,
        dosage,
        frequency,
        specialInstructions,
        language,
        voiceId
      });
    },
    
    // Generate post-vaccination care instructions
    generatePostVaccinationCare: async (
      childName: string,
      vaccineName: string,
      language = 'en',
      voiceId?: string
    ) => {
      return apiService.post(`/api/elevenlabs/healthcare/post-vaccination-care`, {
        childName,
        vaccineName,
        language,
        voiceId
      });
    },
  },
  
  // Mock data for development (when API is not available)
  mock: {
    // Get mock voices
    getMockVoices: () => {
      return {
        voices: [
          {
            voice_id: "pNInz6obpgDQGcFmaJgB",
            name: "Rachel",
            samples: [
              {
                sample_id: "sample1",
                file_name: "sample1.mp3",
                mime_type: "audio/mpeg",
                size_bytes: 12345,
                hash: "hash1"
              }
            ],
            category: "premade",
            fine_tuning: {
              model_id: "eleven_monolingual_v1",
              is_allowed_to_fine_tune: true,
              fine_tuning_requested: false,
              finetuning_state: "not_started",
              verification_attempts: 0,
              verification_failures: 0,
              verification_attempts_count: 0
            },
            labels: {
              accent: "american",
              age: "young",
              gender: "female",
              "use case": "healthcare"
            },
            description: "A warm, friendly female voice perfect for healthcare communication",
            preview_url: "https://api.elevenlabs.io/v1/voices/pNInz6obpgDQGcFmaJgB/preview"
          },
          {
            voice_id: "jBpfuIE2acCO8z3wKNLl",
            name: "Michael",
            samples: [
              {
                sample_id: "sample2",
                file_name: "sample2.mp3",
                mime_type: "audio/mpeg",
                size_bytes: 23456,
                hash: "hash2"
              }
            ],
            category: "premade",
            fine_tuning: {
              model_id: "eleven_monolingual_v1",
              is_allowed_to_fine_tune: true,
              fine_tuning_requested: false,
              finetuning_state: "not_started",
              verification_attempts: 0,
              verification_failures: 0,
              verification_attempts_count: 0
            },
            labels: {
              accent: "american",
              age: "middle_aged",
              gender: "male",
              "use case": "healthcare"
            },
            description: "A clear, authoritative male voice ideal for medical instructions",
            preview_url: "https://api.elevenlabs.io/v1/voices/jBpfuIE2acCO8z3wKNLl/preview"
          }
        ]
      };
    },
    
    // Generate mock audio URL
    generateMockAudioUrl: (text: string, voiceId: string) => {
      // In a real implementation, this would call the Eleven Labs API
      // For mock purposes, we'll just return a fake URL
      return {
        success: true,
        audioUrl: `https://api.example.com/audio/generated-${Date.now()}.mp3`,
        duration: Math.random() * 10 + 5 // Random duration between 5-15 seconds
      };
    }
  }
};

export default elevenLabsApi;