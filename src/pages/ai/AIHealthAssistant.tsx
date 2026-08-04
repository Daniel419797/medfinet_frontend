import { useCallback, useContext, useEffect, useState } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Image,
  Brain,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import UserContext from '../../contexts/UserContext';
import { medfinetAiApi } from '../../services/medfinetAiApi';
import { medfinetIdentityApi } from '../../services/medfinetIdentityApi';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIHealthAssistant = () => {
  const { organizationId } = useContext(UserContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [children, setChildren] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await medfinetIdentityApi.listChildren(organizationId, { limit: 100 });
      setChildren(result.items);
      setSelectedChildId((current) => current || result.items[0]?.id || '');
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to load child records'
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: "Hello! I'm your AI Health Assistant. I can help you with vaccination schedules, health recommendations, symptom analysis, and answer any healthcare questions you might have.",
          timestamp: new Date(),
          suggestions: [
            'Check vaccination schedule',
            'Analyze symptoms',
            'Find nearby clinics',
            'Health tips for children'
          ],
        },
      ]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !organizationId || !selectedChildId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await medfinetAiApi.askAssistant(
        organizationId,
        selectedChildId,
        { question: inputMessage, locale: 'en' }
      );

      const content =
        typeof response === 'string'
          ? response
          : typeof response === 'object' && response !== null
            ? (response as Record<string, unknown>).answer as string ||
              (response as Record<string, unknown>).message as string ||
              JSON.stringify(response)
            : 'I received your question. Please let me know how I can help further.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (reason) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content:
          reason instanceof Error
            ? reason.message
            : 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            AI Health Assistant
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Get personalized health insights and assistance powered by artificial intelligence
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1">
            {/* Child Selector */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Select Child
                </h2>
              </div>
              {loading ? (
                <p className="text-sm text-neutral-500">Loading children…</p>
              ) : (
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSuggestionClick("Check my child's vaccination schedule")}
                  className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
                >
                  <div className="flex items-center">
                    <Stethoscope className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Check Vaccination Schedule</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSuggestionClick('Analyze symptoms for my child')}
                  className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Symptom Analysis</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSuggestionClick('Find pediatric clinics near me')}
                  className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group"
                >
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 text-secondary-600 dark:text-secondary-400 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Find Clinics</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                    <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">AI Health Assistant</h3>
                    <p className="text-sm text-success-600 dark:text-success-400 flex items-center">
                      <div className="h-2 w-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-2' : 'mr-2'}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            message.type === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                          }`}>
                            {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && message.type === 'ai' && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
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
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about health and vaccinations..."
                      className="w-full px-4 py-2 pr-20 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <button
                        onClick={toggleVoiceInput}
                        className={`p-1 rounded ${isListening ? 'text-error-600' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      <button className="p-1 text-neutral-400 hover:text-neutral-600">
                        <Image className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
