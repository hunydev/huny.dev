fetch("/.netlify/functions/access").then((response) => {
    if(response.status == 429){
        document.body.innerHTML = `<h1>Too many requests</h1>`;

        return;
    }
});

(function() {
    
})();

$(document).ready(function(){
    $(".ui.modal.credits").modal('attach events', 'a.item.credits');
});