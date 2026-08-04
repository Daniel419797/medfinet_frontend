import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Trash2, 
  Download,
  Zap,
  Brain,
  Stethoscope,
  Shield,
  Info
} from 'lucide-react';
import openaiApi from '../../services/openaiApi';
import useApi from '../../hooks/useApi';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface HealthContext {
  patientAge?: number;
  patientGender?: string;
  medicalConditions?: string[];
  allergies?: string[];
  currentMedications?: string[];
  recentVaccinations?: string[];
}

const OpenAiApiExample = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are a helpful healthcare assistant that provides accurate medical information and advice. Always remind users to consult healthcare professionals for medical advice.'
    },
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI health assistant. I can help answer questions about vaccines, general health information, and medical topics. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [healthContext, setHealthContext] = useState<HealthContext>({
    patientAge: 5,
    patientGender: 'male',
    medicalConditions: ['Asthma'],
    allergies: ['Peanuts'],
    currentMedications: ['Albuterol'],
    recentVaccinations: ['DTaP (2 months ago)']
  });
  const [useContext, setUseContext] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Use our custom hook for the OpenAI API
  const {
    execute: sendMessage,
    isLoading: isSending,
    error: sendError,
  } = useApi(openaiApi.healthAssistant.askQuestion);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const context = useContext ? healthContext : undefined;
      const response = await sendMessage(input, context);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer || "I'm sorry, I couldn't process your request at this time.",
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, there was an error processing your request. Please try again later.",
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        role: 'system',
        content: 'You are a helpful healthcare assistant that provides accurate medical information and advice. Always remind users to consult healthcare professionals for medical advice.'
      },
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI health assistant. I can help answer questions about vaccines, general health information, and medical topics. How can I assist you today?'
      }
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          AI Health Assistant API
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Interact with the OpenAI-powered health assistant for medical information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Health Context Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-neutral-900 dark:text-white">Health Context</h3>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useContext} 
                    onChange={() => setUseContext(!useContext)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            
            <div className={`space-y-4 ${useContext ? 'opacity-100' : 'opacity-50'}`}>
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Patient</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Age</label>
                    <input
                      type="number"
                      value={healthContext.patientAge}
                      onChange={(e) => setHealthContext({...healthContext, patientAge: parseInt(e.target.value)})}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      disabled={!useContext}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">Gender</label>
                    <select
                      value={healthContext.patientGender}
                      onChange={(e) => setHealthContext({...healthContext, patientGender: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                      disabled={!useContext}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Medical Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {healthContext.medicalConditions?.map((condition, index) => (
                    <div key={index} className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs flex items-center">
                      <span>{condition}</span>
                      {useContext && (
                        <button
                          onClick={() => setHealthContext({
                            ...healthContext,
                            medicalConditions: healthContext.medicalConditions?.filter((_, i) => i !== index)
                          })}
                          className="ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {useContext && (
                    <button
                      onClick={() => {
                        const condition = prompt('Enter medical condition');
                        if (condition) {
                          setHealthContext({
                            ...healthContext,
                            medicalConditions: [...(healthContext.medicalConditions || []), condition]
                          });
                        }
                      }}
                      className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Allergies</h4>
                <div className="flex flex-wrap gap-2">
                  {healthContext.allergies?.map((allergy, index) => (
                    <div key={index} className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs flex items-center">
                      <span>{allergy}</span>
                      {useContext && (
                        <button
                          onClick={() => setHealthContext({
                            ...healthContext,
                            allergies: healthContext.allergies?.filter((_, i) => i !== index)
                          })}
                          className="ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {useContext && (
                    <button
                      onClick={() => {
                        const allergy = prompt('Enter allergy');
                        if (allergy) {
                          setHealthContext({
                            ...healthContext,
                            allergies: [...(healthContext.allergies || []), allergy]
                          });
                        }
                      }}
                      className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Recent Vaccinations</h4>
                <div className="flex flex-wrap gap-2">
                  {healthContext.recentVaccinations?.map((vaccination, index) => (
                    <div key={index} className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs flex items-center">
                      <span>{vaccination}</span>
                      {useContext && (
                        <button
                          onClick={() => setHealthContext({
                            ...healthContext,
                            recentVaccinations: healthContext.recentVaccinations?.filter((_, i) => i !== index)
                          })}
                          className="ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {useContext && (
                    <button
                      onClick={() => {
                        const vaccination = prompt('Enter vaccination (e.g. "MMR (2 months ago)")');
                        if (vaccination) {
                          setHealthContext({
                            ...healthContext,
                            recentVaccinations: [...(healthContext.recentVaccinations || []), vaccination]
                          });
                        }
                      }}
                      className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                  <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">AI Health Assistant</h3>
                  <p className="text-sm text-success-600 dark:text-success-400 flex items-center">
                    <div className="h-2 w-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
                    Powered by OpenAI
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <button
                  onClick={clearConversation}
                  className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  title="Clear conversation"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.filter(m => m.role !== 'system').map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-700 px-4 py-2 rounded-lg">
                    <Bot className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about vaccines, health conditions, or medical advice..."
                    className="w-full px-4 py-2 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white resize-none"
                    rows={1}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white p-2 rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "What vaccines are recommended for a 5-year-old?",
                  "What are the side effects of the DTaP vaccine?",
                  "How can I manage my child's asthma?",
                  "When should I be concerned about a fever?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="text-xs px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                  About the AI Health Assistant
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  This AI assistant provides general health information and is not a substitute for professional medical advice. 
                  Always consult with a healthcare provider for medical concerns. The assistant uses OpenAI's API and can provide 
                  information about vaccines, general health topics, and preventive care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAiApiExample;