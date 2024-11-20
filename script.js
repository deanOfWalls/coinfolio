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

// Fallback mapping for common cryptocurrency names
const fallbackCurrencyNames = {
    XDG: "Dogecoin",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    XRP: "Ripple",
    LTC: "Litecoin",
    ADA: "Cardano",
    // Add more as needed
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
        const currencies = new Map();

        // Extract unique base currencies and map their names
        for (const pair in assetPairs) {
            const baseCurrency = assetPairs[pair].base.replace(/^[XZ]/, ''); // Clean Kraken's symbols
            const name = fallbackCurrencyNames[baseCurrency] || baseCurrency; // Use fallback name or symbol
            currencies.set(baseCurrency, name);
        }

        // Populate the dropdown
        currencySelect.innerHTML = ''; // Clear existing options
        Array.from(currencies.entries())
            .sort((a, b) => a[1].localeCompare(b[1])) // Sort by name
            .forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${name} (${code})`; // Full name with symbol
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
            <label>Transaction Type:</label>
            <select class="transaction-type">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
            </select>

            <label class="price-label">Buy Price per Coin:</label>
            <input type="number" class="price-input" placeholder="Enter price per coin">

            <label class="amount-label">USD to Spend:</label>
            <input type="number" class="amount-input" placeholder="Enter amount">

            <button class="add-transaction">Add Transaction</button>
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

    // Transaction Type Change Logic
    const transactionType = section.querySelector('.transaction-type');
    const priceLabel = section.querySelector('.price-label');
    const amountLabel = section.querySelector('.amount-label');

    transactionType.addEventListener('change', () => {
        if (transactionType.value === 'sell') {
            priceLabel.textContent = 'Sell Price per Coin:';
            amountLabel.textContent = 'Number of Coins to Sell:';
        } else {
            priceLabel.textContent = 'Buy Price per Coin:';
            amountLabel.textContent = 'USD to Spend:';
        }
    });

    // Add Transaction Logic
    section.querySelector('.add-transaction').addEventListener('click', () => {
        const type = transactionType.value;
        const price = parseFloat(section.querySelector('.price-input').value);
        const amount = parseFloat(section.querySelector('.amount-input').value);

        if (isNaN(price) || isNaN(amount) || price <= 0 || amount <= 0) {
            alert("Please enter valid inputs.");
            return;
        }

        const quantity = type === 'buy' ? amount / price : amount; // Quantity for buy or sell
        const fees = amount * 0.004; // Example: 0.40% fee
        const total = type === 'buy' ? amount + fees : amount - fees;

        // Add transaction to the table
        const tbody = section.querySelector('tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${price.toFixed(2)}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${quantity.toFixed(4)}</td>
            <td>${fees.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
            <td><button class="remove-btn">Remove</button></td>
        `;
        tbody.appendChild(row);

        // Remove transaction logic
        row.querySelector('.remove-btn').addEventListener('click', () => {
            tbody.removeChild(row);
        });
    });

    return section;
}
