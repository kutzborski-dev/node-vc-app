import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import Router from '../helpers/router.js';
import Users from './users.js';
import Rooms from './rooms.js';
import Room from './room.js';
import User from './user.js';
import * as path from 'path';

export default class App {
    static basePath = path.resolve('./');

    static init(port, cb = null) {
        this.users = new Users;
        this.rooms = new Rooms;
        
        this.router = new Router(express());
        this.router.setup();

        this.server = http.createServer(this.router.getInstance());
        this.ws = new IOServer(this.server);

        this.getRooms = (userID, socket) => {
            if(!App.users.has(userID)) return;

            let user = App.users.get(userID);

            var userRooms = user.rooms.filter(roomID => this.rooms.has(roomID));

            userRooms = userRooms.map(roomID => {
                var room = this.rooms.get(roomID);

                var roomData = {...room};
                roomData.user_count = roomData.users.size;
                roomData.user = room.users.get(userID) ?? null;

                delete roomData.users;

                return roomData;
            });

            socket.emit('receive-rooms', userRooms);
        }

        this.ws.on('connection', (socket) => {
            socket.on('user-login', (userID, userData) => {
                let user = App.users.get(userID) ?? new User(userID);

                if(!this.users.has(userID)) {
                    user.set(userData);
                    App.users.set(user);
                }

                this.getRooms(userID, socket);
            });

            socket.on('request-rooms', userID => this.getRooms(userID, socket));

            socket.on('update-user', userData => {
                let user = App.users.get(userData.uuid);

                if(!user) return;

                user.set(userData);
            });

            socket.on('joined-room', (roomID, userID, clientID) => {
                let room = App.rooms.get(roomID) ?? new Room(roomID);
                let user = App.users.get(userID);
                user.rooms.push(roomID);
                if(!user.online) user.online = true;
                const hasUser = room.hasUser(userID);
                App.users.set(user);

                if(!hasUser) room.addUser(user);

                App.rooms.set(room);

                socket.join(roomID);

                //socket.emit('receive-user', null, user);

                if(!hasUser) {
                    socket.to(roomID).emit('receive-user', clientID, user);
                } else {
                    socket.to(roomID).emit('update-user', user);
                }

                socket.on('disconnecting', reason => {
                    user.online = false;
                    App.users.set(user);

                    console.log('User has disconnected from the server', user);

                    socket.to(roomID).emit('update-user', user);
                });
            });
        });

        this.server.listen(port, cb);

        return this.ws;
    }
}