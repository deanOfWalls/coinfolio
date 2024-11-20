const tabsContainer = document.getElementById('tabs-container');
const newTabButton = document.getElementById('new-tab-button');

// Fallback currency mapping
const fallbackCurrencies = {
    XDG: "Dogecoin",
    XMR: "Monero",
    XXBT: "Bitcoin",
    ZUSD: "USD",
    ZEUR: "Euro",
};

// Function to fetch and map Kraken currencies
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

        // Extract base currencies and their human-readable names
        for (const pair in assetPairs) {
            const base = assetPairs[pair].base.replace(/^[XZ]/, '');
            const altName = fallbackCurrencies[base] || base;
            currencies.set(base, altName);
        }

        // Convert to sorted array and populate dropdowns
        const sortedCurrencies = Array.from(currencies.entries()).sort((a, b) => a[1].localeCompare(b[1]));
        populateDropdowns(sortedCurrencies);
    } catch (error) {
        console.error("Error fetching currencies:", error);
        // Populate dropdowns with fallback data in case of API failure
        populateDropdowns(Object.entries(fallbackCurrencies));
    }
}

// Populate dropdown menus with currencies
function populateDropdowns(currencies) {
    const currencySelectors = document.querySelectorAll('.currency-select');
    currencySelectors.forEach(select => {
        select.innerHTML = '';
        currencies.forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${name} (${code})`;
            select.appendChild(option);
        });
    });
}

// Add a new tab
function addNewTab() {
    const tab = document.createElement('div');
    tab.className = 'tab';

    tab.innerHTML = `
        <h2>New Cryptocurrency</h2>
        <label for="currency">Currency:</label>
        <select class="currency-select"></select>
        <div class="transaction-input">
            <label for="price">Price per Coin:</label>
            <input type="number" id="price" step="0.01" placeholder="Enter price">

            <label for="usdSpent">USD Spent:</label>
            <input type="number" id="usdSpent" step="0.01" placeholder="Enter USD spent">

            <button id="add-transaction">Add Transaction</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Price</th>
                    <th>USD Spent</th>
                    <th>Quantity</th>
                    <th>Fees</th>
                    <th>Total (with Fees)</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    tabsContainer.appendChild(tab);
    fetchAndPopulateCurrencies();

    // Add transaction handler
    tab.querySelector('#add-transaction').addEventListener('click', () => {
        const price = parseFloat(tab.querySelector('#price').value);
        const usdSpent = parseFloat(tab.querySelector('#usdSpent').value);

        if (isNaN(price) || isNaN(usdSpent)) {
            alert("Please enter valid values for both fields.");
            return;
        }

        const quantity = usdSpent / price;
        const fees = usdSpent * 0.0040; // Assume taker fee of 0.40%
        const total = usdSpent + fees;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${price.toFixed(2)}</td>
            <td>${usdSpent.toFixed(2)}</td>
            <td>${quantity.toFixed(4)}</td>
            <td>${fees.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
        `;
        tab.querySelector('tbody').appendChild(row);
    });
}

// Initialize the app
newTabButton.addEventListener('click', addNewTab);
window.addEventListener('load', fetchAndPopulateCurrencies);
