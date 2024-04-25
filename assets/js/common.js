fetch("/.netlify/functions/access").then((response) => {
    if(response.status == 429){
        document.body.innerHTML = `<h1>Too many requests</h1>`;

        return;
    }
});

(function() {
    
})();