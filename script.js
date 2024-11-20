const tabsContainer = document.getElementById('tabs-container');
const newTabButton = document.getElementById('new-tab-button');

// Global KPIs
let totalCoins = 0;
let totalSpent = 0;
let totalFees = 0;
let profitLoss = 0;

// Fee Rates
const feeSchedule = [
    { minVolume: 0, maxVolume: 10000, maker: 0.0025, taker: 0.0040 },
    { minVolume: 10001, maxVolume: 50000, maker: 0.0020, taker: 0.0035 },
    { minVolume: 50001, maxVolume: 100000, maker: 0.0014, taker: 0.0024 },
];

// Add a new tab
function addNewTab() {
    const tab = document.createElement('div');
    tab.className = 'tab';

    tab.innerHTML = `
        <h3>New Cryptocurrency</h3>
        <div class="transaction-input">
            <label>Transaction Type:</label>
            <select id="transaction-type">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
            </select>

            <label>Price per Coin:</label>
            <input type="number" id="price" placeholder="Enter price per coin">

            <label>USD Spent/Earned:</label>
            <input type="number" id="usdSpent" placeholder="Enter USD amount">

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
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    tabsContainer.appendChild(tab);

    tab.querySelector('#add-transaction').addEventListener('click', () => {
        const type = tab.querySelector('#transaction-type').value;
        const price = parseFloat(tab.querySelector('#price').value);
        const usdSpent = parseFloat(tab.querySelector('#usdSpent').value);

        if (isNaN(price) || isNaN(usdSpent)) {
            alert("Please enter valid inputs.");
            return;
        }

        const quantity = usdSpent / price;
        const fee = usdSpent * 0.004; // Default to taker fee
        const total = type === 'buy' ? usdSpent + fee : usdSpent - fee;

        // Update KPIs
        if (type === 'buy') {
            totalCoins += quantity;
            totalSpent += usdSpent;
        } else {
            totalCoins -= quantity;
            profitLoss += usdSpent - (quantity * (totalSpent / totalCoins));
        }
        totalFees += fee;

        updateDashboard();

        // Add row to table
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${price.toFixed(2)}</td>
            <td>${usdSpent.toFixed(2)}</td>
            <td>${quantity.toFixed(4)}</td>
            <td>${fee.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
        `;
        tab.querySelector('tbody').appendChild(row);
    });
}

// Update dashboard KPIs
function updateDashboard() {
    document.getElementById('average-price').textContent = (totalSpent / totalCoins).toFixed(2);
    document.getElementById('total-coins').textContent = totalCoins.toFixed(4);
    document.getElementById('total-fees').textContent = totalFees.toFixed(2);
    document.getElementById('profit-loss').textContent = profitLoss.toFixed(2);
}

// Initialize app
newTabButton.addEventListener('click', addNewTab);
