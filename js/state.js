export const portfolios = new Map();
export let activeCurrency = null;

export const fallbackCurrencyNames = {
    DOGE: "Dogecoin",
    BTC: "Bitcoin",
    ETH: "Ethereum",
};

export function setActiveCurrency(currency) {
    activeCurrency = currency;
}
