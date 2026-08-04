import { useState } from 'react';
import { 
  Code, 
  FileText, 
  Shield, 
  Database, 
  Globe, 
  Brain, 
  CreditCard,
  MessageSquare,
  QrCode,
  Copy,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApiEndpoint {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  parameters?: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  responseExample?: string;
  requestExample?: string;
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoints: ApiEndpoint[];
}

const ApiDocumentationPage = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const apiCategories: ApiCategory[] = [
    {
      id: 'blockchain',
      name: 'Blockchain API',
      description: 'APIs for blockchain verification and tokenization of healthcare records',
      icon: <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      endpoints: [
        {
          name: 'Verify Vaccination Record',
          description: 'Verify a vaccination record on the blockchain',
          method: 'GET',
          url: '/api/blockchain/verify/vaccination/{recordId}',
          parameters: [
            {
              name: 'recordId',
              type: 'string',
              description: 'ID of the vaccination record to verify',
              required: true
            }
          ],
          responseExample: `{
  "isVerified": true,
  "status": "verified",
  "timestamp": "2024-07-15T10:30:00Z",
  "blockNumber": 12345678,
  "transactionHash": "0x7f9e8d...6b2c1a",
  "issuer": {
    "id": "hw_001",
    "name": "Dr. Sarah Johnson",
    "role": "doctor",
    "organization": "City Pediatrics",
    "licenseVerified": true
  },
  "data": {
    "recordType": "vaccination",
    "recordId": "vax_123456",
    "childName": "Jacob Williams",
    "vaccineName": "DTaP",
    "dateAdministered": "2024-06-15",
    "doseNumber": 1
  }
}`
        },
        {
          name: 'Tokenize Medical Invoice',
          description: 'Tokenize a medical invoice on the blockchain',
          method: 'POST',
          url: '/api/blockchain/tokenize/invoice',
          requestExample: `{
  "invoiceId": "inv_123456",
  "providerId": "p1",
  "providerName": "City Pediatrics",
  "patientId": "1",
  "patientName": "Jacob Williams",
  "service": "Annual Check-up and Vaccinations",
  "amount": 350,
  "currency": "USD",
  "issueDate": "2024-08-20",
  "dueDate": "2024-09-20"
}`,
          responseExample: `{
  "success": true,
  "tokenId": "0xabc...123",
  "blockchainHash": "0x7a8b9c...1d2e3f",
  "tokenizationDate": "2024-08-21T14:30:00Z",
  "status": "tokenized"
}`
        }
      ]
    },
    {
      id: 'health',
      name: 'Health API',
      description: 'APIs for healthcare data, providers, and medical records',
      icon: <FileText className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />,
      endpoints: [
        {
          name: 'Get Recommended Vaccine Schedule',
          description: 'Get the recommended vaccination schedule based on child age',
          method: 'GET',
          url: '/api/health/vaccinations/schedule',
          parameters: [
            {
              name: 'age',
              type: 'number',
              description: 'Age of the child in months',
              required: true
            },
            {
              name: 'region',
              type: 'string',
              description: 'Region code (default: US)',
              required: false
            }
          ],
          responseExample: `{
  "childAge": 12,
  "region": "US",
  "recommendedVaccines": [
    {
      "name": "DTaP",
      "doseNumber": 3,
      "recommendedAgeRange": "12-15 months",
      "description": "Diphtheria, Tetanus, Pertussis"
    },
    {
      "name": "Hib",
      "doseNumber": 4,
      "recommendedAgeRange": "12-15 months",
      "description": "Haemophilus influenzae type b"
    }
  ]
}`
        },
        {
          name: 'Search Nearby Health Centers',
          description: 'Find healthcare facilities near a location',
          method: 'GET',
          url: '/api/health/providers/nearby',
          parameters: [
            {
              name: 'lat',
              type: 'number',
              description: 'Latitude coordinate',
              required: true
            },
            {
              name: 'lng',
              type: 'number',
              description: 'Longitude coordinate',
              required: true
            },
            {
              name: 'radius',
              type: 'number',
              description: 'Search radius in miles (default: 10)',
              required: false
            }
          ],
          responseExample: `{
  "centers": [
    {
      "id": "1",
      "name": "City Pediatrics",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "phone": "(212) 555-1234",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "distance": 0.5,
      "availableVaccines": ["DTaP", "MMR", "Polio", "Hepatitis B"]
    }
  ]
}`
        }
      ]
    },
    {
      id: 'fhir',
      name: 'FHIR API',
      description: 'Healthcare data exchange using FHIR standards',
      icon: <Database className="h-6 w-6 text-accent-600 dark:text-accent-400" />,
      endpoints: [
        {
          name: 'Get Patient',
          description: 'Retrieve patient information using FHIR standard',
          method: 'GET',
          url: '/api/fhir/Patient/{patientId}',
          parameters: [
            {
              name: 'patientId',
              type: 'string',
              description: 'ID of the patient to retrieve',
              required: true
            }
          ],
          responseExample: `{
  "resourceType": "Patient",
  "id": "patient123",
  "name": [
    {
      "use": "official",
      "family": "Williams",
      "given": ["Jacob"]
    }
  ],
  "gender": "male",
  "birthDate": "2020-05-15"
}`
        },
        {
          name: 'Get Patient Immunizations',
          description: 'Retrieve immunization records for a patient',
          method: 'GET',
          url: '/api/fhir/Immunization',
          parameters: [
            {
              name: 'patient',
              type: 'string',
              description: 'Patient ID to retrieve immunizations for',
              required: true
            }
          ],
          responseExample: `{
  "resourceType": "Bundle",
  "type": "searchset",
  "entry": [
    {
      "resource": {
        "resourceType": "Immunization",
        "id": "imm123",
        "status": "completed",
        "vaccineCode": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/sid/cvx",
              "code": "20",
              "display": "DTaP"
            }
          ],
          "text": "DTaP"
        },
        "patient": {
          "reference": "Patient/patient123"
        },
        "occurrenceDateTime": "2023-06-15",
        "primarySource": true
      }
    }
  ]
}`
        }
      ]
    },
    {
      id: 'ai',
      name: 'AI Health Assistant API',
      description: 'AI-powered healthcare assistance and insights',
      icon: <Brain className="h-6 w-6 text-success-600 dark:text-success-400" />,
      endpoints: [
        {
          name: 'Ask Health Question',
          description: 'Ask a health-related question to the AI assistant',
          method: 'POST',
          url: '/api/ai/health-assistant/ask',
          requestExample: `{
  "question": "What vaccines are recommended for a 5-year-old?",
  "patientContext": {
    "patientAge": 5,
    "patientGender": "male",
    "medicalConditions": ["Asthma"],
    "allergies": ["Peanuts"]
  }
}`,
          responseExample: `{
  "answer": "For a 5-year-old child, the recommended vaccines include: DTaP (5th dose), IPV (4th dose), MMR (2nd dose), Varicella (2nd dose), and annual influenza vaccine. Given the child's asthma, the influenza vaccine is particularly important. Always consult with your healthcare provider for personalized recommendations, especially considering any allergies.",
  "sources": [
    {
      "name": "CDC Immunization Schedule",
      "url": "https://www.cdc.gov/vaccines/schedules/index.html"
    }
  ]
}`
        },
        {
          name: 'Analyze Symptoms',
          description: 'Analyze symptoms for possible conditions',
          method: 'POST',
          url: '/api/ai/health-assistant/symptoms',
          requestExample: `{
  "symptoms": ["fever", "cough", "fatigue"],
  "patientInfo": {
    "age": 5,
    "gender": "male",
    "duration": "3 days"
  }
}`,
          responseExample: `{
  "analysis": "The symptoms described (fever, cough, fatigue) could be consistent with several conditions including common cold, influenza, or COVID-19. For a 5-year-old child with these symptoms for 3 days, it's important to monitor temperature and ensure adequate hydration.",
  "recommendations": [
    "Consult with a healthcare provider for proper diagnosis",
    "Monitor temperature and keep the child hydrated",
    "Rest is important for recovery"
  ],
  "disclaimer": "This is not a medical diagnosis. Please consult with a healthcare professional for proper evaluation and treatment."
}`
        }
      ]
    },
    {
      id: 'finance',
      name: 'Healthcare Finance API',
      description: 'APIs for medical invoice tokenization and financing',
      icon: <CreditCard className="h-6 w-6 text-warning-600 dark:text-warning-400" />,
      endpoints: [
        {
          name: 'Get Invoice Details',
          description: 'Retrieve details of a medical invoice',
          method: 'GET',
          url: '/api/finance/invoices/{invoiceId}',
          parameters: [
            {
              name: 'invoiceId',
              type: 'string',
              description: 'ID of the invoice to retrieve',
              required: true
            }
          ],
          responseExample: `{
  "id": "1",
  "providerId": "p1",
  "providerName": "City Pediatrics",
  "patientId": "1",
  "patientName": "Jacob Williams",
  "service": "Annual Check-up and Vaccinations",
  "amount": 350,
  "currency": "USD",
  "issueDate": "2023-08-20",
  "dueDate": "2023-09-20",
  "status": "tokenized",
  "tokenId": "0xabc...123",
  "blockchainHash": "0x7a8b9c...1d2e3f",
  "tokenizationDate": "2023-08-21",
  "fundingOptions": {
    "minFundingAmount": 300,
    "interestRate": 5,
    "fundingPeriod": 30
  }
}`
        },
        {
          name: 'Fund Invoice',
          description: 'Fund a tokenized medical invoice',
          method: 'POST',
          url: '/api/finance/funding/fund',
          requestExample: `{
  "invoiceId": "1",
  "amount": 300,
  "funderId": "funder123"
}`,
          responseExample: `{
  "success": true,
  "transactionId": "tx_123456",
  "blockchainHash": "0x1a2b3c...4d5e6f",
  "status": "funded",
  "fundedAmount": 300,
  "fundedDate": "2024-08-25T14:30:00Z",
  "expectedRepayment": {
    "amount": 315,
    "date": "2024-09-25T14:30:00Z"
  }
}`
        }
      ]
    },
    {
      id: 'qrcode',
      name: 'QR Code API',
      description: 'APIs for generating and scanning healthcare QR codes',
      icon: <QrCode className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />,
      endpoints: [
        {
          name: 'Generate Vaccination QR Code',
          description: 'Generate a QR code for a vaccination record',
          method: 'POST',
          url: '/api/qrcode/generate/vaccination',
          requestExample: `{
  "vaccinationData": {
    "id": "vax_123456",
    "childIdHash": "ch_abc123def456",
    "vaccineName": "DTaP",
    "dateAdministered": "2024-06-15",
    "doseNumber": 1,
    "provider": "Dr. Sarah Johnson",
    "location": "City Pediatrics",
    "blockchainHash": "0x7f9e8d...6b2c1a"
  }
}`,
          responseExample: `{
  "qrCodeData": "MEDFI:VAX:H4sIAAAAAAAAA5VRy27CMBD8lz3nEJKQhNyQEKrUQ6VKPVSVkGsvwSK2I9tpggh/7zoJqOqh99U8dmZ29vCGDFnA0WXIYUuOHJbgwZGBh1DKUqaQgYcNbKHgHAyZQsE3UBZcZuBhBwWvVQEGjOTAa8h5CQXMwcABDOxLXsEaPGxhBxuVQ8FrMFBCwSuVwxw8HMGQOWSwAw8nsGQBBa/IkCUZcgQPZ7BkBYbMwJATeNiDhyNYUoKBPXg4gSVr8HAmSzZkyQoMWYCHAxmyJEPWZMkGPJzBkjUYsgBDjuDhAB6OYMkGDNmDhxNYsgFDZmTIigw5gYcDeDiCJRswZA8eTmDJBgyZkSErMuQEHg7g4QiWbMCQPXg4gSUbMGRGhqzIkBN4OICHoxhyBA9HsGQDhuzBwwksWYMhMzJkRYacwMMBPBzBkg0YsgcPJ7BkA4bMyJAVGXICD4cP+AdHbQvQAgIAAA==",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAklEQVR4AewaftIAAA..."
}`
        },
        {
          name: 'Parse QR Code',
          description: 'Parse and validate a MedFiNet QR code',
          method: 'POST',
          url: '/api/qrcode/parse',
          requestExample: `{
  "qrData": "MEDFI:VAX:H4sIAAAAAAAAA5VRy27CMBD8lz3nEJKQhNyQEKrUQ6VKPVSVkGsvwSK2I9tpggh/7zoJqOqh99U8dmZ29vCGDFnA0WXIYUuOHJbgwZGBh1DKUqaQgYcNbKHgHAyZQsE3UBZcZuBhBwWvVQEGjOTAa8h5CQXMwcABDOxLXsEaPGxhBxuVQ8FrMFBCwSuVwxw8HMGQOWSwAw8nsGQBBa/IkCUZcgQPZ7BkBYbMwJATeNiDhyNYUoKBPXg4gSVr8HAmSzZkyQoMWYCHAxmyJEPWZMkGPJzBkjUYsgBDjuDhAB6OYMkGDNmDhxNYsgFDZmTIigw5gYcDeDiCJRswZA8eTmDJBgyZkSErMuQEHg7g4QiWbMCQPXg4gSUbMGRGhqzIkBN4OICHoxhyBA9HsGQDhuzBwwksWYMhMzJkRYacwMMBPBzBkg0YsgcPJ7BkA4bMyJAVGXICD4cP+AdHbQvQAgIAAA=="
}`,
          responseExample: `{
  "type": "VAX",
  "data": {
    "id": "vax_123456",
    "childIdHash": "ch_abc123def456",
    "vaccineName": "DTaP",
    "dateAdministered": "2024-06-15",
    "doseNumber": 1,
    "provider": "Dr. Sarah Johnson",
    "location": "City Pediatrics",
    "blockchainHash": "0x7f9e8d...6b2c1a"
  }
}`
        }
      ]
    },
    {
      id: 'ussd',
      name: 'USSD API',
      description: 'APIs for USSD integration for rural healthcare access',
      icon: <MessageSquare className="h-6 w-6 text-error-600 dark:text-error-400" />,
      endpoints: [
        {
          name: 'Process USSD Request',
          description: 'Process a USSD request from a mobile network',
          method: 'POST',
          url: '/api/ussd/process',
          requestExample: `{
  "sessionId": "ATU_123456789",
  "serviceCode": "*123#",
  "phoneNumber": "+254712345678",
  "text": "1*2"
}`,
          responseExample: `{
  "response": "CON Welcome to MedFiNet\n1. Check vaccination status\n2. Find nearest health center\n3. Set vaccination reminder\n4. Speak to health worker",
  "action": "prompt"
}`
        },
        {
          name: 'Check Vaccination Status',
          description: 'Check vaccination status via USSD',
          method: 'POST',
          url: '/api/ussd/vaccination-status',
          requestExample: `{
  "sessionId": "ATU_123456789",
  "phoneNumber": "+254712345678",
  "childId": "CH12345"
}`,
          responseExample: `{
  "response": "END Child: Jacob Williams\nAge: 4 years\nVaccinations:\n- DTaP: Complete (4/4)\n- MMR: Complete (2/2)\n- Polio: Due on 15/08/2024",
  "action": "end"
}`
        }
      ]
    },
    {
      id: 'elevenlabs',
      name: 'Eleven Labs API',
      description: 'Voice AI integration for healthcare communication',
      icon: <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      endpoints: [
        {
          name: 'Text to Speech',
          description: 'Convert text to natural-sounding speech',
          method: 'POST',
          url: '/api/elevenlabs/text-to-speech',
          requestExample: `{
  "text": "Your child's next vaccination appointment is scheduled for August 15th at City Pediatrics. Please remember to bring your vaccination card.",
  "voiceId": "pNInz6obpgDQGcFmaJgB",
  "language": "en",
  "outputFormat": "mp3"
}`,
          responseExample: `{
  "success": true,
  "audioUrl": "https://api.example.com/audio/generated-12345.mp3",
  "duration": 12.5
}`
        },
        {
          name: 'Get Available Voices',
          description: 'Get list of available voices for text-to-speech',
          method: 'GET',
          url: '/api/elevenlabs/voices',
          responseExample: `{
  "voices": [
    {
      "id": "pNInz6obpgDQGcFmaJgB",
      "name": "Rachel",
      "gender": "female",
      "language": "en",
      "preview": "https://api.example.com/audio/preview-rachel.mp3"
    },
    {
      "id": "jBpfuIE2acCO8z3wKNLl",
      "name": "Michael",
      "gender": "male",
      "language": "en",
      "preview": "https://api.example.com/audio/preview-michael.mp3"
    }
  ]
}`
        }
      ]
    }
  ];

  // Filter categories and endpoints based on search term
  const filteredCategories = apiCategories.map(category => {
    const filteredEndpoints = category.endpoints.filter(endpoint => 
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return {
      ...category,
      endpoints: filteredEndpoints
    };
  }).filter(category => category.endpoints.length > 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const toggleEndpoint = (endpointName: string) => {
    if (expandedEndpoint === endpointName) {
      setExpandedEndpoint(null);
    } else {
      setExpandedEndpoint(endpointName);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            API Documentation
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Explore and integrate with MedFiNet's comprehensive healthcare APIs
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search APIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* API Categories */}
        <div className="space-y-6">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
              >
                <div 
                  className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center">
                    {category.icon}
                    <div className="ml-3">
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{category.name}</h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{category.description}</p>
                    </div>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronDown className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  )}
                </div>
                
                {expandedCategory === category.id && (
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {category.endpoints.map((endpoint) => (
                      <div key={endpoint.name} className="p-6">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleEndpoint(endpoint.name)}
                        >
                          <div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                                endpoint.method === 'GET' ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300' :
                                endpoint.method === 'POST' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300' :
                                endpoint.method === 'PUT' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' :
                                'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300'
                              }`}>
                                {endpoint.method}
                              </span>
                              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">{endpoint.name}</h3>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-1">{endpoint.description}</p>
                          </div>
                          {expandedEndpoint === endpoint.name ? (
                            <ChevronDown className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                          )}
                        </div>
                        
                        {expandedEndpoint === endpoint.name && (
                          <div className="mt-4 space-y-4">
                            <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Endpoint URL</h4>
                                <button 
                                  onClick={() => handleCopyCode(endpoint.url)}
                                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                              <code className="block mt-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto">
                                {endpoint.url}
                              </code>
                            </div>
                            
                            {endpoint.parameters && endpoint.parameters.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">Parameters</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                                    <thead className="bg-neutral-50 dark:bg-neutral-700">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Required</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                      {endpoint.parameters.map((param, index) => (
                                        <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">{param.name}</td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">{param.type}</td>
                                          <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{param.description}</td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                                            {param.required ? (
                                              <span className="text-error-600 dark:text-error-400">Yes</span>
                                            ) : (
                                              <span className="text-neutral-500 dark:text-neutral-400">No</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            
                            {endpoint.requestExample && (
                              <div>
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Request Example</h4>
                                  <button 
                                    onClick={() => handleCopyCode(endpoint.requestExample!)}
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                                <pre className="mt-2 p-4 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto">
                                  {endpoint.requestExample}
                                </pre>
                              </div>
                            )}
                            
                            {endpoint.responseExample && (
                              <div>
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Response Example</h4>
                                  <button 
                                    onClick={() => handleCopyCode(endpoint.responseExample!)}
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                                <pre className="mt-2 p-4 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto">
                                  {endpoint.responseExample}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
              <Code className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                No APIs found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                {searchTerm ? "No APIs match your search criteria" : "No APIs available"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* API Integration Resources */}
        <div className="mt-12 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
            API Integration Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="#"
              className="flex items-start p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
            >
              <Code className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Getting Started Guide
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                  Step-by-step guide to integrating with MedFiNet APIs
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            </a>
            
            <a
              href="#"
              className="flex items-start p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
            >
              <Globe className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  API Reference
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                  Complete API reference documentation
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            </a>
            
            <a
              href="#"
              className="flex items-start p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
            >
              <FileText className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  SDK Libraries
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                  Client libraries for multiple programming languages
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            </a>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentationPage;