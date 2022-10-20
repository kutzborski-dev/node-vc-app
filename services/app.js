import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import Router from '../helpers/router.js';
import Users from './users.js';
import Rooms from './rooms.js';
import Room from './room.js';
import User from './user.js';
import * as path from 'path';
import NodeCache from 'node-cache';
import { uuid } from 'uuidv4';

export default class App {
    static basePath = path.resolve('./');

    static init(port, cb = null) {
        this.users = new Users;
        this.rooms = new Rooms;
        this.cache = new NodeCache();
        
        this.router = new Router(express());
        this.router.setup();

        this.server = http.createServer(this.router.getInstance());
        this.ws = new IOServer(this.server);

        this.getRooms = (userID, socket) => {
            if(!App.users.has(userID)) return;

            let user = App.users.get(userID);

            var userRooms = user.rooms.filter(roomID => App.rooms.has(roomID));

            userRooms = userRooms.map(roomID => {
                var room = App.rooms.get(roomID);

                var roomData = {...room};
                roomData.user_count = roomData.users.size;
                roomData.user = {...room.users.get(userID)} ?? null;

                delete roomData.user.rooms;
                delete roomData.user.online;
                delete roomData.user.uuid;
                
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

            socket.on('create-room', (roomData) => {
                roomData.uuid = uuid();
                let room = new Room(roomData);
                
                App.rooms.set(room);

                roomData = {...room};
                
                delete roomData.users;

                socket.emit('room-created', roomData);
            });

            socket.on('joined-room', (roomID, userID, clientID) => {
                console.log('roomID', roomID);
                let room = App.rooms.get(roomID);
                if(!room) return;
                
                let user = App.users.get(userID);
                const hasUser = room.hasUser(userID);
                if(!user.online) user.online = true;

                if(!hasUser) {
                    user.rooms.push(roomID);
                    room.addUser(user);
                }

                App.users.set(user);
                App.rooms.set(room);

                App.cache.set('rooms', App.rooms.get());
                console.log('App.cache.get("rooms")', App.cache.get('rooms'));

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