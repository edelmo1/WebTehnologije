const PoziviAjax = (() => {

    // fnCallback se u svim metodama poziva kada stigne
    // odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data,
    // error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška, poruka se prosljeđuje u error parametru
    // callback-a, a data je tada null

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }

    // vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        let ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    console.log('Uspješan zahtjev, status 200');
                    fnCallback(null, JSON.parse(ajax.responseText));
                } else if (ajax.status == 401) {
                    console.log('Neuspješan zahtjev, status 401');
                    fnCallback("error", null);
                } else {
                    console.log('Nepoznat status:', ajax.status);
                }
            }
        };

        ajax.open("GET", "http://localhost:3000/korisnik/", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send();
    }



    // ažurira podatke loginovanog korisnika
   function impl_putKorisnik(noviPodaci, fnCallback) {
    // Check if user is authenticated
    if (!req.session.username) {
        return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
    }

    const { ime, prezime, username, password } = noviPodaci;

    Korisnik.findOne({
        where: { username: req.session.username }
    })
    .then(async (user) => {
        if (!user) {
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        const updates = {};
        if (ime) updates.ime = ime;
        if (prezime) updates.prezime = prezime;
        if (username) updates.username = username;
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        return user.update(updates);
    })
    .then(() => {
        fnCallback(null, { poruka: 'Podaci su uspješno ažurirani' });
    })
    .catch((error) => {
        console.error('Error:', error);
        fnCallback({ status: 500, statusText: 'Internal Server Error' }, null);
    });
}



    // dodaje novi upit za trenutno loginovanog korisnika

    
    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        // Kreiraj novi XMLHttpRequest objekat
        let ajax = new XMLHttpRequest();
    
        // Definiši šta se dešava kada se promijeni stanje zahtjeva
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                console.log("Upit uspješno poslan");
                fnCallback(null, JSON.parse(ajax.responseText));
            } else if (ajax.readyState == 4) {
                // Došlo je do greške
                console.error("Greška pri slanju upita:", ajax.status, ajax.statusText);
                fnCallback({ status: ajax.status, statusText: ajax.statusText }, null);
            }
        };
    
        // Otvori POST zahtjev
        ajax.open("POST", "http://localhost:3000/upit", true);
        ajax.setRequestHeader("Content-Type", "application/json");
    
        // Kreiraj JSON objekat za slanje
        const requestData = {
            nekretnina_id: nekretnina_id,
            tekst: tekst_upita
        };

        console.log("REQUEST: ", requestData);
        // Pošalji zahtjev sa podacima
        ajax.send(JSON.stringify(requestData));
    }

    function impl_getNekretnine(fnCallback) {
        // Koristimo AJAX poziv da bismo dohvatili podatke s servera
        ajaxRequest('GET', '/nekretnine', null, (error, data) => {
            // Ako se dogodi greška pri dohvaćanju podataka, proslijedi grešku kroz callback
            if (error) {
                fnCallback(error, null);
            } else {
                // Ako su podaci uspješno dohvaćeni, parsiraj JSON i proslijedi ih kroz callback
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    // Ako se dogodi greška pri parsiranju JSON-a, proslijedi grešku kroz callback
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/login", true)
        ajax.setRequestHeader("Content-Type", "application/json")
        var objekat = {
            "username": username,
            "password": password
        }
        forSend = JSON.stringify(objekat)
        ajax.send(forSend)
    }

    function impl_postLogout(fnCallback) {
        let ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                console.log("Odjava je uspješna");
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                console.log("Odjava je neuspješna");

                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/logout", true)
        ajax.send()
    }
















    



    //Zadatak 2

    
        // metoda za dobijanje 5 najnovijih nekretnina na osnovu lokacije
        function impl_getTop5Nekretnina(lokacija, fnCallback) {
            ajaxRequest('GET', `/nekretnine/top5?lokacija=${lokacija}`, null, (error, data) => {
console.log("D: ",data);
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const nekretnine = JSON.parse(data);
                        fnCallback(null, nekretnine);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
    
        // metoda za dobijanje upita korisnika
        function impl_getMojiUpiti(fnCallback) {
            ajaxRequest('GET', '/upiti/moji', null, (error, data) => {
                if (error) {
                    console.log("greska1");
                    fnCallback(error, null);
                } else {
                    try {
                        const upiti = JSON.parse(data);
                        fnCallback(null, upiti);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
    
        // metoda za dobijanje detalja nekretnine
        function impl_getNekretnina(nekretnina_id, fnCallback) {
            ajaxRequest('GET', `/nekretnina/${nekretnina_id}`, null, (error, data) => {
                console.log('Odgovor servera:', data);
                if (error) {
                    console.log("Prvi error");
                    fnCallback(error, null);
                } else {
                    try {
                        const nekretnina = JSON.parse(data);
                        fnCallback(null, nekretnina);
                    } catch (parseError) {

                        fnCallback(parseError, null);
                    }
                }
            });
        }
    
        // metoda za dobijanje sljedece grupe upita za nekretninu

        function impl_getNextUpiti(nekretnina_id, page, fnCallback) {
            const url = `/next/upiti/nekretnina${encodeURIComponent(nekretnina_id)}?page=${encodeURIComponent(page)}`;
            ajaxRequest('GET', url, null, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const nextUpiti = JSON.parse(data);
                        fnCallback(null, nextUpiti);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
     
    










        //SPIRALA 4








        function impl_getNekretninaInteresovanja(nekretninaId,fnCallback) {
        
            ajaxRequest('GET', `/nekretnina/${encodeURIComponent(nekretninaId)}/interesovanja`, null, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const interesovanja = JSON.parse(data);
                        fnCallback(null, interesovanja);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
        
        function impl_postPonuda(nekretninaId, tekst, ponudaCijene,datumPotvrde,idVezanePonude,odbijenaPonuda, fnCallback) {
            const ponudaData = {
                tekst,
                ponudaCijene,
                datumPonude: datumPotvrde,
                idVezanePonude,
                odbijenaPonuda
            };
            ajaxRequest('POST', `/nekretnina/${encodeURIComponent(nekretninaId)}/ponuda`, ponudaData, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const novaPonuda = JSON.parse(data);
                        fnCallback(null, novaPonuda);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
        
        function impl_postZahtjev(nekretninaId, zahtjevData, fnCallback) {
            ajaxRequest('POST', `/nekretnina/${encodeURIComponent(nekretninaId)}/zahtjev`, zahtjevData, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const zahtjev = JSON.parse(data);
                        fnCallback(null, zahtjev);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
        
        function impl_putZahtjev(nekretninaId, zahtjevId, updateData, fnCallback) {
            ajaxRequest('PUT', `/nekretnina/${encodeURIComponent(nekretninaId)}/zahtjev/${encodeURIComponent(zahtjevId)}`, updateData, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const updatedZahtjev = JSON.parse(data);
                        fnCallback(null, updatedZahtjev);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }




        return {
            postLogin: impl_postLogin,
            postLogout: impl_postLogout,
            getKorisnik: impl_getKorisnik,
            putKorisnik: impl_putKorisnik,
            postUpit: impl_postUpit,
            getNekretnine: impl_getNekretnine,
            getTop5Nekretnina: impl_getTop5Nekretnina,
            getMojiUpiti: impl_getMojiUpiti,
            getNekretnina: impl_getNekretnina,
            getNextUpiti: impl_getNextUpiti,
            getNekretninaInteresovanja: impl_getNekretninaInteresovanja,
            postPonuda: impl_postPonuda,
            postZahtjev: impl_postZahtjev,
            putZahtjev: impl_putZahtjev
        };

})();