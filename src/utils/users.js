'use strict';

const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate data
    if (!username || !room)
        return {
            error: 'Username and room required'
        }

    // check for an existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // validate username
    if (existingUser)
        return {
            error: 'Username has been taken!'
        }
    
    // save user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = id => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1)
        return users.splice(index, 1)[0];
}

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => users.filter(space => space.room === room);

export { addUser, removeUser, getUser, getUsersInRoom };