// Select elements
const modal = document.getElementById('modal');
const currencySelect = document.getElementById('currency-select');
const transactionInputs = document.getElementById('transaction-inputs');
const openModalButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');
const addTransactionButton = document.getElementById('add-transaction');
const buyRadio = document.getElementById('buy-radio');
const sellRadio = document.getElementById('sell-radio');
const priceLabel = document.getElementById('price-label');
const amountLabel = document.getElementById('amount-label');
const priceInput = document.getElementById('price-input');
const amountInput = document.getElementById('amount-input');
const coinPanel = document.getElementById('coin-panel');
const transactionTable = document.getElementById('transaction-table');
const dashboardElements = {
    averagePrice: document.getElementById('average-price'),
    totalCoins: document.getElementById('total-coins'),
    totalFees: document.getElementById('total-fees'),
    profitLoss: document.getElementById('profit-loss'),
};

// Dashboard state
let activeCurrency = null;
const portfolios = new Map(); // Track portfolios by coin

// Populate currency dropdown
async function populateCurrencyDropdown() {
    const fallbackCurrencies = {
        BTC: "Bitcoin",
        ETH: "Ethereum",
        XDG: "Dogecoin",
    };

    for (const [code, name] of Object.entries(fallbackCurrencies)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${name} (${code})`;
        currencySelect.appendChild(option);
    }
}

// Modal visibility
document.addEventListener('DOMContentLoaded', async () => {
    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
    await populateCurrencyDropdown();
});

// Show modal
openModalButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

// Hide modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
});

// Update input fields
buyRadio.addEventListener('click', () => {
    priceLabel.textContent = 'Buy Price per Coin:';
    amountLabel.textContent = 'USD to Spend:';
    transactionInputs.classList.remove('hidden');
});

sellRadio.addEventListener('click', () => {
    priceLabel.textContent = 'Sell Price per Coin:';
    amountLabel.textContent = 'Number of Coins to Sell:';
    transactionInputs.classList.remove('hidden');
});

// Add transaction logic
addTransactionButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const price = parseFloat(priceInput.value);
    const amount = parseFloat(amountInput.value);

    if (!currency || isNaN(price) || isNaN(amount)) {
        alert("Please fill in all fields.");
        return;
    }

    const type = buyRadio.checked ? 'buy' : 'sell';
    let portfolio = portfolios.get(currency);

    // Create portfolio if it doesn't exist
    if (!portfolio) {
        portfolio = { transactions: [] };
        portfolios.set(currency, portfolio);
        addCoinToPanel(currency);
    }

    const quantity = type === 'buy' ? amount / price : amount;
    const fees = quantity * 0.004;
    const total = type === 'buy' ? amount + fees : (quantity * price) - fees;

    portfolio.transactions.push({ type, price, amount, quantity, fees, total });
    updateTransactionTable(portfolio);
    updateDashboard(portfolio);

    modal.classList.add('hidden');
});

// Add coin to panel
function addCoinToPanel(currency) {
    const button = document.createElement('button');
    button.className = 'coin-button';
    button.textContent = currency;
    button.addEventListener('click', () => {
        activeCurrency = currency;
        const portfolio = portfolios.get(currency);
        updateTransactionTable(portfolio);
        updateDashboard(portfolio);
    });
    coinPanel.appendChild(button);
}

// Update transaction table
function updateTransactionTable(portfolio) {
    transactionTable.innerHTML = '';
    portfolio.transactions.forEach((tx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tx.type}</td>
            <td>${tx.price.toFixed(2)}</td>
            <td>${tx.amount.toFixed(2)}</td>
            <td>${tx.quantity.toFixed(4)}</td>
            <td>${tx.fees.toFixed(2)}</td>
            <td>${tx.total.toFixed(2)}</td>
        `;
        transactionTable.appendChild(row);
    });
}

// Update dashboard
function updateDashboard(portfolio) {
    let totalCoins = 0;
    let totalSpent = 0;
    let totalFees = 0;
    let profitLoss = 0;

    portfolio.transactions.forEach((tx) => {
        if (tx.type === 'buy') {
            totalCoins += tx.quantity;
            totalSpent += tx.amount;
            totalFees += tx.fees;
        } else {
            totalCoins -= tx.quantity;
            profitLoss += tx.total - tx.fees;
        }
    });

    dashboardElements.averagePrice.textContent = totalCoins > 0 ? (totalSpent / totalCoins).toFixed(2) : '-';
    dashboardElements.totalCoins.textContent = totalCoins.toFixed(4);
    dashboardElements.totalFees.textContent = totalFees.toFixed(2);
    dashboardElements.profitLoss.textContent = profitLoss.toFixed(2);
}
