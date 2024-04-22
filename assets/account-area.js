window.addEventListener('DOMContentLoaded',function () {

    const deleteAddressForm = document.querySelectorAll('[data-delete-address]');

    Array.from(deleteAddressForm).forEach((form) => {
        
        form.querySelector('button').addEventListener('click', (e) => {
            var confirmMsg = form.dataset.deleteAddress
            e.preventDefault();
            if (confirm(confirmMsg)) {
                form.submit();
            }
        });
    });
});