document.addEventListener('DOMContentLoaded', function () {
    fetch('../HTML/meni.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('meni').innerHTML = data;
        })
        .catch(error => console.error('Greška pri učitavanju menija:', error));
});



document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upitiContainer');

    PoziviAjax.getMojiUpiti((error, data) => {
        if (error) {
            upitiContainer.innerHTML = `<p class="error">Greška pri dohvaćanju upita: ${error.statusText}</p>`;
            return;
        }

        if (data.length === 0) {
            upitiContainer.innerHTML = `<p class="info">Trenutno nemate upita.</p>`;
            return;
        }

        data.forEach(upit => {
            const upitElement = document.createElement('div');
            upitElement.className = 'upit';
            upitElement.innerHTML = `
                <p><strong>ID Nekretnine:</strong> ${upit.id_nekretnine}</p>
                <p><strong>Tekst upita:</strong> ${upit.tekst}</p>
            `;
            upitiContainer.appendChild(upitElement);
        });
    });
});