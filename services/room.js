import { uuid } from 'uuidv4';
import Users from './users.js';
import User from './user.js';

export default class Room {
    constructor(roomID) {
        this.uuid = roomID ?? uuid();
        this.users = new Users();
        this.created_date = new Date().format('Y-m-d');
    }

    hasUser(userID) {
        return this.users.has(userID);
    }

    addUser(user) {
        if(!(user instanceof User) || this.hasUser(user.uuid)) return;

        user.role = this.users.size > 0 ? 'user' : 'owner';
        user.join_date = new Date().format('Y-m-d');

        this.users.set(user);
        return true;
    }
}