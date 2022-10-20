import { uuid } from 'uuidv4';
import Users from './users.js';
import User from './user.js';

export default class Room {
    constructor(roomData) {
        if(typeof roomData !== 'object') {
            this.uuid = roomData ?? uuid();
        } else {
            if(!roomData.uuid) this.uuid = uuid();

            this.set(roomData);
        }

        this.users = new Users();
        this.created_date = new Date().format('Y-m-d');
    }

    set(key = null, val = null) {
        if(!key) return;
        if(typeof key !== 'object' && val === null) return;

        if(typeof key === 'object') {
            const roomData = key;

            Object.keys(roomData).forEach(k => {
                if(typeof this[k] === typeof Function) return;
                this[k] = roomData[k];
            });

            return true;
        }

        this[key] = val;
        return true;
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