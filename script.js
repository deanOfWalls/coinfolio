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
const fallbackCurrencyNames = {
  XDG: "Dogecoin",
  BTC: "Bitcoin",
  ETH: "Ethereum",
  XRP: "Ripple",
  LTC: "Litecoin",
  ADA: "Cardano",
};

document.addEventListener("DOMContentLoaded", async () => {
  modal.classList.add("hidden");
  transactionInputs.classList.add("hidden");
  await populateCurrencyDropdown();
});

newCoinButton.addEventListener("click", () => {
  modal.classList.remove("hidden");
  transactionInputs.classList.add("hidden");
  priceInput.value = ""; // Clear the price input field
  showBuyFields();
});

closeModalButton.addEventListener("click", () => closeModal());

document.querySelectorAll('input[name="transaction-type"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const type = e.target.value;
    priceInput.value = ""; // Clear the price input field when switching types
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
    portfolio = createPortfolio(currency, currency);
    addCoinToOwnedPanel(currency, currency);
  }

  const quantity = type === "buy" ? amount / price : amount;
  const fees = type === "buy" ? amount * 0.004 : quantity * price * 0.004;
  const total = type === "buy" ? amount + fees : quantity * price - fees;

  portfolio.transactions.push({ type, price, amount, quantity, fees, total });

  updateTransactionTable(portfolio);
  updateDashboard(currency);

  closeModal();
});

function closeModal() {
  modal.classList.add("hidden");
  transactionInputs.classList.add("hidden");
}

function createPortfolio(currency, currencyName) {
  const portfolio = { name: currencyName, transactions: [] };
  portfolios.set(currency, portfolio);
  return portfolio;
}

function addCoinToOwnedPanel(currency, currencyName) {
  const button = document.createElement("button");
  button.className = "coin-button";
  button.textContent = currency;
  button.title = currencyName;
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
    console.error("Portfolio not found for currency:", currency);
    return;
  }

  let totalCoins = 0;
  let totalSpent = 0;
  let totalFees = 0;
  let grossProfit = 0;
  let totalLoss = 0;

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
}

async function populateCurrencyDropdown() {
  try {
    const response = await fetch("https://api.kraken.com/0/public/AssetPairs");
    const data = await response.json();

    const assetPairs = data.result;
    const currencies = new Map();

    for (const pair in assetPairs) {
      const baseCurrency = assetPairs[pair].base.replace(/^[XZ]/, "");
      const name = fallbackCurrencyNames[baseCurrency] || baseCurrency;
      currencies.set(baseCurrency, name);
    }

    currencySelect.innerHTML = "";
    Array.from(currencies.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([code, name]) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `${name} (${code})`;
        currencySelect.appendChild(option);
      });
  } catch (error) {
    console.error("Failed to populate currency dropdown:", error);
  }
}

function showBuyFields() {
  transactionInputs.classList.remove("hidden");
  priceLabel.textContent = "Buy Price per Coin:";
  amountLabel.textContent = "USD to Spend:";
  amountInput.value = ""; // Clear the amount input field for buy layout
}

function showSellFields() {
  transactionInputs.classList.remove("hidden");
  priceLabel.textContent = "Sell Price per Coin:";
  amountLabel.textContent = "Number of Coins to Sell:";
  amountInput.value = ""; // Clear the field before setting

  if (!activeCurrency) {
    console.error("No active currency selected for sell operation.");
    return;
  }

  const portfolio = portfolios.get(activeCurrency);
  if (!portfolio) {
    console.error("Portfolio not found for active currency:", activeCurrency);
    return;
  }

  const totalCoinsHeld = portfolio.transactions.reduce((sum, tx) => {
    if (tx.type === "buy") return sum + tx.quantity;
    if (tx.type === "sell") return sum - tx.quantity;
    return sum;
  }, 0);

  if (totalCoinsHeld > 0) {
    amountInput.value = totalCoinsHeld.toFixed(4);
    console.log(`Sell fields prepopulated: ${totalCoinsHeld.toFixed(4)} coins held for ${activeCurrency}.`);
  } else {
    console.warn(`No coins available to sell for ${activeCurrency}.`);
  }
}
