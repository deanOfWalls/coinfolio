const newCoinButton = document.getElementById('new-coin-button'); // Add Cryptocurrency Button
const modal = document.getElementById('modal'); // Modal Container
const closeModalButton = document.getElementById('close-modal'); // Cancel Button
const addCoinButton = document.getElementById('add-coin'); // Add Cryptocurrency Modal Button
const currencySelect = document.getElementById('currency-select'); // Dropdown for Cryptocurrencies
const tabsContainer = document.getElementById('tabs'); // Tabs Container

// Global dashboard state
const dashboard = {
    totalCoins: 0,
    totalSpent: 0,
    totalFees: 0,
    profitLoss: 0,
};

// Fee Rates
const defaultFeeRate = 0.004; // 0.40% taker fee

// Fallback mapping for coin names
const fallbackCurrencyNames = {
    XDG: "Dogecoin",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    XRP: "Ripple",
    LTC: "Litecoin",
    // Add more fallback mappings as needed
};

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
            const name = fallbackCurrencyNames[base] || base; // Use fallback or default to abbreviation
            currencies.set(base, name);
        }

        // Populate the dropdown
        currencySelect.innerHTML = ''; // Clear existing options
        Array.from(currencies.entries())
            .sort((a, b) => a[1].localeCompare(b[1])) // Sort by name
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

// Modal control logic
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal
});

closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
});

addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;
    addNewTab(currency, currencyName);
    modal.classList.add('hidden'); // Hide modal after adding
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

    const transactionType = section.querySelector('#transaction-type');
    const priceLabel = section.querySelector('#price-label');
    const usdLabel = section.querySelector('#usd-label');
    const maxButton = section.querySelector('#max-coins');
    const priceInput = section.querySelector('#price');
    const usdInput = section.querySelector('#usdAmount');

    transactionType.addEventListener('change', () => {
        if (transactionType.value === 'sell') {
            priceLabel.textContent = 'Sell Price per Coin:';
            usdLabel.textContent = 'Number of Coins:';
            maxButton.classList.remove('hidden');
        } else {
            priceLabel.textContent = 'Buy Price per Coin:';
            usdLabel.textContent = 'USD to Spend:';
            maxButton.classList.add('hidden');
        }
    });

    maxButton.addEventListener('click', () => {
        usdInput.value = dashboard.totalCoins.toFixed(4);
    });

    // Handle adding a transaction
    section.querySelector('#add-transaction').addEventListener('click', () => {
        const type = transactionType.value;
        const price = parseFloat(priceInput.value);
        const usdAmount = parseFloat(usdInput.value);

        if (isNaN(price) || isNaN(usdAmount) || usdAmount <= 0) {
            alert("Please enter valid inputs.");
            return;
        }

        const quantity = type === 'buy' ? usdAmount / price : usdAmount;
        const fees = usdAmount * defaultFeeRate;
        const total = type === 'buy' ? usdAmount + fees : usdAmount - fees;

        if (type === 'sell' && quantity > dashboard.totalCoins) {
            alert("You cannot sell more coins than you own.");
            return;
        }

        // Update KPIs
        if (type === 'buy') {
            dashboard.totalCoins += quantity;
            dashboard.totalSpent += usdAmount;
        } else {
            dashboard.totalCoins -= quantity;
            dashboard.profitLoss += usdAmount - (quantity * (dashboard.totalSpent / dashboard.totalCoins));
        }
        dashboard.totalFees += fees;

        updateDashboard();

        // Add transaction to table
        const tbody = section.querySelector('tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${price.toFixed(2)}</td>
            <td>${usdAmount.toFixed(2)}</td>
            <td>${quantity.toFixed(4)}</td>
            <td>${fees.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
            <td><button class="remove-btn">Remove</button></td>
        `;
        tbody.appendChild(row);

        // Remove transaction logic
        row.querySelector('.remove-btn').addEventListener('click', () => {
            tbody.removeChild(row);
            if (type === 'buy') {
                dashboard.totalCoins -= quantity;
                dashboard.totalSpent -= usdAmount;
            } else {
                dashboard.totalCoins += quantity;
                dashboard.profitLoss -= usdAmount - (quantity * (dashboard.totalSpent / dashboard.totalCoins));
            }
            dashboard.totalFees -= fees;
            updateDashboard();
        });
    });

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
modal.classList.add('hidden'); // Ensure modal is hidden on load
