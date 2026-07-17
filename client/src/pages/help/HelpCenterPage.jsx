import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { HelpCircle, Search, Keyboard, BookOpen, MessageSquare, PhoneCall, ChevronDown, ChevronUp } from 'lucide-react';

export const HelpCenterPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How do I switch AI engines?",
      a: "Navigate to Settings > AI Settings tab. From there, select your preferred provider (none/mock, OpenAI, Ollama, LM Studio, or OpenRouter). You can input API keys and customize endpoint parameters dynamically without restarting the server."
    },
    {
      q: "How does offline support work in POS?",
      a: "The POS system stores orders in your browser's local cache if a connection drop is detected. Once the connection is re-established, the cache is automatically synced back to the MongoDB cloud database."
    },
    {
      q: "How do I configure kitchen printing tickets?",
      a: "Go to Settings > Receipt Printers. Add your network or USB printer configuration. You can specify whether to print full receipts or split item tickets for different kitchen stations."
    },
    {
      q: "What local LLM models are recommended?",
      a: "We recommend Llama-3 (8B) or Gemma-2 (9B) running via Ollama, or DeepSeek-Coder-7B running on LM Studio. These provide the best balance between execution speed and reasoning quality for restaurant diagnostics."
    }
  ];

  const shortcuts = [
    { keys: ["Ctrl", "Alt", "P"], desc: "Open Touch POS module" },
    { keys: ["Ctrl", "Alt", "K"], desc: "Open Kitchen Display screen" },
    { keys: ["Ctrl", "Alt", "A"], desc: "Trigger AI Business assistant panel" },
    { keys: ["Ctrl", "Alt", "S"], desc: "Navigate to general Settings page" }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
            <HelpCircle className="h-6 w-6 mr-2 text-primary" /> Help & Support Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse guides, view system keyboard shortcuts, or contact technical support.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Search help articles or FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-input bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus:ring-primary shadow-soft"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Column */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                <BookOpen className="h-4.5 w-4.5 mr-2 text-primary" /> Frequently Asked Questions
              </h3>
              
              <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                  <p className="text-xs text-slate-450 text-center py-4 font-semibold">No matches found for your search.</p>
                ) : (
                  filteredFaqs.map((faq, idx) => (
                    <div key={idx} className="border border-slate-100 dark:border-zinc-900 rounded-card overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex justify-between items-center p-3 text-left text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-50/50 dark:bg-zinc-900/30 hover:bg-slate-55 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {openFaq === idx ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </button>
                      {openFaq === idx && (
                        <div className="p-3 text-xs leading-relaxed text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-900/70 bg-white dark:bg-zinc-950">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Keyboard Shortcuts Card */}
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                <Keyboard className="h-4.5 w-4.5 mr-2 text-primary" /> Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shortcuts.map((sh, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 dark:border-zinc-900/70 rounded-card bg-slate-50/30 dark:bg-zinc-900/10">
                    <span className="text-xs text-slate-600 dark:text-zinc-450 font-semibold">{sh.desc}</span>
                    <div className="flex space-x-1.5">
                      {sh.keys.map((k, kIdx) => (
                        <kbd key={kIdx} className="px-2 py-0.5 text-[9px] font-mono font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded shadow-sm text-slate-600 dark:text-zinc-300">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Contact Support Column */}
          <div className="space-y-6">
            <Card className="space-y-4 border border-slate-100 dark:border-zinc-900 shadow-soft">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Contact Support</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Need immediate help with hardware integration or account settings? Our team is available 24/7.
              </p>
              
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center p-3 rounded-card bg-slate-50 dark:bg-zinc-900/40 text-xs">
                  <PhoneCall className="h-4.5 w-4.5 text-primary mr-3 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-zinc-350">Phone Helpline</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">+1 (800) 555-0199</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-card bg-slate-50 dark:bg-zinc-900/40 text-xs">
                  <MessageSquare className="h-4.5 w-4.5 text-primary mr-3 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-zinc-350">Live Ticket Support</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">support@restaurantos.ai</p>
                  </div>
                </div>
              </div>
              
              <Button variant="primary" className="w-full text-xs mt-2 py-2.5">
                Open Support Ticket
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenterPage;
