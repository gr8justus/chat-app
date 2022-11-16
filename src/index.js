'use strict';

// Modules
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import Filter from 'bad-words';
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users.js';

// setup
const app = express(),
    server = http.createServer(app),
    io = new Server(server),
    port = process.env.PORT || 3000;

// express setup
app.use(express.static('public'));

const printToDoc = (username, arg) => {
    return {
        username,
        result: arg,
        time: new Date().getTime()
    }
}

// listens for data from all connected clients
io.on('connection', (socket) => {
    console.log('New webSocket connection');

    socket.on('join', ({ username, room }, cb) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error)
            return cb(error);

        socket.join(user.room);

        // sends data to a client
        socket.emit('message', printToDoc('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', printToDoc(`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        cb();
    });

    // listens for data from a client
    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter();

        if (filter.isProfane(message))
            return cb('Profane words are not allowed');

        const user = getUser(socket.id);        
        // sends data to all clients
        io.to(user.room).emit('message', printToDoc(user.username, message));
        cb(); // calls the acknowledgement function.
    });

    socket.on('sendLocation', (location, cb) => {
        const user = getUser(socket.id);
        const toPrint = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
        io.to(user.room).emit('link', printToDoc(user.username, toPrint));
        cb()
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', printToDoc(`${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));