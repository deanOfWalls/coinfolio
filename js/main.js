import { openModal, closeModal, showBuyFields, showSellFields } from "./modalHandlers.js";
import { populateCurrencyDropdown } from "./utilities.js";
import { openModalButton, closeModalButton } from "./domElements.js";

console.log("Initializing app...");

// Populate currency dropdown
populateCurrencyDropdown()
    .then(() => {
        console.log("Currency dropdown populated successfully.");
    })
    .catch((err) => {
        console.error("Error populating currency dropdown:", err);
    });

// Set up event listeners for modal open/close
openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);

// Set up radio buttons for switching between Buy/Sell layouts
document.querySelectorAll('input[name="transaction-type"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
        if (event.target.value === "buy") {
            showBuyFields();
        } else if (event.target.value === "sell") {
            showSellFields();
        }
    });
});

console.log("App initialized successfully.");
