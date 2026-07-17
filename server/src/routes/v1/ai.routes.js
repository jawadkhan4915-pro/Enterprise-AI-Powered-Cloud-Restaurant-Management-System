const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const ctrl = require('../../controllers/ai.controller');

const router = express.Router();
router.use(auth);

router.post('/chat', ctrl.chatWithAI);
router.get('/insights', ctrl.getPredictiveInsights);
router.get('/sales-prediction', ctrl.getSalesPrediction);
router.get('/inventory-prediction', ctrl.getInventoryPrediction);
router.get('/customer-analytics', ctrl.getCustomerAnalytics);
router.get('/menu-optimization', ctrl.getMenuOptimization);
router.get('/marketing-suggestions', ctrl.getMarketingSuggestions);
router.post('/smart-search', ctrl.postSmartSearch);
router.get('/recipe-suggestions', ctrl.getRecipeSuggestions);
router.get('/food-cost-analysis', ctrl.getFoodCostAnalysis);
router.get('/restaurant-consultant', ctrl.getRestaurantConsultant);
router.get('/report-generator', ctrl.getReportGenerator);

module.exports = router;
