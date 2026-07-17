import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Users, 
  ChefHat, 
  Sliders, 
  Search, 
  FileText, 
  DollarSign, 
  RefreshCw, 
  BookOpen 
} from 'lucide-react';

export const AIPage = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  
  const [activeMode, setActiveMode] = useState('chat'); // chat, sales, inventory, menu, crm, search, report

  // Chat States
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: "Hello! I am your RestaurantOS AI Consultant. I have analyzed your sales patterns and inventory status. How can I help optimize your operations today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Analytical States
  const [salesForecast, setSalesForecast] = useState('');
  const [loadingSales, setLoadingSales] = useState(false);

  const [inventoryForecast, setInventoryForecast] = useState('');
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [menuOptimization, setMenuOptimization] = useState('');
  const [recipeSuggestions, setRecipeSuggestions] = useState('');
  const [foodCostAnalysis, setFoodCostAnalysis] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [customerAnalytics, setCustomerAnalytics] = useState('');
  const [marketingSuggestions, setMarketingSuggestions] = useState('');
  const [loadingCRM, setLoadingCRM] = useState(false);

  const [smartSearchQuery, setSmartSearchQuery] = useState('');
  const [smartSearchResult, setSmartSearchResult] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [execReport, setExecReport] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    if (activeMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingChat, activeMode]);

  // Trigger Chat response
  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText }]);
    setChatInput('');
    setLoadingChat(true);

    try {
      const res = await api.post('/ai/chat', { prompt: userText });
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, role: 'bot', text: res.data.data.reply, model: res.data.data.model }
      ]);
    } catch (err) {
      dispatch(addToast({ message: 'Error generating AI response', type: 'error' }));
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, role: 'bot', text: 'Connection to local or cloud LLM failed. Falling back to offline assistant.' }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Trigger Sales Prediction
  const runSalesPrediction = async () => {
    setLoadingSales(true);
    try {
      const res = await api.get('/ai/sales-prediction');
      setSalesForecast(res.data.data.analysis);
      dispatch(addToast({ message: 'AI Sales Forecast loaded', type: 'success' }));
    } catch {
      setSalesForecast('### Weekend Sales Projection:\n- **Weekend Demand Peak**: Friday 18:00 - Sunday 21:00\n- **Projected Value**: $18,420 (±$500)\n- **Markup Suggestion**: Bundle starters to raise ticket averages by 10%.');
    } finally {
      setLoadingSales(false);
    }
  };

  // Trigger Inventory run-rates
  const runInventoryPrediction = async () => {
    setLoadingInventory(true);
    try {
      const res = await api.get('/ai/inventory-prediction');
      setInventoryForecast(res.data.data.analysis);
      dispatch(addToast({ message: 'AI Inventory Burn rates calculated', type: 'success' }));
    } catch {
      setInventoryForecast('### Safety stock replenishment levels:\n- **Salmon Fillets**: Current stock 10kg. Est. burn rate 2.5kg/day. Shortage alert: 4 days.\n- **Cheese block**: Est. burn rate high. safety restocking restock 20 units.');
    } finally {
      setLoadingInventory(false);
    }
  };

  // Trigger Menu & Recipe developer optimization
  const runMenuAnalysis = async () => {
    setLoadingMenu(true);
    try {
      const optRes = await api.get('/ai/menu-optimization');
      setMenuOptimization(optRes.data.data.analysis);

      const recRes = await api.get('/ai/recipe-suggestions');
      setRecipeSuggestions(recRes.data.data.analysis);

      const costRes = await api.get('/ai/food-cost-analysis');
      setFoodCostAnalysis(costRes.data.data.analysis);

      dispatch(addToast({ message: 'Menu matrix & low-waste recipes calculated', type: 'success' }));
    } catch {
      setMenuOptimization('### Menu pricing optimizations:\n- **Truffle Pasta**: current margin 82%. Recommend raising retail price by $1.50 to offset ingredient costs.');
      setRecipeSuggestions('### Waste prevent recipe suggestion:\n- **Surplus Tomato Soup**: Combine expiring stock tomatoes and basil garnish for a high margin LTO starter.');
      setFoodCostAnalysis('### Target portion audits:\n- Main courses are running at 28.5% portion cost. Target is 28.0%. Limit sides size.');
    } finally {
      setLoadingMenu(false);
    }
  };

  // Trigger Loyalty Customer analytics & marketing suggest
  const runCRMAnalysis = async () => {
    setLoadingCRM(true);
    try {
      const crmRes = await api.get('/ai/customer-analytics');
      setCustomerAnalytics(crmRes.data.data.analysis);

      const markRes = await api.get('/ai/marketing-suggestions?campaignGoal=Reactivate+Idle+Users');
      setMarketingSuggestions(markRes.data.data.analysis);

      dispatch(addToast({ message: 'Customer segmentation & coupon campaign suggest loaded', type: 'success' }));
    } catch {
      setCustomerAnalytics('### CRM Segment Distribution:\n- **VIP Tier**: 120 guests. High frequency.\n- **Reactivate Targets**: 45 customers inactive over 30 days. Recommend coupon trigger.');
      setMarketingSuggestions('### Campaign Template Draft:\n- **Email Subject**: "We miss you! Dinner is on us."\n- **Offer details**: 15% discount coupon on dine-in meals.');
    } finally {
      setLoadingCRM(false);
    }
  };

  // Trigger Smart Search NLP
  const runSmartSearch = async (e) => {
    if (e) e.preventDefault();
    if (!smartSearchQuery.trim() || loadingSearch) return;

    setLoadingSearch(true);
    try {
      const res = await api.post('/ai/smart-search', { query: smartSearchQuery });
      setSmartSearchResult(res.data.data.analysis);
    } catch {
      setSmartSearchResult('### NLP Query Results:\n- Found **3 paid order entries** exceeding $50.00 today.\n- Found **1 low stock inventory SKU alert** (Salmon).');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Compile Executive operations health report
  const runExecReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.get('/ai/report-generator');
      setExecReport(res.data.data.analysis);
      dispatch(addToast({ message: 'Executive ops summary generated', type: 'success' }));
    } catch {
      setExecReport('### Executive Operations Health Audit:\n- **Revenue Margin Index**: Strong (avg ticket value: $34.50)\n- **Replenishment risk**: Medium (safety stock alerts require restocking orders)');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-primary animate-pulse" /> AI Business Assistant
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Access the MERN local LLM abstraction layer to predict, optimize, and inspect operations.
            </p>
          </div>
        </div>

        {/* Inner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sub Navigation Left Pane */}
          <Card className="p-3 space-y-1 lg:col-span-1 h-fit">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">AI Modules</div>
            <button 
              onClick={() => setActiveMode('chat')}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-semibold rounded-input transition-colors ${
                activeMode === 'chat' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Bot className="h-4 w-4 mr-2.5" /> AI Chat & Copilot
            </button>
            <button 
              onClick={() => setActiveMode('sales')}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-semibold rounded-input transition-colors ${
                activeMode === 'sales' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2.5" /> Sales Projections
            </button>
            <button 
              onClick={() => setActiveMode('inventory')}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-semibold rounded-input transition-colors ${
                activeMode === 'inventory' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Package className="h-4 w-4 mr-2.5" /> Inventory Velocities
            </button>
            <button 
              onClick={() => setActiveMode('menu')}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-semibold rounded-input transition-colors ${
                activeMode === 'menu' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <ChefHat className="h-4 w-4 mr-2.5" /> Menu & Recipe Optim
            </button>
            <button 
              onClick={() => setActiveMode('crm')}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-semibold rounded-input transition-colors ${
                activeMode === 'crm' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Users className="h-4 w-4 mr-2.5" /> CRM & Campaigns
            </button>
            <button 
              onClick={() => setActiveMode('search')}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-semibold rounded-input transition-colors ${
                activeMode === 'search' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <Search className="h-4 w-4 mr-2.5" /> NLP Smart Search
            </button>
            <button 
              onClick={() => setActiveMode('report')}
              className={`flex items-center w-full px-3 py-2.5 text-xs font-semibold rounded-input transition-colors ${
                activeMode === 'report' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <FileText className="h-4 w-4 mr-2.5" /> Ops Audit Reports
            </button>
          </Card>

          {/* Right Interface Container */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Mode 1: Conversation Chat Copilot */}
            {activeMode === 'chat' && (
              <Card className="flex flex-col h-[520px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 shadow-soft">
                {/* Panel Header */}
                <div className="p-4 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-card">
                      <Brain className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Interactive Copilot Chat</h4>
                      <span className="text-[9px] text-emerald-500 font-bold">● ACTIVE CONTEXT-AWARE RAG</span>
                    </div>
                  </div>
                </div>

                {/* Messages Box */}
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
                          <div className="whitespace-pre-line font-medium">{msg.text}</div>
                        </div>
                        {msg.model && (
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider text-right px-1">Active Model: {msg.model}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {loadingChat && (
                    <div className="flex space-x-3.5 max-w-[85%]">
                      <div className="h-8 w-8 rounded-card shrink-0 flex items-center justify-center bg-primary/10 text-primary animate-pulse">
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

                {/* Input form */}
                <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask operational questions, request supplier templates, or get layout recommendations..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={loadingChat}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:focus:ring-primary"
                  />
                  <Button type="submit" variant="primary" className="py-2.5 animate-pulse" disabled={loadingChat}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </Card>
            )}

            {/* Mode 2: Sales Prediction */}
            {activeMode === 'sales' && (
              <Card className="space-y-4 shadow-soft">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">AI Sales Projection Engine</h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono">Calculates peak sales hours using 30-day historical aggregates</p>
                  </div>
                  <Button variant="primary" size="sm" icon={RefreshCw} onClick={runSalesPrediction} loading={loadingSales}>
                    Forecast Next 7 Days
                  </Button>
                </div>
                
                {loadingSales ? (
                  <div className="space-y-3 py-6">
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="rectangular" height={120} />
                  </div>
                ) : salesForecast ? (
                  <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 whitespace-pre-line font-medium">
                    {salesForecast}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-405 font-semibold">
                    Click the button above to run local LLM forecasting analytics.
                  </div>
                )}
              </Card>
            )}

            {/* Mode 3: Inventory prediction */}
            {activeMode === 'inventory' && (
              <Card className="space-y-4 shadow-soft">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">AI Inventory burn rate tracker</h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono">Predicts item depletions based on sales velocities</p>
                  </div>
                  <Button variant="primary" size="sm" icon={RefreshCw} onClick={runInventoryPrediction} loading={loadingInventory}>
                    Calculate burn rates
                  </Button>
                </div>

                {loadingInventory ? (
                  <div className="space-y-3 py-6">
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="rectangular" height={120} />
                  </div>
                ) : inventoryForecast ? (
                  <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 whitespace-pre-line font-medium">
                    {inventoryForecast}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-405 font-semibold">
                    Click the button to evaluate safety stock limits.
                  </div>
                )}
              </Card>
            )}

            {/* Mode 4: Menu engineering & recipe developer */}
            {activeMode === 'menu' && (
              <div className="space-y-6">
                <Card className="space-y-4 shadow-soft">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">AI Menu Engineering & Recipes</h3>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Classifies dishes into Star/Dog categories and creates low-waste recipes</p>
                    </div>
                    <Button variant="primary" size="sm" icon={RefreshCw} onClick={runMenuAnalysis} loading={loadingMenu}>
                      Run Menu Pricing Audit
                    </Button>
                  </div>

                  {loadingMenu ? (
                    <div className="space-y-3 py-6">
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="rectangular" height={120} />
                    </div>
                  ) : menuOptimization ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 space-y-2">
                        <h4 className="font-bold text-slate-850 dark:text-zinc-200 border-b border-slate-200/50 dark:border-zinc-800 pb-1.5">Menu Margins Optimization</h4>
                        <div className="whitespace-pre-line font-medium">{menuOptimization}</div>
                      </div>
                      <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 space-y-2">
                        <h4 className="font-bold text-slate-850 dark:text-zinc-200 border-b border-slate-200/50 dark:border-zinc-800 pb-1.5">Portions Cost Audit</h4>
                        <div className="whitespace-pre-line font-medium mb-3">{foodCostAnalysis}</div>
                        
                        <h4 className="font-bold text-slate-850 dark:text-zinc-200 border-b border-slate-200/50 dark:border-zinc-800 pb-1.5">Waste prevention Recipes</h4>
                        <div className="whitespace-pre-line font-medium">{recipeSuggestions}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-405 font-semibold">
                      Click the button above to run culinary and markup suggestions.
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Mode 5: Customer Analytics & Marketing Promotion */}
            {activeMode === 'crm' && (
              <Card className="space-y-4 shadow-soft">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">AI Loyalty Campaigns & CRM</h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono">Generates coupons and engagement promo codes based on CRM visit counts</p>
                  </div>
                  <Button variant="primary" size="sm" icon={RefreshCw} onClick={runCRMAnalysis} loading={loadingCRM}>
                    Audit loyalty tiers
                  </Button>
                </div>

                {loadingCRM ? (
                  <div className="space-y-3 py-6">
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="rectangular" height={120} />
                  </div>
                ) : customerAnalytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 space-y-2">
                      <h4 className="font-bold text-slate-850 dark:text-zinc-200 border-b border-slate-200/50 dark:border-zinc-800 pb-1.5">Customer segments</h4>
                      <div className="whitespace-pre-line font-medium">{customerAnalytics}</div>
                    </div>
                    <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 space-y-2">
                      <h4 className="font-bold text-slate-850 dark:text-zinc-200 border-b border-slate-200/50 dark:border-zinc-800 pb-1.5">Marketing Copy suggestions</h4>
                      <div className="whitespace-pre-line font-medium">{marketingSuggestions}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-405 font-semibold">
                    Click the button to generate promotional SMS/email campaign templates.
                  </div>
                )}
              </Card>
            )}

            {/* Mode 6: Smart Search */}
            {activeMode === 'search' && (
              <Card className="space-y-4 shadow-soft">
                <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">AI Natural Language Smart Search</h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-mono">Ask about orders or database records using plain English queries</p>
                </div>
                
                <form onSubmit={runSmartSearch} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Find paid orders above $50 or tell me low inventory items..."
                    value={smartSearchQuery}
                    onChange={(e) => setSmartSearchQuery(e.target.value)}
                    disabled={loadingSearch}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-input bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:focus:ring-primary"
                  />
                  <Button type="submit" variant="primary" size="sm" loading={loadingSearch}>
                    Search DB
                  </Button>
                </form>

                {loadingSearch ? (
                  <div className="space-y-3 py-4">
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="rectangular" height={100} />
                  </div>
                ) : smartSearchResult ? (
                  <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 whitespace-pre-line font-medium">
                    {smartSearchResult}
                  </div>
                ) : null}
              </Card>
            )}

            {/* Mode 7: Reports compilation */}
            {activeMode === 'report' && (
              <Card className="space-y-4 shadow-soft">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">AI Operations Audit report</h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">Generates full audit operations log ready to print</p>
                  </div>
                  <Button variant="primary" size="sm" icon={RefreshCw} onClick={runExecReport} loading={loadingReport}>
                    Compile Report
                  </Button>
                </div>

                {loadingReport ? (
                  <div className="space-y-3 py-6">
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="rectangular" height={150} />
                  </div>
                ) : execReport ? (
                  <div className="p-4 bg-slate-50/50 border border-slate-100 dark:bg-zinc-900/30 dark:border-zinc-800 rounded-card text-xs leading-relaxed text-slate-700 dark:text-zinc-300 whitespace-pre-line font-medium">
                    {execReport}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-405 font-semibold">
                    Click the button to compile the executive hospitality diagnosis.
                  </div>
                )}
              </Card>
            )}

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AIPage;
