const tabsContainer = document.getElementById('tabs-container');
const newTabButton = document.getElementById('new-tab-button');

// Global KPIs
let totalCoins = 0;
let totalSpent = 0;
let totalFees = 0;
let profitLoss = 0;

// Fee Rates
const defaultFeeRate = 0.004; // 0.40% taker fee

// Add a new tab
function addNewTab() {
    const tab = document.createElement('div');
    tab.className = 'tab';

    tab.innerHTML = `
        <h3>New Cryptocurrency</h3>
        <label for="currency">Select Currency:</label>
        <select class="currency-select">
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="DOGE">Dogecoin (DOGE)</option>
        </select>
        <div class="transaction-input">
            <label for="transaction-type">Transaction Type:</label>
            <select id="transaction-type" class="transaction-type">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
            </select>

            <label id="price-label">Buy Price per Coin:</label>
            <input type="number" id="price" placeholder="Enter price per coin">

            <label id="usd-label">USD Spent:</label>
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
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    tabsContainer.appendChild(tab);

    const transactionType = tab.querySelector('#transaction-type');
    const priceLabel = tab.querySelector('#price-label');
    const usdLabel = tab.querySelector('#usd-label');

    transactionType.addEventListener('change', () => {
        if (transactionType.value === 'sell') {
            priceLabel.textContent = 'Sell Price per Coin:';
            usdLabel.textContent = 'USD Earned:';
        } else {
            priceLabel.textContent = 'Buy Price per Coin:';
            usdLabel.textContent = 'USD Spent:';
        }
    });

    tab.querySelector('#add-transaction').addEventListener('click', () => {
        const type = transactionType.value;
        const price = parseFloat(tab.querySelector('#price').value);
        const usdSpent = parseFloat(tab.querySelector('#usdSpent').value);

        if (isNaN(price) || isNaN(usdSpent)) {
            alert("Please enter valid inputs.");
            return;
        }

        const quantity = usdSpent / price;
        const fees = usdSpent * defaultFeeRate;
        const total = type === 'buy' ? usdSpent + fees : usdSpent - fees;

        // Update KPIs
        if (type === 'buy') {
            totalCoins += quantity;
            totalSpent += usdSpent;
        } else {
            totalCoins -= quantity;
            profitLoss += usdSpent - (quantity * (totalSpent / totalCoins));
        }
        totalFees += fees;

        updateDashboard();

        // Add row to table
        const tbody = tab.querySelector('tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${price.toFixed(2)}</td>
            <td>${usdSpent.toFixed(2)}</td>
            <td>${quantity.toFixed(4)}</td>
            <td>${fees.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
            <td><button class="remove-btn">Remove</button></td>
        `;
        tbody.appendChild(row);

        // Add remove functionality
        row.querySelector('.remove-btn').addEventListener('click', () => {
            tbody.removeChild(row);
            if (type === 'buy') {
                totalCoins -= quantity;
                totalSpent -= usdSpent;
            } else {
                totalCoins += quantity;
                profitLoss -= usdSpent - (quantity * (totalSpent / totalCoins));
            }
            totalFees -= fees;
            updateDashboard();
        });
    });
}

// Update dashboard KPIs
function updateDashboard() {
    document.getElementById('average-price').textContent = totalCoins > 0 ? (totalSpent / totalCoins).toFixed(2) : '-';
    document.getElementById('total-coins').textContent = totalCoins.toFixed(4);
    document.getElementById('total-fees').textContent = totalFees.toFixed(2);
    document.getElementById('profit-loss').textContent = profitLoss.toFixed(2);
}

// Initialize app
newTabButton.addEventListener('click', addNewTab);
