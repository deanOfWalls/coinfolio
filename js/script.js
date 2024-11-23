// // Select elements
// const newCoinButton = document.getElementById("open-modal");
// const closeModalButton = document.getElementById("close-modal");
// const addTransactionButton = document.getElementById("add-transaction");
// const modal = document.getElementById("modal");
// const transactionInputs = document.getElementById("transaction-inputs");
// const priceLabel = document.getElementById("price-label");
// const amountLabel = document.getElementById("amount-label");
// const priceInput = document.getElementById("price-input");
// const amountInput = document.getElementById("amount-input");
// const currencySelect = document.getElementById("currency-select");
// const ownedCoinsPanel = document.getElementById("owned-coins-panel");
// const transactionTable = document.getElementById("transaction-table");
// const dashboardElements = {
//   averagePrice: document.getElementById("average-price"),
//   totalCoins: document.getElementById("total-coins"),
//   totalFees: document.getElementById("total-fees"),
//   grossProfitLoss: document.getElementById("gross-profit-loss"),
//   netProfitLoss: document.getElementById("net-profit-loss"),
//   totalLoss: document.getElementById("total-loss"),
// };

// // Dashboard state
// let activeCurrency = null;
// const portfolios = new Map();
// const fallbackCurrencyNames = {
//   BTC: "Bitcoin",
//   ETH: "Ethereum",
//   LTC: "Litecoin",
//   XRP: "Ripple",
//   ADA: "Cardano",
//   DOGE: "Dogecoin",
//   BCH: "Bitcoin Cash",
//   XMR: "Monero",
//   DOT: "Polkadot",
//   XDG: "Dogecoin",
// };

// document.addEventListener("DOMContentLoaded", async () => {
//   modal.classList.add("hidden");
//   transactionInputs.classList.add("hidden");
//   await populateCurrencyDropdown();
// });

// newCoinButton.addEventListener("click", () => {
//   modal.classList.remove("hidden");
//   transactionInputs.classList.remove("hidden");
//   priceInput.value = ""; // Clear price input
//   amountInput.value = ""; // Clear amount input
//   document.querySelector('input[name="transaction-type"][value="buy"]').checked = true; // Default to "Buy"
//   showBuyFields(); // Ensure modal defaults to Buy layout
//   activeCurrency = null; // Reset active currency
//   addTransactionButton.textContent = "Add"; // Reset button text
//   addTransactionButton.onclick = addTransaction; // Reset button behavior
// });

// closeModalButton.addEventListener("click", () => closeModal());

// document.querySelectorAll('input[name="transaction-type"]').forEach((radio) => {
//   radio.addEventListener("change", (e) => {
//     const type = e.target.value;
//     priceInput.value = ""; // Clear price input
//     amountInput.value = ""; // Clear amount input
//     if (type === "buy") {
//       showBuyFields();
//     } else {
//       showSellFields(); // Prepopulate coins to sell
//     }
//   });
// });

// function addTransaction() {
//   const currency = activeCurrency || currencySelect.value; // Use dropdown fallback
//   const price = parseFloat(priceInput.value);
//   const amount = parseFloat(amountInput.value);

//   if (!currency || isNaN(price) || isNaN(amount)) {
//     alert("Please fill in all fields.");
//     return;
//   }

//   const type = priceLabel.textContent.includes("Buy") ? "buy" : "sell";
//   let portfolio = portfolios.get(currency);

//   if (!portfolio) {
//     portfolio = createPortfolio(currency); // Create a new portfolio if none exists
//     addCoinToOwnedPanel(currency);
//   }

//   const quantity = type === "buy" ? amount / price : amount;
//   const fees = type === "buy" ? amount * 0.004 : quantity * price * 0.004;
//   const total = type === "buy" ? amount + fees : quantity * price - fees;

//   portfolio.transactions.push({ type, price, amount, quantity, fees, total });

