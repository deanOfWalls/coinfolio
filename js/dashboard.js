import { portfolios } from "./state.js";
import { dashboardElements } from "./domElements.js";

export function updateDashboard() {
    let totalCoinsHeld = 0,
        totalSpent = 0,
        totalBuyFees = 0,
        totalSellFees = 0,
        grossProfit = 0;

    portfolios.forEach((portfolio) => {
        portfolio.transactions.forEach((tx) => {
            if (tx.type === "buy") {
                totalCoinsHeld += tx.quantity;
                totalSpent += tx.amount; // USD spent on buys
                totalBuyFees += tx.fees; // Buy fees
            } else if (tx.type === "sell") {
                totalCoinsHeld -= tx.quantity;
                grossProfit += (tx.price - totalSpent / tx.quantity) * tx.quantity - tx.fees; // Gross profit from this sale
                totalSellFees += tx.fees; // Sell fees
            }
        });
    });

    // Total Fees = Buy Fees + Sell Fees
    const totalFees = totalBuyFees + totalSellFees;

    // Net Profit: Gross Profit - Buy Fees
    const netProfit = grossProfit - totalBuyFees;

    // Update Dashboard
    dashboardElements.averagePrice.textContent =
        totalCoinsHeld > 0 ? `$${(totalSpent / totalCoinsHeld).toFixed(2)}` : "-";
    dashboardElements.totalCoins.textContent = totalCoinsHeld.toFixed(4);
    dashboardElements.totalFees.textContent = `$${totalFees.toFixed(2)}`;
    dashboardElements.grossProfitLoss.textContent = `$${grossProfit.toFixed(2)}`;
    dashboardElements.netProfitLoss.textContent = `$${netProfit.toFixed(2)}`;
    dashboardElements.totalLoss.textContent = netProfit < 0 ? `$${Math.abs(netProfit).toFixed(2)}` : "$0.00";

    console.log("Dashboard updated:", {
        averagePrice: totalCoinsHeld > 0 ? (totalSpent / totalCoinsHeld).toFixed(2) : "-",
        totalCoinsHeld,
        totalSpent,
        totalFees,
        grossProfit,
        netProfit,
    });
}
