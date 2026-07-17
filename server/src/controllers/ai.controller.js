const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const aiService = require('../services/ai/ai.service');
const reportsRepo = require('../repositories/reports.repository');
const restaurantRepo = require('../repositories/restaurant.repository');
const ApiError = require('../utils/ApiError');

const getDefaultBranchId = async () => {
  let profile = await restaurantRepo.getProfile();
  if (!profile) profile = await restaurantRepo.updateProfile({ name: 'RestaurantOS AI HQ' });
  const branches = await restaurantRepo.getBranches(profile._id);
  if (!branches.length) throw new ApiError(400, 'No branch configured. Add a branch in Settings first.');
  return branches[0]._id;
};

// 1. General AI Chat / Business Copilot
const chatWithAI = catchAsync(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) throw new ApiError(400, 'Prompt message is required');

  const branchId = req.query.branchId || await getDefaultBranchId();

  // Gather context metrics
  const sales = await reportsRepo.getSalesSummary({ branchId });
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });
  const topItems = await reportsRepo.getTopSellingItems({ branchId, limit: 5 });

  const systemInstruction = `You are the RestaurantOS AI Business Assistant, an expert consultant analyzing restaurant data.
Below is the live operational snapshot of this branch:
- Total Sales Revenue: $${sales.totalRevenue.toFixed(2)} (${sales.totalOrders} total orders)
- Average Order Value: $${sales.avgOrderValue.toFixed(2)}
- Inventory SKU Count: ${inventory.totalItems}
- Current Stock Value: $${inventory.totalStockValue.toFixed(2)}
- Critical Low Stock Alert Count: ${inventory.lowStockCount}
- Top Selling Menu Items: ${topItems.map(i => `${i.name} (${i.totalQuantity} sold)`).join(', ')}

Answer user business queries concisely. Offer suggestions for optimization, inventory replenishment levels, menu engineering margins, or staffing schedules based on the live data above where appropriate. Keep responses formatted in clean markdown.`;

  const reply = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { reply, model: aiService.provider }, 'AI response generated successfully'));
});

// 2. Predictive Insights Dashboard
const getPredictiveInsights = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  
  const sales = await reportsRepo.getSalesSummary({ branchId });
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });

  const prompt = `Perform a predictive analysis. Generate a sales projection for the upcoming weekend, list raw ingredient velocity insights, and identify potential operational bottlenecks.`;
  const systemInstruction = `You are a data analyst. Output a JSON-like operational report with markdown formatting, including a "Weekend Forecast", "Demand Speed Alerts", and "Margin Actions" section.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Predictive metrics generated successfully'));
});

// 3. AI Sales Prediction
const getSalesPrediction = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const sales = await reportsRepo.getSalesSummary({ branchId });

  const prompt = `Here is the sales dataset for the past 30 days:
${JSON.stringify(sales.revenueByDay, null, 2)}

Provide:
1. Sales Revenue forecast for the next 7 days.
2. Estimated peak sales hours & customer load prediction.
3. Weekend versus weekday revenue ratio analysis.`;

  const systemInstruction = `You are a financial analyst specializing in food & beverage revenue forecasting. Output a detailed report with predictions, formatting numbers as currency. Use clean markdown tables.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Sales prediction report generated'));
});

// 4. AI Inventory Prediction
const getInventoryPrediction = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });
  
  const prompt = `Here is our current inventory summary:
- Total unique items: ${inventory.totalItems}
- Total stock asset value: $${inventory.totalStockValue.toFixed(2)}
- SKUs currently below minimum safety stock levels: ${inventory.lowStockCount}
Category distribution: ${JSON.stringify(inventory.byCategory, null, 2)}

Provide:
1. Run-rate predictions: items likely to deplete within 3, 7, and 14 days.
2. Low stock alert levels check and warning triggers.
3. Recommended purchase restocks suggestions.`;

  const systemInstruction = `You are an expert supply chain and warehouse manager. Structure the output as an actionable restocking suggestions guide. Use clear markdown headers and alerts.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Inventory velocity prediction generated'));
});

// 5. AI Customer Analytics
const getCustomerAnalytics = catchAsync(async (req, res) => {
  const customerStats = await reportsRepo.getCustomerStats();

  const prompt = `Analyze our CRM dataset:
- Total loyal members: ${customerStats.totalCustomers}
- Accumulated client visits: ${customerStats.totalVisits}
- Total cumulative CRM spend: $${customerStats.totalRevenue.toFixed(2)}
Tier breakdown: ${JSON.stringify(customerStats.tierBreakdown, null, 2)}

Provide:
1. Core insights about user behavior, visit frequency, and loyalty tier distribution.
2. Customer segment recommendations (e.g. VIP retention vs reactivation of idle users).
3. Engagement score suggestions.`;

  const systemInstruction = `You are a CRM and marketing loyalty strategist. Provide professional insights about user segments and recommend points programs adjustments. Use markdown formatting.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Customer segment analytics report generated'));
});

