import { transactionTable } from "./domElements.js";
import { portfolios } from "./state.js";
import { updateDashboard } from "./dashboard.js";
import { openEditModal } from "./modalHandlers.js";

export function updateTransactionTable(portfolio) {
    transactionTable.innerHTML = portfolio.transactions
        .map((tx, index) => `
        <tr>
            <td>${tx.type}</td>
            <td>${tx.price.toFixed(2)}</td>
            <td>${tx.amount.toFixed(2)}</td>
            <td>${tx.quantity.toFixed(4)}</td>
            <td>$${tx.fees.toFixed(2)}</td>
            <td>$${tx.total.toFixed(2)}</td>
            <td>
                <button class="edit-transaction" data-index="${index}" data-currency="${portfolio.name}">✏️</button>
                <button class="delete-transaction" data-index="${index}" data-currency="${portfolio.name}">🗑️</button>
            </td>
        </tr>`)
        .join("");

    transactionTable.querySelectorAll(".edit-transaction").forEach((button) => {
        button.addEventListener("click", (e) => {
            const currency = e.target.dataset.currency;
            const index = e.target.dataset.index;
            openEditModal(currency, index);
        });
    });

    transactionTable.querySelectorAll(".delete-transaction").forEach((button) => {
        button.addEventListener("click", (e) => {
            const currency = e.target.dataset.currency;
            const index = e.target.dataset.index;
            deleteTransaction(currency, index);
        });
    });

    console.log("Transaction table updated.");
}

export function deleteTransaction(currency, index) {
    const portfolio = portfolios.get(currency);

    if (!portfolio) {
        console.error(`Portfolio not found for currency: ${currency}`);
        return;
    }

    portfolio.transactions.splice(index, 1);
    updateTransactionTable(portfolio);
    updateDashboard();

    console.log(`Transaction at index ${index} deleted for currency: ${currency}`);
}

export function editTransaction(currency, index, updatedTransaction) {
    const portfolio = portfolios.get(currency);

    if (!portfolio) {
        console.error(`Portfolio not found for currency: ${currency}`);
        return;
    }

    portfolio.transactions[index] = updatedTransaction;
    updateTransactionTable(portfolio);
    updateDashboard();

    console.log(`Transaction at index ${index} updated for currency: ${currency}`);
}
