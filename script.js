// Select elements
const newCoinButton = document.getElementById('new-coin-button'); // Button to show modal
const modal = document.getElementById('modal'); // Modal container
const closeModalButton = document.getElementById('close-modal'); // Button to close modal
const addCoinButton = document.getElementById('add-coin'); // Button to add cryptocurrency

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, hiding modal...');
    modal.classList.add('hidden'); // Add the "hidden" class to hide the modal
    console.log('Modal hidden by default.');
});

// Show modal when "Add Transaction" button is clicked
newCoinButton.addEventListener('click', () => {
    console.log('Add Transaction button clicked, showing modal...');
    modal.classList.remove('hidden'); // Remove the "hidden" class to show the modal
    console.log('Modal is now visible.');
});

// Hide modal when "Cancel" button is clicked
closeModalButton.addEventListener('click', () => {
    console.log('Cancel button clicked, hiding modal...');
    modal.classList.add('hidden'); // Add the "hidden" class to hide the modal
    console.log('Modal is now hidden.');
});

// Add cryptocurrency when "Add" button in modal is clicked
addCoinButton.addEventListener('click', () => {
    const currency = document.getElementById('currency-select').value;
    console.log(`Added ${currency} to portfolio.`);
    modal.classList.add('hidden'); // Hide the modal after adding
    console.log('Modal is now hidden after adding cryptocurrency.');
});
