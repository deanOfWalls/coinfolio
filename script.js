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
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;
    const price = parseFloat(priceInput.value);
    const amount = parseFloat(amountInput.value);

    if (!currency || isNaN(price) || isNaN(amount)) {
        alert('Please fill in all fields.');
        return;
    }

    // Check if the portfolio exists, if not, create it
    if (!portfolios.has(currency)) {
        console.log(`Portfolio for ${currencyName} does not exist. Creating...`);
        createPortfolio(currency, currencyName);
    }

    const type = priceLabel.textContent.includes('Buy') ? 'buy' : 'sell';
    const portfolio = portfolios.get(currency);

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

// Create a portfolio for a cryptocurrency
function createPortfolio(currency, currencyName) {
    // Create a new tab
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currencyName;
    tabsContainer.appendChild(tab);

    // Create a new portfolio section
    const portfolioSection = document.createElement('div');
    portfolioSection.className = 'portfolio-section hidden';
    portfolioSection.innerHTML = `
        <h3>${currencyName} Portfolio</h3>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>USD</th>
                    <th>Quantity</th>
                    <th>Fees</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    // Initialize portfolio data
    const portfolio = {
        section: portfolioSection,
        transactions: [],
    };
    portfolios.set(currency, portfolio);

    // Add portfolio section to the container
    portfolioContainer.appendChild(portfolioSection);

    // Tab click event
    tab.addEventListener('click', () => {
        document.querySelectorAll('.portfolio-section').forEach((section) => {
            section.classList.add('hidden');
        });
        portfolioSection.classList.remove('hidden');
    });

    console.log(`Portfolio created for ${currencyName}`);
}

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

// Update dashboard UI
function updateDashboard() {
    // Reset dashboard totals
    let totalCoins = 0;
    let totalSpent = 0;
    let totalFees = 0;
    let profitLoss = 0;

    // Aggregate data from all portfolios
    portfolios.forEach((portfolio) => {
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
    });

    // Update dashboard totals
    dashboard.totalCoins = totalCoins;
    dashboard.totalSpent = totalSpent;
    dashboard.totalFees = totalFees;
    dashboard.profitLoss = profitLoss;

    // Update the dashboard display
    document.getElementById('average-price').textContent =
        dashboard.totalCoins > 0 ? (dashboard.totalSpent / dashboard.totalCoins).toFixed(2) : '-';
    document.getElementById('total-coins').textContent = dashboard.totalCoins.toFixed(4);
    document.getElementById('total-fees').textContent = dashboard.totalFees.toFixed(2);
    document.getElementById('profit-loss').textContent = dashboard.profitLoss.toFixed(2);

    console.log('Dashboard updated:', dashboard);
}
