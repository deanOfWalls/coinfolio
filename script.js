// Select elements
const newCoinButton = document.getElementById('open-modal'); // Button to open modal
const closeModalButton = document.getElementById('close-modal'); // Cancel button
const buyButton = document.getElementById('buy-button'); // Buy button
const sellButton = document.getElementById('sell-button'); // Sell button
const addTransactionButton = document.getElementById('add-transaction'); // Add transaction button
const modal = document.getElementById('modal'); // Modal container
const transactionInputs = document.getElementById('transaction-inputs'); // Dynamic input container
const priceLabel = document.getElementById('price-label'); // Label for price input
const amountLabel = document.getElementById('amount-label'); // Label for amount input
const priceInput = document.getElementById('price-input'); // Input for price
const amountInput = document.getElementById('amount-input'); // Input for amount
const currencySelect = document.getElementById('currency-select'); // Dropdown for currencies
const tabsContainer = document.getElementById('tabs'); // Tabs container
const portfolioContainer = document.getElementById('portfolio-container'); // Portfolio container

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
    modal.classList.add('hidden'); // Hide modal by default
    transactionInputs.classList.add('hidden'); // Hide inputs by default
    console.log('Modal hidden on page load.');

    // Populate the cryptocurrency dropdown
    await populateCurrencyDropdown();
});

// Show modal
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal
    console.log('Modal shown.');
});

// Hide modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
    transactionInputs.classList.add('hidden'); // Reset inputs visibility
    console.log('Modal closed.');
});

// Show Buy input fields
buyButton.addEventListener('click', () => {
    transactionInputs.classList.remove('hidden'); // Show inputs
    priceLabel.textContent = 'Buy Price per Coin:';
    amountLabel.textContent = 'USD to Spend:';
    console.log('Buy inputs displayed.');
});

// Show Sell input fields
sellButton.addEventListener('click', () => {
    transactionInputs.classList.remove('hidden'); // Show inputs
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
    const quantity = type === 'buy' ? amount / price : amount;
    const fees = type === 'buy' ? amount * 0.004 : (quantity * price) * 0.004;
    const total = type === 'buy' ? amount + fees : (quantity * price) - fees;

    console.log(`Transaction added: ${type} ${currency}, Price: ${price}, Amount: ${amount}`);

    // Update dashboard (simple example)
    if (type === 'buy') {
        dashboard.totalCoins += quantity;
        dashboard.totalSpent += amount;
    } else {
        dashboard.totalCoins -= quantity;
        dashboard.profitLoss += total - fees;
    }

    updateDashboard();

    modal.classList.add('hidden'); // Close modal
    transactionInputs.classList.add('hidden'); // Reset inputs visibility
});

// Update dashboard UI
function updateDashboard() {
    document.getElementById('average-price').textContent =
        dashboard.totalCoins > 0 ? (dashboard.totalSpent / dashboard.totalCoins).toFixed(2) : '-';
    document.getElementById('total-coins').textContent = dashboard.totalCoins.toFixed(4);
    document.getElementById('total-fees').textContent = dashboard.totalFees.toFixed(2);
    document.getElementById('profit-loss').textContent = dashboard.profitLoss.toFixed(2);
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
