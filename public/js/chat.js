'use strict';

const socket = io();

// listens for data from server
socket.on('message', message => console.log(message));

document.querySelector('form').addEventListener('submit', (e) => {
    // prevents page from reloading and loosing inputed data
    e.preventDefault();
    
    let message = e.target.elements.chat.value;

    // sends data to server
    socket.emit('sendMessage', message, (cb) => console.log(cb)); // third argumnet is for acknowledgement.
    message = null;
});

document.querySelector('#shareLocation').addEventListener('click', () => {
    if (!navigator.geolocation)
        return alert('Your browser does not support location sharing!');
        
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        socket.emit('sendLocation', {
            latitude,
            longitude
        });
    });
});