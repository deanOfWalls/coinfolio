// Select elements
const newCoinButton = document.getElementById('new-coin-button'); // Add Transaction Button
const modal = document.getElementById('modal'); // Modal Container
const closeModalButton = document.getElementById('close-modal'); // Cancel Button
const addCoinButton = document.getElementById('add-coin'); // Add Cryptocurrency Button in Modal
const currencySelect = document.getElementById('currency-select'); // Dropdown for Cryptocurrencies
const tabsContainer = document.getElementById('tabs'); // Tabs Container

// Dashboard state
const dashboard = {
    totalCoins: 0,
    totalSpent: 0,
    totalFees: 0,
    profitLoss: 0,
};

// Ensure the modal is hidden on page load
window.onload = () => {
    modal.classList.add('hidden'); // Hide modal on load
};

// Show modal when "Add Transaction" button is clicked
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal
});

// Hide modal when "Cancel" button is clicked
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
});

// Add new cryptocurrency tab when "Add" button is clicked
addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;

    // Add new tab for the selected cryptocurrency
    addNewTab(currency, currencyName);

    // Hide modal after adding
    modal.classList.add('hidden');
});

// Add a new tab for a cryptocurrency
function addNewTab(currency, currencyName) {
    // Create a new tab element
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currencyName;
    tabsContainer.appendChild(tab);

    // Create a portfolio section for this cryptocurrency
    const portfolioSection = createPortfolioSection(currency, currencyName);
    document.body.appendChild(portfolioSection);

    // Switch to this tab when clicked
    tab.addEventListener('click', () => {
        document.querySelectorAll('.portfolio-section').forEach((section) => {
            section.classList.add('hidden'); // Hide all sections
        });
        portfolioSection.classList.remove('hidden'); // Show the selected section
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

    // Change labels dynamically based on transaction type
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

    // Handle "Max" button for sell transactions
    maxButton.addEventListener('click', () => {
        usdInput.value = dashboard.totalCoins.toFixed(4); // Set to total coins
    });

    // Handle "Add Transaction" button click
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

        // Update dashboard KPIs
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
