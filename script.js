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
  priceInput.value = ""; // Clear the price input
  showBuyFields(); // Default to Buy
});

closeModalButton.addEventListener("click", () => closeModal());

document.querySelectorAll('input[name="transaction-type"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const type = e.target.value;
    priceInput.value = ""; // Clear the price input
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

  updateTransactionTable(portfolio);
  updateDashboard(currency);

  closeModal();
});

function closeModal() {
  modal.classList.add("hidden");
  transactionInputs.classList.add("hidden");
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

function showBuyFields() {
  transactionInputs.classList.remove("hidden");
  priceLabel.textContent = "Buy Price per Coin:";
  amountLabel.textContent = "USD to Spend:";
  amountInput.value = ""; // Clear the field
}

function showSellFields() {
  transactionInputs.classList.remove("hidden");
  priceLabel.textContent = "Sell Price per Coin:";
  amountLabel.textContent = "Number of Coins to Sell:";
  amountInput.value = ""; // Clear the field before updating

  if (!activeCurrency) {
    console.error("No active currency selected.");
    return;
  }

  const portfolio = portfolios.get(activeCurrency);
  if (!portfolio) {
    console.error("No portfolio found for active currency:", activeCurrency);
    return;
  }

  const totalCoinsHeld = portfolio.transactions.reduce((sum, tx) => {
    return tx.type === "buy" ? sum + tx.quantity : sum - tx.quantity;
  }, 0);

  if (totalCoinsHeld > 0) {
    amountInput.value = totalCoinsHeld.toFixed(4);
    console.log(`Prepopulated with total coins held: ${totalCoinsHeld.toFixed(4)} for ${activeCurrency}.`);
  } else {
    console.warn(`No coins available for ${activeCurrency}.`);
    amountInput.value = "";
  }
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
