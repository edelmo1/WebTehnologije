document.addEventListener('DOMContentLoaded', function () {
    fetch('../HTML/meni.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('meni').innerHTML = data;
        })
        .catch(error => console.error('Greška pri učitavanju menija:', error));
});



window.onload =function(){
    var username=document.getElementById("username")
    var password=document.getElementById("password")
    
    let dugme=document.getElementById("dugme")
    
    dugme.onclick = function(){
        
        PoziviAjax.postLogin(username.value,password.value,function(err,data){
            if(err != null){
                window.alert(err)
            }else{
                var message=JSON.parse(data)
                if(message.poruka=="Neuspješna prijava"){
                    var divElement=document.getElementById("areaBelow")
                    divElement.innerHTML="<h2>Neispravni podaci</h2>"
                }else{
                    window.location.href="http://localhost:3000/nekretnine.html"
                }
            }
        })
    }
}