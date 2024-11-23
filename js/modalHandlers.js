import {
    modal,
    transactionInputs,
    priceLabel,
    amountLabel,
    priceInput,
    amountInput,
    currencySelect,
    addTransactionButton,
} from "./domElements.js";
import { portfolios } from "./state.js";
import { updateTransactionTable } from "./transactions.js";
import { updateDashboard } from "./dashboard.js";

// Open the modal and default to the "Buy" layout
export function openModal() {
    modal.classList.remove("hidden");
    showBuyFields(); // Default to "Buy" layout
    addTransactionButton.textContent = "Add";
    addTransactionButton.onclick = addTransaction; // Reset button behavior for adding
    console.log("Modal opened.");
}

// Close the modal and reset fields
export function closeModal() {
    modal.classList.add("hidden");
    priceInput.value = "";
    amountInput.value = "";
    console.log("Modal closed.");
}

// Show the "Buy" layout in the modal
export function showBuyFields() {
    transactionInputs.classList.remove("hidden");
    priceLabel.textContent = "Buy Price per Coin:";
    amountLabel.textContent = "USD to Spend:";
    console.log("Modal switched to BUY layout.");
}

// Show the "Sell" layout in the modal
export function showSellFields() {
    transactionInputs.classList.remove("hidden");
    priceLabel.textContent = "Sell Price per Coin:";
    amountLabel.textContent = "Number of Coins to Sell:";

    const portfolio = portfolios.get(currencySelect.value);
    if (portfolio) {
        const totalCoinsHeld = portfolio.transactions.reduce((sum, tx) => {
            return tx.type === "buy" ? sum + tx.quantity : sum - tx.quantity;
        }, 0);

        amountInput.value = totalCoinsHeld > 0 ? totalCoinsHeld.toFixed(4) : "";
        console.log(`Prepopulated "Coins to Sell" with: ${totalCoinsHeld.toFixed(4)}`);
    } else {
        console.warn("No portfolio found for selected currency.");
    }
}

// Add a transaction (Buy or Sell)
export function addTransaction() {
    const type = priceLabel.textContent.includes("Buy") ? "buy" : "sell";
    const currency = currencySelect.value;
    const price = parseFloat(priceInput.value);
    const amount = parseFloat(amountInput.value);

    if (!currency || isNaN(price) || isNaN(amount)) {
        console.error("Invalid transaction data.");
        return;
    }

    let portfolio = portfolios.get(currency);

    if (!portfolio) {
        portfolio = { name: currency, transactions: [] };
        portfolios.set(currency, portfolio);
    }

    const quantity = type === "buy" ? amount / price : amount;
    const fees = type === "buy" ? amount * 0.004 : quantity * price * 0.004;
    const total = type === "buy" ? amount + fees : quantity * price - fees;

    portfolio.transactions.push({ type, price, amount, quantity, fees, total });

    updateTransactionTable(portfolio);
    updateDashboard();

    closeModal();
    console.log("Transaction added:", { type, currency, price, amount });
}

// Open the modal to edit a transaction
export function openEditModal(currency, index) {
    const portfolio = portfolios.get(currency);

    if (!portfolio) {
        console.error(`Portfolio not found for currency: ${currency}`);
        return;
    }

    const transaction = portfolio.transactions[index];
    priceInput.value = transaction.price.toFixed(2);
    amountInput.value = transaction.type === "buy" ? transaction.amount.toFixed(2) : transaction.quantity.toFixed(4);
    currencySelect.value = currency;
    transactionInputs.classList.remove("hidden");
    modal.classList.remove("hidden");

    const transactionType = transaction.type === "buy" ? "buy" : "sell";
    document.querySelector(`input[name="transaction-type"][value="${transactionType}"]`).checked = true;

    addTransactionButton.textContent = "Save";
    addTransactionButton.onclick = () => {
        const updatedTransaction = {
            type: transactionType,
            currency,
            price: parseFloat(priceInput.value),
            amount: parseFloat(amountInput.value),
            quantity:
                transactionType === "buy"
                    ? parseFloat(amountInput.value) / parseFloat(priceInput.value)
                    : parseFloat(amountInput.value),
            fees:
                transactionType === "buy"
                    ? parseFloat(amountInput.value) * 0.004
                    : parseFloat(amountInput.value) * parseFloat(priceInput.value) * 0.004,
            total:
                transactionType === "buy"
                    ? parseFloat(amountInput.value) * (1 + 0.004)
                    : parseFloat(amountInput.value) * parseFloat(priceInput.value) * (1 - 0.004),
        };

        portfolio.transactions[index] = updatedTransaction;
        updateTransactionTable(portfolio);
        updateDashboard();

        closeModal();
        console.log(`Transaction updated at index ${index}:`, updatedTransaction);
    };

    console.log(`Edit modal opened for transaction at index ${index} for currency: ${currency}`);
}
