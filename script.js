const newCoinButton = document.getElementById('new-coin-button');
const modal = document.getElementById('modal');
const closeModalButton = document.getElementById('close-modal');
const addCoinButton = document.getElementById('add-coin');
const currencySelect = document.getElementById('currency-select');
const tabsContainer = document.getElementById('tabs');
const dashboard = {
    totalCoins: 0,
    totalSpent: 0,
    totalFees: 0,
    profitLoss: 0,
};

// Fee Rates
const defaultFeeRate = 0.004; // 0.40% taker fee

// Event listeners for modal
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
});

addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    addNewTab(currency);
    modal.classList.add('hidden');
});

// Add a new tab for a cryptocurrency
function addNewTab(currency) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currency;
    tabsContainer.appendChild(tab);

    // Create the portfolio section for this cryptocurrency
    const portfolioSection = createPortfolioSection(currency);
    document.body.appendChild(portfolioSection);

    tab.addEventListener('click', () => {
        document.querySelectorAll('.portfolio-section').forEach((section) => {
            section.classList.add('hidden');
        });
        portfolioSection.classList.remove('hidden');
    });
}

// Create portfolio section for a cryptocurrency
function createPortfolioSection(currency) {
    const section = document.createElement('div');
    section.className = 'portfolio-section';
    section.classList.add('hidden');
    section.innerHTML = `
        <h3>${currency} Portfolio</h3>
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

    // Event handlers for transaction inputs
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

    // Add transaction
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

        // Add row to table
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

        // Add remove functionality
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
