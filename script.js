// Select elements
const newCoinButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');
const modal = document.getElementById('modal');

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    modal.classList.add('hidden'); // Add hidden class
    console.log('Modal hidden on page load. Class list:', modal.classList);
});

// Show modal
newCoinButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Remove hidden class
    console.log('Modal shown. Class list:', modal.classList);
});

// Hide modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Add hidden class
    console.log('Modal hidden. Class list:', modal.classList);
});