// 6. AI Menu Optimization
const getMenuOptimization = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const topItems = await reportsRepo.getTopSellingItems({ branchId, limit: 15 });

  const prompt = `Analyze our menu performance dataset:
${JSON.stringify(topItems, null, 2)}

Classify these items using the BCG Menu Engineering Matrix:
- **Stars** (High popularity, High contribution margin)
- **Plowhorses** (High popularity, Low contribution margin)
- **Puzzles** (Low popularity, High contribution margin)
- **Dogs** (Low popularity, Low contribution margin)

Recommend adjustments to menu pricing, ingredients replacement, or recipe layouts to optimize our total profit margins.`;

  const systemInstruction = `You are a Michelin-star culinary consultant and menu engineer. Output a structural menu analysis detailing classifications and pricing strategy modifications. Use clear markdown formatting.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Menu engineering analysis generated'));
});

// 7. AI Marketing Suggestions
const getMarketingSuggestions = catchAsync(async (req, res) => {
  const { campaignGoal, targetSegment } = req.query;
  const stats = await reportsRepo.getCustomerStats();

  const prompt = `Generate email/SMS promo copies and coupon campaign suggestions.
Campaign target goal: ${campaignGoal || 'Increase repeat dinner bookings'}
Target audience segment: ${targetSegment || 'VIP customers'}
Current loyalty metrics reference: ${stats.totalCustomers} customers with tier distributions.

Provide:
1. 3 alternative marketing campaign concepts (name, offer, trigger).
2. Sample copy for email body and SMS broadcast (under 160 characters).
3. Predicted campaign conversion rate.`;

  const systemInstruction = `You are a creative copywriter and digital marketer. Design high-converting, premium promotion templates. Keep the tone elegant and professional. Use markdown sections.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Marketing campaign templates generated'));
});

// 8. AI Smart Search
const postSmartSearch = catchAsync(async (req, res) => {
  const { query } = req.body;
  if (!query) throw new ApiError(400, 'Search query is required');

  const branchId = req.query.branchId || await getDefaultBranchId();

  // Get metadata context to assist translation
  const sales = await reportsRepo.getSalesSummary({ branchId });
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });

  const prompt = `Translate the following natural language request into a database insight or mock query results: "${query}"
Context reference:
- Orders today: ${sales.totalOrders}
- Low stock count: ${inventory.lowStockCount}

Perform the search logic and output the answer as if you were queried on live tables. Make the response highly precise.`;

  const systemInstruction = `You are an AI Smart Search Engine. Output a direct answer to the query with a summary of matching records or stats in a clean, tabular format.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'NLP search complete'));
});

// 9. AI Recipe Suggestions
const getRecipeSuggestions = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });

  const prompt = `Review current inventory categories to identify possible high-surplus ingredients:
${JSON.stringify(inventory.byCategory, null, 2)}

Formulate 3 chef-quality, high-margin recipe recommendations that utilize common surplus ingredients to prevent food waste. Detail the recipe preparation guidelines and highlight allergen warnings.`;

  const systemInstruction = `You are an executive chef. Provide creative recipe recipes utilizing common pantry items. Format as standard chef cards with preparation times.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Recipe suggestions compiled'));
});

// 10. AI Food Cost Analysis
const getFoodCostAnalysis = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const topItems = await reportsRepo.getTopSellingItems({ branchId, limit: 5 });

  const prompt = `Evaluate the food cost ratio of our top margin menu items:
${JSON.stringify(topItems, null, 2)}

Provide:
1. Target food cost percentage calculations (average target is 28-32%).
2. Wastage cost variance estimations.
3. Ingredient purchasing adjustments suggestions to reduce cost per portion.`;

  const systemInstruction = `You are a restaurant finance controller. Output a food cost analysis report highlighting margins, price hikes recommendations, and portion control actions.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Food cost audit report generated'));
});

// 11. AI Restaurant Consultant
const getRestaurantConsultant = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const sales = await reportsRepo.getSalesSummary({ branchId });
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });
  
  const prompt = `Conduct a comprehensive systems operations audit of our restaurant.
Financial summary: Sales $${sales.totalRevenue.toFixed(2)} across ${sales.totalOrders} order entries.
Warehouse summary: Stock asset value is $${inventory.totalStockValue.toFixed(2)} with ${inventory.lowStockCount} alerts.

Detail a 5-step operational improvement strategy covering staffing peak levels, procurement replenishment intervals, waste management reductions, and CRM points promotion engagement.`;

  const systemInstruction = `You are a senior partner at a hospitality consultancy firm. Provide a detailed, professional business audit plan. Use premium markdown headers.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Consultancy report compiled'));
});

// 12. AI Report Generator
const getReportGenerator = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  const sales = await reportsRepo.getSalesSummary({ branchId });
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });

  const prompt = `Generate an executive Operations Audit summary report.
Branch Sales today: $${sales.totalRevenue.toFixed(2)}
Inventory SKUs: ${inventory.totalItems}

Create a structured markdown executive report compiling key KPIs, operational risks, and executive action points.`;

  const systemInstruction = `You are a technical business reporter. Write a formal executive operations audit. Use structured markdown formatting and tables.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Operations report compiled'));
});

module.exports = {
  chatWithAI,
  getPredictiveInsights,
  getSalesPrediction,
  getInventoryPrediction,
  getCustomerAnalytics,
  getMenuOptimization,
  getMarketingSuggestions,
  postSmartSearch,
  getRecipeSuggestions,
  getFoodCostAnalysis,
  getRestaurantConsultant,
  getReportGenerator,
};
