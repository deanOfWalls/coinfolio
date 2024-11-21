// Select elements
const newCoinButton = document.getElementById("open-modal");
const closeModalButton = document.getElementById("close-modal");
const addTransactionButton = document.getElementById("add-transaction");
const modal = document.getElementById("modal");
const transactionInputs = document.getElementById("transaction-inputs");
const priceLabel = document.getElementById("price-label");
const amountLabel = document.getElementById("amount-label");
const priceInput = document.getElementById("price-input");
const amountInput = document.getElementById("amount-input");
const currencySelect = document.getElementById("currency-select");
const ownedCoinsPanel = document.getElementById("owned-coins-panel");
const transactionTable = document.getElementById("transaction-table");
const dashboardElements = {
  averagePrice: document.getElementById("average-price"),
  totalCoins: document.getElementById("total-coins"),
  totalFees: document.getElementById("total-fees"),
  grossProfitLoss: document.getElementById("gross-profit-loss"),
  netProfitLoss: document.getElementById("net-profit-loss"),
  totalLoss: document.getElementById("total-loss"),
};

// Dashboard state
let activeCurrency = null;
const portfolios = new Map();

document.addEventListener("DOMContentLoaded", async () => {
  modal.classList.add("hidden");
  transactionInputs.classList.add("hidden");
  await populateCurrencyDropdown();
});

newCoinButton.addEventListener("click", () => {
  modal.classList.remove("hidden");
  transactionInputs.classList.add("hidden");
  priceInput.value = ""; // Clear price input
  showBuyFields(); // Default to "Buy"
});

closeModalButton.addEventListener("click", () => closeModal());

document.querySelectorAll('input[name="transaction-type"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const type = e.target.value;
    priceInput.value = ""; // Clear price input on switch
    type === "buy" ? showBuyFields() : showSellFields();
  });
});

addTransactionButton.addEventListener("click", () => {
  const currency = activeCurrency || currencySelect.value;
  const price = parseFloat(priceInput.value);
  const amount = parseFloat(amountInput.value);

  if (!currency || isNaN(price) || isNaN(amount)) {
    alert("Please fill in all fields.");
    return;
  }

  const type = priceLabel.textContent.includes("Buy") ? "buy" : "sell";
  let portfolio = portfolios.get(currency);

  if (!portfolio) {
    portfolio = createPortfolio(currency);
    addCoinToOwnedPanel(currency);
  }

  const quantity = type === "buy" ? amount / price : amount;
  const fees = type === "buy" ? amount * 0.004 : quantity * price * 0.004;
  const total = type === "buy" ? amount + fees : quantity * price - fees;

  portfolio.transactions.push({ type, price, amount, quantity, fees, total });

  console.log("Transaction added successfully:", { type, price, amount, quantity, fees, total });

  updateTransactionTable(portfolio);
  updateDashboard(currency);

  closeModal(); // Close modal after adding transaction
});

function closeModal() {
  modal.classList.add("hidden");
  transactionInputs.classList.add("hidden");
  console.log("Modal closed.");
}

function createPortfolio(currency) {
  const portfolio = { name: currency, transactions: [] };
  portfolios.set(currency, portfolio);
  return portfolio;
}

function addCoinToOwnedPanel(currency) {
  const button = document.createElement("button");
  button.className = "coin-button";
  button.textContent = currency;
  button.title = currency;
  button.addEventListener("click", () => {
    activeCurrency = currency;
    console.log("Active currency set to:", activeCurrency);
    const portfolio = portfolios.get(currency);
    updateTransactionTable(portfolio);
    updateDashboard(currency);
  });
  ownedCoinsPanel.appendChild(button);
}

function updateTransactionTable(portfolio) {
  transactionTable.innerHTML = "";
  portfolio.transactions.forEach((tx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.type}</td>
      <td>${tx.price.toFixed(2)}</td>
      <td>${tx.amount.toFixed(2)}</td>
      <td>${tx.quantity.toFixed(4)}</td>
      <td>$${tx.fees.toFixed(2)}</td>
      <td>$${tx.total.toFixed(2)}</td>`;
    transactionTable.appendChild(row);
  });
}

function updateDashboard(currency) {
  const portfolio = portfolios.get(currency);

  if (!portfolio) {
    console.error("No portfolio found for dashboard update:", currency);
    return;
  }

  let totalCoins = 0,
    totalSpent = 0,
    totalFees = 0,
    grossProfit = 0,
    totalLoss = 0;

  portfolio.transactions.forEach((tx) => {
    if (tx.type === "buy") {
      totalCoins += tx.quantity;
      totalSpent += tx.amount;
      totalFees += tx.fees;
    } else if (tx.type === "sell") {
      totalCoins -= tx.quantity;
      grossProfit += tx.total;
      totalFees += tx.fees;

      const costBasis = totalSpent / (totalCoins + tx.quantity) * tx.quantity;
      const realizedLoss = Math.max(0, costBasis - tx.total - tx.fees);
      totalLoss += realizedLoss;
    }
  });

  const netProfit = grossProfit - totalSpent - totalFees;

  dashboardElements.averagePrice.textContent =
    totalCoins > 0 ? `$${(totalSpent / totalCoins).toFixed(2)}` : "-";
  dashboardElements.totalCoins.textContent = totalCoins > 0 ? totalCoins.toFixed(4) : "0";
  dashboardElements.totalFees.textContent = `$${totalFees.toFixed(2)}`;
  dashboardElements.grossProfitLoss.textContent = `$${grossProfit.toFixed(2)}`;
  dashboardElements.netProfitLoss.textContent = `$${netProfit.toFixed(2)}`;
  dashboardElements.totalLoss.textContent = `$${totalLoss.toFixed(2)}`;

  console.log(`Dashboard updated for ${currency}:`, {
    totalCoins,
    totalSpent,
    totalFees,
    grossProfit,
    netProfit,
    totalLoss,
  });
}

async function populateCurrencyDropdown() {
  try {
    const response = await fetch("https://api.kraken.com/0/public/AssetPairs");
    const data = await response.json();

    const assetPairs = data.result;
    const currencies = new Set();

    for (const pair in assetPairs) {
      const baseCurrency = assetPairs[pair].base.replace(/^[XZ]/, "");
      currencies.add(baseCurrency);
    }

    currencySelect.innerHTML = "";
    Array.from(currencies)
      .sort()
      .forEach((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = code;
        currencySelect.appendChild(option);
      });
  } catch (error) {
    console.error("Failed to populate currency dropdown:", error);
  }
}
