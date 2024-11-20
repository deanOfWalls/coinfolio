// Select elements
const newCoinButton = document.getElementById('new-coin-button'); // Add Transaction Button
const modal = document.getElementById('modal'); // Modal Container
const closeModalButton = document.getElementById('close-modal'); // Cancel Button
const addCoinButton = document.getElementById('add-coin'); // Add Cryptocurrency Button in Modal
const currencySelect = document.getElementById('currency-select'); // Dropdown for Cryptocurrencies
const tabsContainer = document.getElementById('tabs'); // Tabs Container

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    modal.classList.add('hidden'); // Hide modal by default
});

// Show modal when "Add Transaction" button is clicked
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal
});

// Hide modal when "Cancel" button is clicked
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
});

// Add new cryptocurrency tab when "Add" button in modal is clicked
addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;

    // Create a new tab for the selected cryptocurrency
    addNewTab(currency, currencyName);

    // Hide the modal after adding the cryptocurrency
    modal.classList.add('hidden');
});

// Function to add a new cryptocurrency tab
function addNewTab(currency, currencyName) {
    // Create a new tab element
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currencyName;

    // Append the tab to the tabs container
    tabsContainer.appendChild(tab);

    // Create a portfolio section for the selected cryptocurrency
    const portfolioSection = createPortfolioSection(currency, currencyName);
    document.body.appendChild(portfolioSection);

    // Switch to this tab when clicked
    tab.addEventListener('click', () => {
        // Hide all portfolio sections
        document.querySelectorAll('.portfolio-section').forEach((section) => {
            section.classList.add('hidden');
        });

        // Show the selected portfolio section
        portfolioSection.classList.remove('hidden');
    });
}

// Function to create a portfolio section for a cryptocurrency
function createPortfolioSection(currency, currencyName) {
    const section = document.createElement('div');
    section.className = 'portfolio-section hidden'; // Initially hidden
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

    // Return the new section
    return section;
}
