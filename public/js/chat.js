'use strict';

const socket = io(),
    $form = document.querySelector('form'),
    $msgInput = document.querySelector('input'),
    $shareLocationBtn = document.querySelector('#shareLocation'),
    $renderTemplate = document.querySelector('#render-template'),
    $template = document.querySelector('#template').innerHTML,
    $locateMe = document.querySelector('#locate-me').innerHTML,
    $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});

// scrolls down the document as content fills the viewport
const autoScroll = () => {
    // select latest message
    const $newMsg = $renderTemplate.lastElementChild;

    // Height of the latest message
    const extraLen = parseInt(getComputedStyle($newMsg).marginBottom),
        newMsgHeight = $newMsg.offsetHeight + extraLen;

    // Visible height
    const visibleHeight = $renderTemplate.offsetHeight;

    // Messages container height
    const containerHeight = $renderTemplate.scrollHeight;

    //  Calculates how far I have scrolled
    const scrollOffset = $renderTemplate.scrollTop + visibleHeight;

    if (containerHeight - newMsgHeight <= scrollOffset) {
        $renderTemplate.scrollTop = $renderTemplate.scrollHeight;
    }
}

// listens for data from server
socket.on('message', ({ username, result, time }) => {
    // procedure for rendering output on the dom
    const html = Mustache.render($template, {
        username,
        message: result,
        createdAt: moment(time).format('H:mm')
    });
    $renderTemplate.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('link', ({ username, result, time }) => {
    const html = Mustache.render($locateMe, {
        username,
        location: result,
        createdAt: moment(time).format('H:mm')
    });
    $renderTemplate.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    });
    document.querySelector('.sidebar').innerHTML= html;
});

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

socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});