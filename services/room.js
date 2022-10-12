import { uuid } from 'uuidv4';
import Users from './users.js';
import User from './user.js';

export default class Room {
    constructor(roomID) {
        this.uuid = roomID ?? uuid();
        this.users = new Users();
    }

    hasUser(userID) {
        return this.users.has(userID);
    }

    addUser(user) {
        if(!(user instanceof User) || this.hasUser(user.uuid)) return;

        this.users.set(user);
        return true;
    }
}