import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Sparkles, Send, Bot, User, Brain, AlertTriangle } from 'lucide-react';

export const AIPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: "Hello! I am your RestaurantOS AI Consultant. I have analyzed your today's data: sales are up 12% compared to last Thursday, but we are running low on Salmon and Tomatoes. How can I help you today?" }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMsg = { id: messages.length + 1, role: 'user', text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Mock bot reply
    setTimeout(() => {
      const botMsg = { 
        id: messages.length + 2, 
        role: 'bot', 
        text: "I recommend ordering 15kg of Salmon from Supplier 'Ocean Fresh' to cover weekend demand. Based on historic weather forecast (sunny, 22°C), guest visits will spike by 18%." 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary animate-pulse" /> AI Business Assistant
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Predictive analytics, recipe suggestions, and automated inventory forecasting powered by local LLM nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Panel */}
          <Card className="lg:col-span-2 flex flex-col h-[500px] p-0 overflow-hidden bg-white dark:bg-zinc-950">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-card">
                  <Brain className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Local LLM Chat Server</h4>
                  <span className="text-[9px] text-emerald-500 font-bold">● ONLINE • Llama-3-8B-Instruct</span>
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
                  <div className={`p-3 rounded-card text-xs leading-relaxed ${
                    msg.role === 'bot' 
                      ? 'bg-slate-50 border border-slate-100 text-slate-800 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-200' 
                      : 'bg-primary text-white'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex space-x-2">
              <input
                type="text"
                placeholder="Ask about sales predictions, recipe food costs..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:focus:ring-primary"
              />
              <Button onClick={handleSend} variant="primary" className="py-2.5"><Send className="h-4 w-4" /></Button>
            </div>
          </Card>

          {/* Quick Insights Cards */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Sales Prediction
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-card space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">WEEKEND REVENUE FORECAST</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">$18,420.00 (±$500)</p>
                  <p className="text-[10px] text-emerald-500 font-semibold">↑ 8% growth vs last weekend</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-red-500" /> Demand Alerts
              </h4>
              <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <p>⚠️ **Salmon shortage** expected by Saturday noon based on cooking rate.</p>
                <p>📈 **Ribeye Steak velocity** has risen 22% this week; adjust order volumes.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIPage;
