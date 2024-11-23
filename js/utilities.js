import { currencySelect } from "./domElements.js";

export async function populateCurrencyDropdown() {
    try {
        const currencies = [
            { symbol: "BTC", name: "Bitcoin" },
            { symbol: "ETH", name: "Ethereum" },
            { symbol: "DOGE", name: "Dogecoin" },
        ];

        currencySelect.innerHTML = ""; // Clear existing options
        currencies.forEach((currency) => {
            const option = document.createElement("option");
            option.value = currency.symbol;
            option.textContent = `${currency.name} (${currency.symbol})`;
            currencySelect.appendChild(option);
        });

        console.log("Currency dropdown populated successfully.");
    } catch (error) {
        console.error("Failed to populate currency dropdown:", error);
    }
}
