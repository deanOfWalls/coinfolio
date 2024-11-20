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
const dashboardElements = {
    averagePrice: document.getElementById('average-price'),
    totalCoins: document.getElementById('total-coins'),
    totalFees: document.getElementById('total-fees'),
    profitLoss: document.getElementById('profit-loss'),
};

const portfolios = new Map(); // Track portfolios by coin

// Modal visibility
document.addEventListener('DOMContentLoaded', () => {
    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
    populateCurrencyDropdown();
});

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

// Show modal
openModalButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

// Hide modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
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

// Add transaction
addTransactionButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const price = parseFloat(priceInput.value);
    const amount = parseFloat(amountInput.value);

    if (!currency || isNaN(price) || isNaN(amount)) {
        alert("Please fill in all fields.");
        return;
    }

    let portfolio = portfolios.get(currency);
    if (!portfolio) {
        portfolio = { transactions: [] };
        portfolios.set(currency, portfolio);
        addCoinToPanel(currency);
    }

    portfolio.transactions.push({ type: buyRadio.checked ? 'buy' : 'sell', price, amount });
    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
});

// Add coin to the panel
function addCoinToPanel(currency) {
    const button = document.createElement('button');
    button.className = 'coin-button';
    button.textContent = currency;
    button.addEventListener('click', () => {
        console.log(`Switched to ${currency}`);
    });
    coinPanel.appendChild(button);
}
