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
    $(".ui.modal.terms_and_conditions").modal('attach events', 'a.item.terms_and_conditions');
    $(".ui.modal.privacy_policy").modal('attach events', 'a.item.privacy_policy');
});