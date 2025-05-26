document.addEventListener('DOMContentLoaded', function () {
    fetch('../HTML/meni.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('meni').innerHTML = data;
        })
        .catch(error => console.error('Greška pri učitavanju menija:', error));
});