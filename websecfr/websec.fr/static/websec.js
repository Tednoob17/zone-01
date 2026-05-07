"use strict";

window.onload=function() {
    // Change the <noscript> href for modals
    const links = document.getElementsByClassName('chall-url-with-js');
    [].forEach.call(links, function(link) { link.href = "#"; });
    try {
        document.getElementById("bonus").className += " collapse";
    } catch (_) {}

    // Detect Burp
    var _img = document.createElement('img');
    _img.onload = function(){document.getElementById('footer').insertAdjacentHTML('beforeend', ' - burp detected');};
    _img.src = 'http://burp/favicon.ico';
};

$('.modal').on('shown.bs.modal', function() { // autofocus for modals
  $(this).find('[autofocus]').focus();
});

