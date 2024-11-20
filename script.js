const newCoinButton = document.getElementById('new-coin-button'); // Add Cryptocurrency Button
const modal = document.getElementById('modal'); // Modal Container
const closeModalButton = document.getElementById('close-modal'); // Cancel Button
const addCoinButton = document.getElementById('add-coin'); // Add Cryptocurrency Modal Button
const currencySelect = document.getElementById('currency-select'); // Dropdown for Cryptocurrencies
const tabsContainer = document.getElementById('tabs'); // Tabs Container

// Fee Rates
const defaultFeeRate = 0.004; // 0.40% taker fee

// Ensure the modal is hidden on page load
modal.classList.add('hidden');

// Show the modal when "Add Transaction" is clicked
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal
});

// Hide the modal when "Cancel" is clicked
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
});

// Fetch and populate Kraken's currency list
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

        // Extract unique base currencies and clean their names
        for (const pair in assetPairs) {
            const base = assetPairs[pair].base.replace(/^[XZ]/, ''); // Clean Kraken abbreviation
            const name = base; // Use base code as fallback
            currencies.set(base, name);
        }

        // Populate the dropdown
        currencySelect.innerHTML = ''; // Clear existing options
        Array.from(currencies.entries())
            .sort((a, b) => a[1].localeCompare(b[1])) // Sort by name
            .forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${name} (${code})`;
                currencySelect.appendChild(option);
            });
    } catch (error) {
        console.error("Failed to fetch Kraken currencies:", error);
    }
}

// Add a new cryptocurrency tab
addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;

    // Create a new tab
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currencyName;
    tabsContainer.appendChild(tab);

    // Hide the modal
    modal.classList.add('hidden');
});

// Initialize the app
fetchAndPopulateCurrencies();
