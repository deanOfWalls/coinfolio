// Select elements
const openModalButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');
const modal = document.getElementById('modal');

// Ensure modal is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    modal.classList.add('hidden'); // Hide modal by default
    console.log('Modal hidden on page load.');
});

// Open modal
openModalButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal
    console.log('Modal opened.');
});

// Close modal
closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
    console.log('Modal closed.');
});
