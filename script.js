// Select elements
const newCoinButton = document.getElementById('new-coin-button'); // Add Transaction Button
const modal = document.getElementById('modal'); // Modal Container
const closeModalButton = document.getElementById('close-modal'); // Cancel Button
const addCoinButton = document.getElementById('add-coin'); // Add Cryptocurrency Button in Modal

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    modal.classList.add('hidden'); // Add 'hidden' class to hide modal
});

// Show modal when "Add Transaction" button is clicked
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Remove 'hidden' class to show modal
});

// Hide modal when "Cancel" button is clicked
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Add 'hidden' class to hide modal
});

// Handle "Add" button in modal
addCoinButton.addEventListener('click', () => {
    const currency = document.getElementById('currency-select').value;
    console.log(`Added ${currency}`); // Example action: Log selected currency
    modal.classList.add('hidden'); // Hide modal after adding currency
});
