const newCoinButton = document.getElementById('new-coin-button'); // Add Cryptocurrency Button
const modal = document.getElementById('modal'); // Modal Container
const closeModalButton = document.getElementById('close-modal'); // Cancel Button
const addCoinButton = document.getElementById('add-coin'); // Add Cryptocurrency Modal Button
const currencySelect = document.getElementById('currency-select'); // Dropdown for Cryptocurrencies
const tabsContainer = document.getElementById('tabs'); // Tabs Container

// Global dashboard state
const dashboard = {
    totalCoins: 0,
    totalSpent: 0,
    totalFees: 0,
    profitLoss: 0,
};

// Fee Rates
const defaultFeeRate = 0.004; // 0.40% taker fee

// Fallback mapping for coin names
const fallbackCurrencyNames = {
    XDG: "Dogecoin",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    XRP: "Ripple",
    LTC: "Litecoin",
    // Add more fallback mappings as needed
};

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
            const name = fallbackCurrencyNames[base] || base; // Use fallback or default to abbreviation
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

// Modal control logic
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal
});

closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
});

addCoinButton.addEventListener('click', () => {
    const currency = currencySelect.value;
    const currencyName = currencySelect.options[currencySelect.selectedIndex].text;
    addNewTab(currency, currencyName);
    modal.classList.add('hidden'); // Hide modal after adding
});

// Add a new tab for a cryptocurrency
function addNewTab(currency, currencyName) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = currencyName;
    tabsContainer.appendChild(tab);

    // Create the portfolio section for this cryptocurrency
    const portfolioSection = createPortfolioSection(currency, currencyName);
    document.body.appendChild(portfolioSection);

    tab.addEventListener('click', () => {
        document.querySelectorAll('.portfolio-section').forEach((section) => {
            section.classList.add('hidden');
        });
        portfolioSection.classList.remove('hidden');
    });
}

// Initialize app
fetchAndPopulateCurrencies();
modal.classList.add('hidden'); // Ensure modal is hidden on load
