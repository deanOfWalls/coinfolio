// Select elements
const newCoinButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');
const buyButton = document.getElementById('buy-button');
const sellButton = document.getElementById('sell-button');
const addTransactionButton = document.getElementById('add-transaction');
const modal = document.getElementById('modal');
const transactionInputs = document.getElementById('transaction-inputs');
const priceLabel = document.getElementById('price-label');
const amountLabel = document.getElementById('amount-label');
const priceInput = document.getElementById('price-input');
const amountInput = document.getElementById('amount-input');
const currencySelect = document.getElementById('currency-select');
const tabsContainer = document.getElementById('tabs');
const portfolioContainer = document.getElementById('portfolio-container');

// Dashboard state
const dashboard = {
    totalCoins: 0,
    totalSpent: 0,
    totalFees: 0,
    profitLoss: 0,
};

// Map to track individual portfolios for cryptocurrencies
const portfolios = new Map();

// Fallback mapping for common cryptocurrency names
const fallbackCurrencyNames = {
    XDG: "Dogecoin",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    XRP: "Ripple",
    LTC: "Litecoin",
    ADA: "Cardano",
};

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', async () => {
    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
    console.log('Modal hidden on page load.');

    // Populate the cryptocurrency dropdown
    await populateCurrencyDropdown();
});

// Show modal
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
    console.log('Modal shown.');
});

// Hide modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
    console.log('Modal closed.');
});

// Show Buy input fields
buyButton.addEventListener('click', () => {
    transactionInputs.classList.remove('hidden');
    priceLabel.textContent = 'Buy Price per Coin:';
    amountLabel.textContent = 'USD to Spend:';
    console.log('Buy inputs displayed.');
});

// Show Sell input fields
sellButton.addEventListener('click', () => {
    transactionInputs.classList.remove('hidden');
    priceLabel.textContent = 'Sell Price per Coin:';
    amountLabel.textContent = 'Number of Coins to Sell:';
    console.log('Sell inputs displayed.');
});

// Add transaction logic
addTransactionButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const price = parseFloat(priceInput.value);
    const amount = parseFloat(amountInput.value);

    if (!currency || isNaN(price) || isNaN(amount)) {
        alert('Please fill in all fields.');
        return;
    }

    const type = priceLabel.textContent.includes('Buy') ? 'buy' : 'sell';
    const portfolio = portfolios.get(currency);

    if (!portfolio) {
        alert('Portfolio not found for this currency.');
        return;
    }

    const quantity = type === 'buy' ? amount / price : amount;
    const fees = type === 'buy' ? amount * 0.004 : (quantity * price) * 0.004;
    const total = type === 'buy' ? amount + fees : (quantity * price) - fees;

    // Add transaction to the portfolio's transaction list
    const transaction = {
        type,
        price,
        amount,
        quantity,
        fees,
        total,
    };
    portfolio.transactions.push(transaction);

    updateTransactionTable(portfolio);
    updateDashboard();

    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
    console.log(`Transaction added: ${type} ${currency}, Price: ${price}, Amount: ${amount}`);
});

// Update the transaction table
function updateTransactionTable(portfolio) {
    const tbody = portfolio.section.querySelector('tbody');
    tbody.innerHTML = ''; // Clear the table

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
        tbody.appendChild(row);
    });
}

// Populate dropdown with cryptocurrencies
async function populateCurrencyDropdown() {
    try {
        const response = await fetch('https://api.kraken.com/0/public/AssetPairs');
        const data = await response.json();

        if (data.error && data.error.length) {
            console.error("API Error:", data.error);
            return;
        }

        const assetPairs = data.result;
        const currencies = new Map();

        for (const pair in assetPairs) {
            const baseCurrency = assetPairs[pair].base.replace(/^[XZ]/, '');
            const name = fallbackCurrencyNames[baseCurrency] || baseCurrency;
            currencies.set(baseCurrency, name);
        }

        currencySelect.innerHTML = ''; // Clear existing options
        Array.from(currencies.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${name} (${code})`;
                currencySelect.appendChild(option);
            });

        console.log('Dropdown populated with currencies.');
    } catch (error) {
        console.error("Failed to fetch Kraken currencies:", error);
    }
}
