import { NextResponse } from 'next/server';
import { FinancialSummary } from '@/types';

export async function POST(req: Request) {
  try {
    const { message, financialSummary } = (await req.json()) as {
      message: string;
      financialSummary: FinancialSummary;
    };

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Contextual responses designed for Uganda economics
    const lower = message.toLowerCase();
    let advice = '';

    if (lower.includes('transport') || lower.includes('boda') || lower.includes('matatu')) {
      advice = `Here are practical ways to optimize transport in Kampala & Uganda:
1. **Combine Boda Trips**: If you use SafeBoda or street bodas daily, negotiate weekly rates with trusted stage riders or use shared matatus for longer stretches (e.g., Ntinda to City Square) and bodas only for the last mile.
2. **Weekly Transport Cap**: Set a strict weekly cash limit (e.g. UGX 45,000) and keep it in physical cash or dedicated MoMo so you don't overspend from your main bank account.
3. **Off-Peak Movement**: Traveling before 7:30 AM or after 8:30 PM significantly lowers stage prices.`;
    } else if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant')) {
      advice = `Based on your numbers, Food & Dining is one of your key expenditure lines:
1. **Market Groceries vs Fast Food**: Buying staple foodstuffs (rice, matooke, groundnuts, beans) monthly from bulk markets like Nakasero, Kalerwe or Wandegeya can cut monthly grocery costs by 35% compared to daily convenience purchases.
2. **Lunch Planning**: Pack office lunches 3 days a week and reserve restaurant outings (like Cafe Javas/Cafe Kampala) for weekends or special occasions.
3. **Track Quick Bites**: Rolexes, evening snacks, and takeaway coffees often quietly total over UGX 100,000/month if not logged.`;
    } else if (lower.includes('side hustle') || lower.includes('business') || lower.includes('poultry') || lower.includes('invest')) {
      advice = `Starting a business or side-hustle in Uganda (like poultry, retail, or tech freelancing):
1. **Never Deplete Emergency Reserves**: Keep your UGX 50,000 - 100,000 emergency buffer intact before injecting capital into a new venture.
2. **Phase 1 Validation**: Start small (e.g. 50-100 chicks or low-overhead pilot) rather than taking high-interest quick loans.
3. **Separate Hustle Accounts**: Open a dedicated MTN MoMo Merchant code or secondary Airtel line to keep business revenue separated from personal spending.`;
    } else if (lower.includes('save') || lower.includes('tuition') || lower.includes('laptop') || lower.includes('budget')) {
      advice = `To hit your savings goals faster:
1. **Automate on Payday**: The moment your salary or main income lands, transfer 15-20% immediately to your Savings Goal or Bank fixed account before spending a single shilling.
2. **Utilize Safe-to-Spend Daily**: Your estimated daily safe allowance helps you decide whether to spend today or roll the surplus into your goal tomorrow.
3. **High-Yield SACCOs / Unit Trusts**: Consider local regulated Money Market Funds (e.g. Stanbic Unit Trusts, Sanlam, UAP) for your emergency buffer to earn 10-12% annual returns while keeping liquidity.`;
    } else {
      const topCat = financialSummary?.topSpendingCategories?.[0]?.category || 'General Spending';
      const savingsRate = financialSummary?.savingsRatePercentage?.toFixed(0) || '0';
      advice = `Here is an analysis of your financial profile:
• **Savings Rate**: Currently ${savingsRate}%. Maintaining over 20% will build financial resilience rapidly.
• **Top Expenditure Driver**: ${topCat} is currently your highest category. Reviewing this line item will yield the quickest savings.
• **Safe-to-Spend Daily**: Stick to your calculated safe allowance to avoid running low before the month ends.

Feel free to ask me about budgeting for rent, saving for tuition, managing debts, or cutting transport expenses!`;
    }

    return NextResponse.json({
      reply: advice,
      timestamp: new Date().toISOString(),
      sender: 'Spendy AI Coach',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI coach request' }, { status: 500 });
  }
}
