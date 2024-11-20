// Select elements
const newCoinButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');
const addCoinButton = document.getElementById('add-coin');
const modal = document.getElementById('modal');
const currencySelect = document.getElementById('currency-select'); // Dropdown for currencies
const tabsContainer = document.getElementById('tabs'); // Tabs container

// Dashboard state
const dashboard = {
    totalCoins: 0,
    totalSpent: 0,
    totalFees: 0,
    profitLoss: 0,
};

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', async () => {
    modal.classList.add('hidden'); // Hide modal by default
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
    console.log('Modal closed.');
});

// Add new cryptocurrency tab
addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;

    // Add a new tab
    addNewTab(currency, currencyName);

    // Hide modal
    modal.classList.add('hidden');
    console.log(`Added cryptocurrency: ${currencyName}`);
});

// Function to fetch and populate the dropdown with cryptocurrencies
async function populateCurrencyDropdown() {
    try {
        const response = await fetch('https://api.kraken.com/0/public/AssetPairs');
        const data = await response.json();

        if (data.error && data.error.length) {
            console.error("API Error:", data.error);
            return;
        }

        const assetPairs = data.result;
        const currencies = new Set();

        // Extract unique base currencies
        for (const pair in assetPairs) {
            const baseCurrency = assetPairs[pair].base.replace(/^[XZ]/, ''); // Clean Kraken's naming
            currencies.add(baseCurrency);
        }

        // Populate the dropdown
        currencySelect.innerHTML = ''; // Clear existing options
        Array.from(currencies)
            .sort()
            .forEach((currency) => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency; // For now, use just the symbol
                currencySelect.appendChild(option);
            });

        console.log('Dropdown populated with currencies.');
    } catch (error) {
        console.error("Failed to fetch Kraken currencies:", error);
    }
}

// Function to add a new tab
function addNewTab(currency, currencyName) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currencyName;
    tabsContainer.appendChild(tab);

    // Create portfolio section for the currency
    const portfolioSection = createPortfolioSection(currency, currencyName);
    document.body.appendChild(portfolioSection);

    // Tab click event
    tab.addEventListener('click', () => {
        // Hide all portfolio sections
        document.querySelectorAll('.portfolio-section').forEach((section) => {
            section.classList.add('hidden');
        });

        // Show the selected portfolio section
        portfolioSection.classList.remove('hidden');
    });
}

// Function to create portfolio section for a cryptocurrency
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

    // Update form dynamically based on transaction type
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

    // Max coins button for sell transactions
    maxButton.addEventListener('click', () => {
        usdInput.value = dashboard.totalCoins.toFixed(4); // Set to total coins
    });

    return section;
}
