class MockAIAdapter {
  constructor() {
    this.name = 'Mock AI Adapter (Demo Mode)';
  }

  async generateText(prompt, systemInstruction = '') {
    // Generate context-aware dummy suggestions based on keyword matching
    const p = prompt.toLowerCase();
    
    if (p.includes('salmon') || p.includes('shortage') || p.includes('inventory')) {
      return `### Inventory Forecast & Action Plan:
Based on POS order speed data:
1. **Salmon Fillets**: Current stock is 10kg, usage rate is 2.5kg/day. Shortage predicted in **4 days** (Saturday). Recommend placing a purchase restock order of **15kg** with supplier *FreshMart Suppliers*.
2. **Mineral Water 500ml**: High inventory levels (100 pieces). Recommendation: hold off reorders for 2 weeks.
3. **Tomato/Lettuce**: Demand velocity is flat. Maintain standard stock level replenishment.`;
    }

    if (p.includes('predict') || p.includes('sales') || p.includes('revenue')) {
      return `### Financial Analytics & Sales Forecasting:
Historical analysis models suggest:
- **Next Weekend Revenue Forecast**: $18,420.00 (±$500).
- **Growth Velocity**: ↑ 8% increase compared to same weekend last month.
- **Top Drivers**: Main courses (Pasta Penne & Steak Ribeye) showing highest margin contributions.
- **Actionable Insight**: Schedule 1 extra waiter shift for Saturday evening peak hours (18:00 - 22:00).`;
    }

    if (p.includes('menu') || p.includes('recipe') || p.includes('pricing')) {
      return `### Menu Engineering & Recipe Optimization:
1. **Penne Arrabbiata Optimization**:
   - Current cost per portion: $2.40. Suggested retail price: $14.50 (Margin: 83.4%).
   - Action: Include fresh basil garnish to justify a $1.00 price increase.
2. **Slow-Moving Items**:
   - Desert sales have dropped 15% this month.
   - Recommendation: Bundle "Mineral Water" or soft drink with starters during lunch hours to increase attachment rates.`;
    }

    return `Hello! I am your RestaurantOS AI Co-pilot. I can analyze sales history, forecast raw ingredient stock levels, optimize menu pricing, and write supplier emails. 

Try asking:
- *"Will we run out of salmon this week?"*
- *"Give me a sales prediction for this weekend"*
- *"How can I optimize our menu items?"*`;
  }
}

module.exports = MockAIAdapter;
