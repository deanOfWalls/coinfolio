const tabsContainer = document.getElementById('tabs-container');
const newTabButton = document.getElementById('new-tab-button');

// Kraken fee schedule
const feeSchedule = [
    { minVolume: 0, maxVolume: 10000, maker: 0.0025, taker: 0.0040 },
    { minVolume: 10001, maxVolume: 50000, maker: 0.0020, taker: 0.0035 },
    { minVolume: 50001, maxVolume: 100000, maker: 0.0014, taker: 0.0024 },
    { minVolume: 100001, maxVolume: 250000, maker: 0.0012, taker: 0.0022 },
    { minVolume: 250001, maxVolume: 500000, maker: 0.0010, taker: 0.0020 },
    { minVolume: 500001, maxVolume: 1000000, maker: 0.0008, taker: 0.0018 },
    { minVolume: 1000001, maxVolume: 2500000, maker: 0.0006, taker: 0.0016 },
    { minVolume: 2500001, maxVolume: 5000000, maker: 0.0004, taker: 0.0014 },
    { minVolume: 5000001, maxVolume: 10000000, maker: 0.0002, taker: 0.0012 },
    { minVolume: 10000001, maxVolume: Infinity, maker: 0.0000, taker: 0.0010 },
];

// Function to fetch and populate currencies
async function fetchAndPopulateCurrencies() {
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
            const base = assetPairs[pair].base;
            const cleanedBase = base.replace(/^[XZ]/, '');
            currencies.add(cleanedBase);
        }

        // Convert Set to Array and sort
        const sortedCurrencies = Array.from(currencies).sort();

        // Populate currency selectors in all tabs
        const currencySelectors = document.querySelectorAll('.currency-select');
        currencySelectors.forEach(select => {
            select.innerHTML = '';
            sortedCurrencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error("Error fetching asset pairs:", error);
    }
}

// Calculate fee based on 30-day volume
function calculateFee(volume, isMaker) {
    const tier = feeSchedule.find(
        tier => volume >= tier.minVolume && volume <= tier.maxVolume
    );
    return isMaker ? tier.maker : tier.taker;
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

            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" step="0.0001" placeholder="Enter quantity">

            <label for="volume">30-Day Volume (USD):</label>
            <input type="number" id="volume" step="1000" placeholder="Enter your 30-day volume">

            <label for="role">Role:</label>
            <select id="role">
                <option value="maker">Maker</option>
                <option value="taker">Taker</option>
            </select>

            <button id="add-transaction">Add Transaction</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Price</th>
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

    // Handle adding transactions
    tab.querySelector('#add-transaction').addEventListener('click', () => {
        const price = parseFloat(tab.querySelector('#price').value);
        const quantity = parseFloat(tab.querySelector('#quantity').value);
        const volume = parseFloat(tab.querySelector('#volume').value);
        const role = tab.querySelector('#role').value;

        if (isNaN(price) || isNaN(quantity) || isNaN(volume)) {
            alert("Please fill in all fields correctly.");
            return;
        }

        const feeRate = calculateFee(volume, role === 'maker');
        const total = price * quantity;
        const fees = total * feeRate;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${price.toFixed(2)}</td>
            <td>${quantity.toFixed(4)}</td>
            <td>${fees.toFixed(2)}</td>
            <td>${(total + fees).toFixed(2)}</td>
        `;
        tab.querySelector('tbody').appendChild(row);
    });
}

// Initialize app
newTabButton.addEventListener('click', addNewTab);
window.addEventListener('load', fetchAndPopulateCurrencies);
