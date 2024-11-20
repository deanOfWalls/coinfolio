const tabsContainer = document.getElementById('tabs-container');
const newTabButton = document.getElementById('new-tab-button');

// Function to fetch and process Kraken's asset pairs
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
            if (base.startsWith('X') || base.startsWith('Z')) {
                currencies.add(base.substring(1));
            } else {
                currencies.add(base);
            }
        }

        // Convert Set to Array and sort
        const sortedCurrencies = Array.from(currencies).sort();

        // Populate the currency dropdown in each tab
        const currencySelectors = document.querySelectorAll('.currency-select');
        currencySelectors.forEach(select => {
            // Clear existing options
            select.innerHTML = '';
            // Add new options
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

// Function to add a new tab
function addNewTab() {
    const tab = document.createElement('div');
    tab.className = 'tab';

    tab.innerHTML = `
        <h2>New Cryptocurrency</h2>
        <label for="currency">Currency:</label>
        <select class="currency-select">
            <!-- Options will be populated dynamically -->
        </select>
        <div>
            <button class="add-transaction">+ Add Transaction</button>
            <table>
                <thead>
                    <tr>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Fees</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Transactions will go here -->
                </tbody>
            </table>
        </div>
        <canvas class="price-chart"></canvas>
    `;

    tabsContainer.appendChild(tab);

    // Populate the currency dropdown for the new tab
    fetchAndPopulateCurrencies();

    // Add event listener for fetching live prices and generating charts
    const currencySelector = tab.querySelector('.currency-select');
    currencySelector.addEventListener('change', () => updateTabData(tab, currencySelector.value));

    const addTransactionButton = tab.querySelector('.add-transaction');
    addTransactionButton.addEventListener('click', () => addTransaction(tab));
}

// Function to update tab data (price and chart)
async function updateTabData(tab, currencyPair) {
    const price = await fetchPrice(currencyPair);
    if (price) {
        console.log(`Current price for ${currencyPair}: ${price}`);
        renderChart(tab.querySelector('.price-chart'), currencyPair); // Placeholder for chart function
    }
}

// Function to fetch live prices using Kraken API
async function fetchPrice(currencyPair) {
    const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${currencyPair}`);
    const data = await response.json();
    if (data.error && data.error.length) {
        console.error("API Error:", data.error);
        return null;
    }
    return parseFloat(data.result[currencyPair].c[0]); // Current price
}

// Function to add a transaction
function addTransaction(tab) {
    const price = parseFloat(prompt("Enter the price per coin:"));
    const quantity = parseFloat(prompt("Enter the quantity:"));
    const fees = parseFloat(prompt("Enter the fees:") || 0);

    if (isNaN(price) || isNaN(quantity)) {
        alert("Invalid input. Please try again.");
        return;
    }

    const total = (price * quantity + fees).toFixed(2);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${price.toFixed(2)}</td>
        <td>${quantity}</td>
        <td>${fees.toFixed(2)}</td>
        <td>${total}</td>
    `;

    tab.querySelector('tbody').appendChild(row);
}

// Placeholder for chart rendering
function renderChart(canvas, currencyPair) {
    const data = {
        labels: ['1d', '7d', '1m', '1y', '5y'],
        datasets: [{
            label: `Price Chart (${currencyPair})`,
            data: [100, 200, 300, 400, 500], // Replace with fetched data
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
        }]
    };

    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data,
        options: {
            responsive: true,
            scales: {
                x: { display: true },
                y: { display: true }
            }
        }
    });
}

// Load tabs from localStorage
function loadTabsFromLocalStorage() {
    const savedTabs = JSON.parse(localStorage.getItem('coinfolioTabs') || '[]');
    savedTabs.forEach(data => {
        addNewTab();
        const tab = tabsContainer.lastChild;
        tab.querySelector('.currency-select').value = data.currency;
    });
}

// Save tabs to localStorage
function saveTabsToLocalStorage() {
    const tabsData = [...tabsContainer.children].map(tab => {
        const currency = tab.querySelector('.currency-select').value;
        return { currency };
    });

    localStorage.setItem('coinfolioTabs', JSON.stringify(tabsData));
}

// Event listeners
newTabButton.addEventListener('click', addNewTab);
window.addEventListener('load', () => {
    fetchAndPopulateCurrencies();
    loadTabsFromLocalStorage();
});
window.addEventListener('beforeunload', saveTabsToLocalStorage);
