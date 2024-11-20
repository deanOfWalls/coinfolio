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
const ownedCoinsPanel = document.getElementById('owned-coins-panel'); // Panel for owned coins
const transactionTable = document.getElementById('transaction-table'); // Transaction table
const dashboardElements = {
    averagePrice: document.getElementById('average-price'),
    totalCoins: document.getElementById('total-coins'),
    totalFees: document.getElementById('total-fees'),
    profitLoss: document.getElementById('profit-loss'),
};

// Dashboard state
let activeCurrency = null; // Currently selected coin
const portfolios = new Map(); // Track portfolios by coin

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
openModalButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
    transactionInputs.classList.add('hidden'); // Reset transaction inputs
    buyRadio.checked = true; // Default to "Buy"
    updateInputFields();
    console.log('Modal shown.');
});

// Hide modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    transactionInputs.classList.add('hidden');
    console.log('Modal closed.');
});

// Update input fields based on transaction type
function updateInputFields() {
    if (buyRadio.checked) {
        priceLabel.textContent = 'Buy Price per Coin:';
        amountLabel.textContent = 'USD to Spend:';
    } else {
        priceLabel.textContent = 'Sell Price per Coin:';
        amountLabel.textContent = 'Number of Coins to Sell:';
    }
    transactionInputs.classList.remove('hidden');
}

// Add listeners for radio buttons
buyRadio.addEventListener('change', updateInputFields);
sellRadio.addEventListener('change', updateInputFields);

// Add transaction logic
addTransactionButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = portfolios.get(currency)?.name || currencySelect.options[currencySelect.selectedIndex].text;
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
        portfolio = createPortfolio(currency, currencyName);
        addCoinToOwnedPanel(currency, currencyName); // Add coin to the owned panel
    }

    const quantity = type === 'buy' ? amount / price : amount;
    const fees = type === 'buy' ? amount * 0.004 : (quantity * price) * 0.004;
    const total = type === 'buy' ? amount + fees : (quantity * price) - fees;

    // Add transaction to the portfolio
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
    updateDashboard(portfolio);

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

// Add a coin button to the "Owned Coins" panel
function addCoinToOwnedPanel(currency, currencyName) {
    const button = document.createElement('button');
    button.className = 'coin-button';
    button.textContent = currencyName;
    button.title = currency;
    button.addEventListener('click', () => {
        activeCurrency = currency;
        const portfolio = portfolios.get(currency);
        updateTransactionTable(portfolio);
        updateDashboard(portfolio);
        console.log(`Switched to portfolio: ${currencyName}`);
    });
    ownedCoinsPanel.appendChild(button);
    console.log(`Coin added to owned panel: ${currencyName}`);
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
        } else if (tx.type === 'sell') {
            totalCoins -= tx.quantity;
            profitLoss += tx.total - tx.fees;
            totalFees += tx.fees;
        }
    });

    dashboardElements.averagePrice.textContent = totalCoins > 0 ? (totalSpent / totalCoins).toFixed(2) : '-';
    dashboardElements.totalCoins.textContent = totalCoins.toFixed(4);
    dashboardElements.totalFees.textContent = totalFees.toFixed(2);
    dashboardElements.profitLoss.textContent = profitLoss.toFixed(2);
    console.log(`Dashboard updated for portfolio:`, portfolio.name);
}

// Populate dropdown with cryptocurrencies
async function populateCurrencyDropdown() {
    try {
        const response = await fetch('https://api.kraken.com/0/public/AssetPairs');
        const data = await response.json();

        if (data.error && data.error.length) {
            throw new Error('Error returned from Kraken API.');
        }

        const assetPairs = data.result;
        const currencies = new Map();

        for (const pair in assetPairs) {
            const baseCurrency = assetPairs[pair].base.replace(/^[XZ]/, '');
            const name = fallbackCurrencyNames[baseCurrency] || baseCurrency;
            currencies.set(baseCurrency, name);
        }

        currencySelect.innerHTML = '';
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
    }
}
