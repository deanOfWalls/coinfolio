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
const coinPanel = document.getElementById('coin-panel'); // Panel for coin buttons
const transactionTable = document.querySelector('table tbody'); // Transaction table
const dashboardElements = {
    averagePrice: document.getElementById('average-price'),
    totalCoins: document.getElementById('total-coins'),
    totalFees: document.getElementById('total-fees'),
    profitLoss: document.getElementById('profit-loss'),
};

// State management
let activeCurrency = null; // Currently selected coin
const portfolios = new Map(); // Map to track individual portfolios for cryptocurrencies

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
    transactionInputs.classList.add('hidden'); // Hide inputs until a transaction type is selected
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
    priceInput.value = '';
    amountInput.value = '';
    console.log('Buy inputs displayed.');
});

// Show Sell input fields
sellButton.addEventListener('click', () => {
    transactionInputs.classList.remove('hidden');
    priceLabel.textContent = 'Sell Price per Coin:';
    amountLabel.textContent = 'Number of Coins to Sell:';
    priceInput.value = '';
    amountInput.value = '';
    console.log('Sell inputs displayed.');
});

// Add transaction logic
addTransactionButton.addEventListener('click', () => {
    const currency = activeCurrency || currencySelect.value;
    const currencyName = portfolios.get(currency)?.name || currencySelect.options[currencySelect.selectedIndex].text;
    const price = parseFloat(priceInput.value);
    const amount = parseFloat(amountInput.value);

    if (!currency || isNaN(price) || isNaN(amount)) {
        alert('Please fill in all fields.');
        return;
    }

    const type = priceLabel.textContent.includes('Buy') ? 'buy' : 'sell';
    let portfolio = portfolios.get(currency);

    // Create the portfolio if it doesn't exist
    if (!portfolio) {
        portfolio = createPortfolio(currency, currencyName);
        addCoinToPanel(currency, currencyName); // Add the coin to the panel
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
    updateDashboard(currency);

    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
    console.log(`Transaction added: ${type} ${currency}, Price: ${price}, Amount: ${amount}`);
});

// Create a portfolio for a cryptocurrency
function createPortfolio(currency, currencyName) {
    const portfolio = {
        name: currencyName,
        transactions: [],
    };
    portfolios.set(currency, portfolio);

    console.log(`Portfolio created for ${currencyName}`);
    return portfolio;
}

// Add a coin button to the panel
function addCoinToPanel(currency, currencyName) {
    const button = document.createElement('button');
    button.className = 'coin-button';
    button.textContent = currency; // Display coin symbol (e.g., BTC, XDG)
    button.title = currencyName; // Tooltip with full name
    button.addEventListener('click', () => {
        activeCurrency = currency;
        const portfolio = portfolios.get(currency);
        updateTransactionTable(portfolio);
        updateDashboard(currency);
        console.log(`Switched to portfolio: ${currencyName}`);
    });

    coinPanel.appendChild(button);
    console.log(`Coin button added for ${currencyName}`);
}

// Update the transaction table
function updateTransactionTable(portfolio) {
    transactionTable.innerHTML = ''; // Clear the table

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

// Update dashboard UI for the selected coin
function updateDashboard(currency) {
    const portfolio = portfolios.get(currency);

    if (!portfolio) {
        console.error("Portfolio not found for currency:", currency);
        return;
    }

    let totalCoins = 0;
    let totalSpent = 0;
    let totalFees = 0;
    let profitLoss = 0;

    portfolio.transactions.forEach((tx) => {
        if (tx.type === 'buy') {
            totalCoins += tx.quantity;
            totalSpent += tx.amount;
            totalFees += tx.fees;
        } else if (tx.type === 'sell') {
            totalCoins -= tx.quantity;
            profitLoss += tx.total - tx.fees;
            totalFees += tx.fees;
        }
    });

    // Update the dashboard display
    dashboardElements.averagePrice.textContent =
        totalCoins > 0 ? (totalSpent / totalCoins).toFixed(2) : '-';
    dashboardElements.totalCoins.textContent = totalCoins.toFixed(4);
    dashboardElements.totalFees.textContent = totalFees.toFixed(2);
    dashboardElements.profitLoss.textContent = profitLoss.toFixed(2);

    console.log(`Dashboard updated for ${currency}:`, {
        totalCoins,
        totalSpent,
        totalFees,
        profitLoss,
    });
}

// Populate dropdown with cryptocurrencies
async function populateCurrencyDropdown() {
    try {
        const response = await fetch('https://api.kraken.com/0/public/AssetPairs');

        if (!response.ok) {
            console.error(`API Error: ${response.statusText}`);
            throw new Error('Failed to fetch data from Kraken API.');
        }

        const data = await response.json();

        if (data.error && data.error.length) {
            console.error("API Error Response:", data.error);
            throw new Error('Error returned from Kraken API.');
        }

        const assetPairs = data.result;
        const currencies = new Map();

        // Extract unique base currencies and map their names
        for (const pair in assetPairs) {
            const baseCurrency = assetPairs[pair].base.replace(/^[XZ]/, ''); // Clean Kraken's symbols
            const name = fallbackCurrencyNames[baseCurrency] || baseCurrency; // Use fallback name or symbol
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
        console.error("Failed to populate currency dropdown:", error);

        // Fallback to manual entries if API fails
        currencySelect.innerHTML = ''; // Clear existing options
        Object.entries(fallbackCurrencyNames).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${name} (${code})`;
            currencySelect.appendChild(option);
        });

        console.warn('Fallback currency names used for dropdown.');
    }
}