//   updateTransactionTable(portfolio);
//   updateDashboard(currency);

//   closeModal(); // Ensure the modal is closed after adding
// }

// function closeModal() {
//   modal.classList.add("hidden");
//   transactionInputs.classList.add("hidden");
//   priceInput.value = ""; // Clear inputs
//   amountInput.value = "";
//   addTransactionButton.textContent = "Add"; // Reset button text
//   addTransactionButton.onclick = addTransaction; // Reset button behavior
// }

// function createPortfolio(currency) {
//   const portfolio = { name: currency, transactions: [] };
//   portfolios.set(currency, portfolio);
//   return portfolio;
// }

// function addCoinToOwnedPanel(currency) {
//   if (document.querySelector(`button[data-currency="${currency}"]`)) {
//     return; // Prevent duplicate buttons for the same coin
//   }

//   const button = document.createElement("button");
//   const readableName = fallbackCurrencyNames[currency] || currency;

//   button.className = "coin-button";
//   button.textContent = `${readableName} (${currency})`; // Use readable name and code
//   button.title = readableName;
//   button.dataset.currency = currency; // Add data attribute for uniqueness

//   button.addEventListener("click", () => {
//     activeCurrency = currency; // Set active currency
//     const portfolio = portfolios.get(currency);
//     updateTransactionTable(portfolio);
//     updateDashboard(currency);
//     console.log(`Active currency set to: ${currency}`);
//   });

//   ownedCoinsPanel.appendChild(button);
// }

// function updateTransactionTable(portfolio) {
//   transactionTable.innerHTML = ""; // Clear the table

//   portfolio.transactions.forEach((tx, index) => {
//     const row = document.createElement("tr");
//     row.innerHTML = `
//       <td>${tx.type}</td>
//       <td>${tx.price.toFixed(6)}</td>
//       <td>${tx.amount.toFixed(2)}</td>
//       <td>${tx.quantity.toFixed(4)}</td>
//       <td>$${tx.fees.toFixed(2)}</td>
//       <td>$${tx.total.toFixed(2)}</td>
//       <td>
//         <button class="edit-transaction" data-index="${index}">✏️</button>
//         <button class="delete-transaction" data-index="${index}">🗑️</button>
//       </td>
//     `;
//     transactionTable.appendChild(row);
//   });

//   transactionTable.querySelectorAll(".edit-transaction").forEach((button) => {
//     button.addEventListener("click", (e) => {
//       const index = e.target.dataset.index;
//       openEditTransactionModal(portfolio, index); // Open modal for editing
//     });
//   });

//   transactionTable.querySelectorAll(".delete-transaction").forEach((button) => {
//     button.addEventListener("click", (e) => {
//       const index = e.target.dataset.index;
//       deleteTransaction(portfolio, index); // Delete the transaction
//     });
//   });
// }

// function openEditTransactionModal(portfolio, index) {
//   const transaction = portfolio.transactions[index];
//   activeCurrency = portfolio.name; // Ensure activeCurrency is set correctly

//   modal.classList.remove("hidden");
//   transactionInputs.classList.remove("hidden");
//   priceInput.value = transaction.price.toFixed(6); // Use 6 decimal places
//   amountInput.value = transaction.type === "buy" ? transaction.amount.toFixed(2) : transaction.quantity.toFixed(4);
//   document.querySelector(`input[name="transaction-type"][value="${transaction.type}"]`).checked = true;

//   addTransactionButton.textContent = "Save Changes";
//   addTransactionButton.onclick = () => saveTransactionChanges(portfolio, index);
// }

// function saveTransactionChanges(portfolio, index) {
//   const price = parseFloat(priceInput.value);
//   const amount = parseFloat(amountInput.value);

//   if (isNaN(price) || isNaN(amount)) {
//     alert("Please fill in all fields.");
//     return;
//   }

