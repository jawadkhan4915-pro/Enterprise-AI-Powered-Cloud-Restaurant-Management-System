import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { Sparkles, Send, Bot, User, Brain, AlertTriangle, RefreshCw } from 'lucide-react';

export const AIPage = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: "Hello! I am your RestaurantOS AI Consultant. I have analyzed your sales patterns and inventory status. How can I help optimize your operations today?" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  
  // Insights panel states
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetchPredictiveInsights();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPredictiveInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await api.get('/ai/insights');
      setInsights(res.data.data.analysis);
    } catch {
      // Fallback local info if mock fails
      setInsights(`### Operations Forecast:
- **Weekend Revenue Projection**: $18,420.00 (±$500)
- **Stock Alert**: Salmon usage rates require replenishing within 3 days.
- **Top Category Growth**: Seafood & Main courses.`);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || loadingChat) return;

    const userText = inputVal;
    const userMsg = { id: Date.now(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoadingChat(true);

    try {
      const res = await api.post('/ai/chat', { prompt: userText });
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: res.data.data.reply,
        model: res.data.data.model,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      dispatch(addToast({ message: 'Error generating AI response', type: 'error' }));
      const errorMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Sorry, I encountered an issue connecting to the AI node. Please ensure your local or cloud provider settings are correct.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-primary animate-pulse" /> AI Business Assistant
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Predictive analytics, operational forecasting, and menu engineering recommendations.
            </p>
          </div>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchPredictiveInsights} loading={loadingInsights}>
            Recalculate Projections
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Panel */}
          <Card className="lg:col-span-2 flex flex-col h-[520px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 shadow-soft">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-card">
                  <Brain className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Operational Copilot</h4>
                  <span className="text-[9px] text-emerald-500 font-bold">● ONLINE • Context-Aware RAG</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex space-x-3.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-card shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'bot' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}>
                    {msg.role === 'bot' ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>
                  <div className="space-y-1">
                    <div className={`p-3 rounded-card text-xs leading-relaxed ${
                      msg.role === 'bot' 
                        ? 'bg-slate-50 border border-slate-100 text-slate-800 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-200' 
                        : 'bg-primary text-white'
                    }`}>
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                    {msg.model && (
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-right px-1">Powered by: {msg.model}</p>
                    )}
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex space-x-3.5 max-w-[85%]">
                  <div className="h-8 w-8 rounded-card shrink-0 flex items-center justify-center bg-primary/10 text-primary">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 dark:bg-zinc-900/50 dark:border-zinc-800 p-3 rounded-card">
                    <div className="flex space-x-1.5 py-1">
                      <div className="w-2 h-2 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex space-x-2">
              <input
                type="text"
                placeholder="Ask about sales predictions, recipe food costs, low stock alerts..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={loadingChat}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:focus:ring-primary"
              />
              <Button type="submit" variant="primary" className="py-2.5" disabled={loadingChat}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>

          {/* Quick Insights Cards */}
          <div className="space-y-6">
            <Card className="space-y-4 border border-slate-100 dark:border-zinc-900 shadow-soft">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                <Brain className="h-4 w-4 mr-1.5 text-primary" /> Predictive Projections
              </h4>
              {loadingInsights ? (
                <div className="space-y-3">
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="rectangular" height={80} />
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400 space-y-2 whitespace-pre-line">
                  {insights}
                </div>
              )}
            </Card>

            <Card className="space-y-4 border border-slate-100 dark:border-zinc-900 shadow-soft">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500 animate-pulse" /> Operational Velocity
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-red-50/50 border border-red-100 dark:bg-red-950/10 dark:border-red-900/30 rounded-card">
                  <p className="font-bold text-red-700 dark:text-red-400">Critical Stock Warning</p>
                  <p className="text-[10px] text-red-500 mt-0.5">Salmon fillet has dropped to 10kg, matching the alert threshold.</p>
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30 rounded-card">
                  <p className="font-bold text-amber-700 dark:text-amber-400">Menu Velocity Alert</p>
                  <p className="text-[10px] text-amber-550 mt-0.5">Pasta Penne sales are up 18% today. Monitor inventory replenishment speed.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIPage;
