'use strict';

// Modules
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import Filter from 'bad-words';

// setup
const app = express(),
    server = http.createServer(app),
    io = new Server(server),
    port = process.env.PORT || 3000;

// express setup
app.use(express.static('public'));

// listens for data from all connected clients
io.on('connection', (socket) => {
    console.log('New webSocket connection');

    // sends data to a client
    socket.emit('message', 'Welcome!');
    socket.broadcast.emit('message', 'A new user has joined!');

    // listens for data from a client
    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter();

        if (filter.isProfane(message))
            return cb('Profane words are not allowed');

        // sends data to all clients
        io.emit('message', message);
        cb(); // calls the acknowledgement function.
    });

    socket.on('sendLocation', (location, cb) => {
        io.emit('message', `https://google.com/maps?q=${location.latitude},${location.longitude}`);
        cb()
    });

    socket.on('disconnect', () => io.emit('message', 'A user has left!'));
});

server.listen(port, () => console.log(`Server is running on port ${port}`));