//   const type = document.querySelector('input[name="transaction-type"]:checked').value;
//   const quantity = type === "buy" ? amount / price : amount;
//   const fees = type === "buy" ? amount * 0.004 : quantity * price * 0.004;
//   const total = type === "buy" ? amount + fees : quantity * price - fees;

//   portfolio.transactions[index] = { type, price, amount, quantity, fees, total };

//   updateTransactionTable(portfolio);
//   updateDashboard(portfolio.name);

//   closeModal(); // Close modal after saving
// }

// function deleteTransaction(portfolio, index) {
//   if (confirm("Are you sure you want to delete this transaction?")) {
//     portfolio.transactions.splice(index, 1); // Remove transaction
//     updateTransactionTable(portfolio);
//     updateDashboard(portfolio.name);
//     console.log("Transaction deleted successfully.");
//   }
// }

// function showBuyFields() {
//   transactionInputs.classList.remove("hidden");
//   priceLabel.textContent = "Buy Price per Coin:";
//   amountLabel.textContent = "USD to Spend:";
//   amountInput.value = ""; // Clear input
// }

// function showSellFields() {
//   transactionInputs.classList.remove("hidden");
//   priceLabel.textContent = "Sell Price per Coin:";
//   amountLabel.textContent = "Number of Coins to Sell:";
//   priceInput.value = "";

//   if (!activeCurrency) return;

//   const portfolio = portfolios.get(activeCurrency);
//   const totalCoinsHeld = portfolio.transactions.reduce((sum, tx) => {
//     return tx.type === "buy" ? sum + tx.quantity : sum - tx.quantity;
//   }, 0);

//   if (totalCoinsHeld > 0) {
//     amountInput.value = totalCoinsHeld.toFixed(4);
//   } else {
//     amountInput.value = "";
//   }
// }

// function updateDashboard(currency) {
//   const portfolio = portfolios.get(currency);
//   if (!portfolio) return;

//   let totalCoins = 0,
//     totalSpent = 0,
//     totalFees = 0,
//     grossProfit = 0;

//   portfolio.transactions.forEach((tx) => {
//     if (tx.type === "buy") {
//       totalCoins += tx.quantity;
//       totalSpent += tx.amount;
//       totalFees += tx.fees;
//     } else {
//       totalCoins -= tx.quantity;
//       grossProfit += tx.total;
//       totalFees += tx.fees;
//     }
//   });

//   const netProfit = grossProfit - totalSpent - totalFees;

//   dashboardElements.averagePrice.textContent =
//     totalCoins > 0 ? `$${(totalSpent / totalCoins).toFixed(2)}` : "-";
//   dashboardElements.totalCoins.textContent = totalCoins.toFixed(4);
//   dashboardElements.totalFees.textContent = `$${totalFees.toFixed(2)}`;
//   dashboardElements.grossProfitLoss.textContent = `$${grossProfit.toFixed(2)}`;
//   dashboardElements.netProfitLoss.textContent = `$${netProfit.toFixed(2)}`;
// }

// async function populateCurrencyDropdown() {
//   try {
//     currencySelect.innerHTML = '<option>Loading...</option>';
//     const response = await fetch("https://api.kraken.com/0/public/AssetPairs");
//     const data = await response.json();

//     const currencies = new Map();
//     for (const pair in data.result) {
//       const baseCurrency = data.result[pair].base.replace(/^[XZ]/, "");
//       const readableName = fallbackCurrencyNames[baseCurrency] || baseCurrency;
//       currencies.set(baseCurrency, readableName);
//     }

//     currencySelect.innerHTML = "";
//     Array.from(currencies.entries())
//       .sort((a, b) => a[1].localeCompare(b[1]))
//       .forEach(([code, name]) => {
//         const option = document.createElement("option");
//         option.value = code;
//         option.textContent = `${name} (${code})`;
//         currencySelect.appendChild(option);
//       });
//   } catch {
//     currencySelect.innerHTML = '<option>Error loading currencies</option>';
//   }
// }
