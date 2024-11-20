const newCoinButton = document.getElementById('new-coin-button'); // Add Transaction Button
const modal = document.getElementById('modal'); // Modal Container
const closeModalButton = document.getElementById('close-modal'); // Modal Cancel Button
const addCoinButton = document.getElementById('add-coin'); // Modal Add Button
const currencySelect = document.getElementById('currency-select'); // Dropdown for Cryptocurrency
const tabsContainer = document.getElementById('tabs'); // Tabs Container
const dashboard = {
    totalCoins: 0,
    totalSpent: 0,
    totalFees: 0,
    profitLoss: 0,
};

// Fee Rates
const defaultFeeRate = 0.004; // 0.40% taker fee

// Fetch and populate Kraken's currency list
async function fetchAndPopulateCurrencies() {
    try {
        const response = await fetch('https://api.kraken.com/0/public/AssetPairs');
        const data = await response.json();
        if (data.error && data.error.length) {
            console.error("API Error:", data.error);
            return;
        }

        const assetPairs = data.result;
        const currencies = new Map();

        // Extract unique base currencies and clean their names
        for (const pair in assetPairs) {
            const base = assetPairs[pair].base.replace(/^[XZ]/, ''); // Clean Kraken abbreviation
            const name = base; // Placeholder for actual names (Kraken API doesn't provide names directly)
            currencies.set(base, name);
        }

        // Populate the dropdown
        currencySelect.innerHTML = '';
        Array.from(currencies.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${name} (${code})`;
                currencySelect.appendChild(option);
            });
    } catch (error) {
        console.error("Failed to fetch Kraken currencies:", error);
    }
}

// Event listeners for modal
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show the modal
});

closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide the modal
});

addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;
    addNewTab(currency, currencyName);
    modal.classList.add('hidden'); // Hide the modal after adding
});

// Add a new tab for a cryptocurrency
function addNewTab(currency, currencyName) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currencyName;
    tabsContainer.appendChild(tab);

    // Create the portfolio section for this cryptocurrency
    const portfolioSection = createPortfolioSection(currency, currencyName);
    document.body.appendChild(portfolioSection);

    tab.addEventListener('click', () => {
        document.querySelectorAll('.portfolio-section').forEach((section) => {
            section.classList.add('hidden');
        });
        portfolioSection.classList.remove('hidden');
    });
}

// Create portfolio section for a cryptocurrency
function createPortfolioSection(currency, currencyName) {
    const section = document.createElement('div');
    section.className = 'portfolio-section hidden';
    section.innerHTML = `
        <h3>${currencyName} Portfolio</h3>
        <div class="transaction-input">
            <label for="transaction-type">Transaction Type:</label>
            <select id="transaction-type" class="transaction-type">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
            </select>

            <label id="price-label">Buy Price per Coin:</label>
            <input type="number" id="price" placeholder="Enter price per coin">

            <label id="usd-label">USD to Spend:</label>
            <input type="number" id="usdAmount" placeholder="Enter amount">

            <button id="max-coins" class="hidden">Max</button>

            <button id="add-transaction">Add Transaction</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>USD</th>
                    <th>Quantity</th>
                    <th>Fees</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    // Add logic for buy/sell and transaction handling here
    return section;
}

// Update dashboard KPIs
function updateDashboard() {
    document.getElementById('average-price').textContent = dashboard.totalCoins > 0
        ? (dashboard.totalSpent / dashboard.totalCoins).toFixed(2)
        : '-';
    document.getElementById('total-coins').textContent = dashboard.totalCoins.toFixed(4);
    document.getElementById('total-fees').textContent = dashboard.totalFees.toFixed(2);
    document.getElementById('profit-loss').textContent = dashboard.profitLoss.toFixed(2);
}

// Initialize app
fetchAndPopulateCurrencies();
