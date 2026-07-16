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

const chatWithAI = catchAsync(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) throw new ApiError(400, 'Prompt message is required');

  const branchId = req.query.branchId || await getDefaultBranchId();

  // 1. Gather context metrics to feed into model instructions
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
  res.send(new ApiResponse(200, { reply, model: aiService.provider }, 'AI consultant response generated'));
});

const getPredictiveInsights = catchAsync(async (req, res) => {
  const branchId = req.query.branchId || await getDefaultBranchId();
  
  const sales = await reportsRepo.getSalesSummary({ branchId });
  const inventory = await reportsRepo.getInventoryValueReport({ branchId });

  const prompt = `Perform a predictive analysis. Generate a sales projection for the upcoming weekend, list raw ingredient velocity insights, and identify potential operational bottlenecks.`;
  const systemInstruction = `You are a data analyst. Output a JSON-like operational report with markdown formatting, including a "Weekend Forecast", "Demand Speed Alerts", and "Margin Actions" section.`;

  const analysis = await aiService.generateResponse(prompt, systemInstruction);
  res.send(new ApiResponse(200, { analysis }, 'Predictive metrics generated successfully'));
});

module.exports = {
  chatWithAI,
  getPredictiveInsights,
};
