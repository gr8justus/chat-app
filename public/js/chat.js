'use strict';

const socket = io(),
    $form = document.querySelector('form'),
    $msgInput = document.querySelector('input'),
    $shareLocationBtn = document.querySelector('#shareLocation');

// listens for data from server
socket.on('message', message => console.log(message));

$form.addEventListener('submit', (e) => {
    // prevents page from reloading and loosing inputed data
    e.preventDefault();
    $form.setAttribute('disabled', 'disabled');
    
    let message = $msgInput.value;

    // sends data to server
    socket.emit('sendMessage', message, (error) => {
        $form.removeAttribute('disabled');
        $msgInput.value = null;
        $msgInput.focus();

        if (error)
            return console.log(error);
        
        console.log('Delivered!');
    });
});

$shareLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation)
        return alert('Your browser does not support location sharing!');
    
    $shareLocationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        socket.emit('sendLocation', {
            latitude,
            longitude
        }, () => {
            $shareLocationBtn.removeAttribute('disabled');
            console.log('Location shared')
        });
    });
});