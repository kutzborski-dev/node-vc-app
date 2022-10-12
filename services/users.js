import { isUuid } from 'uuidv4';

export default class Users {
    users = new Map();

    has(clientID) {
        if(!isUuid(clientID)) return;

        return this.users.has(clientID);
    }

    get(key = null) {
        if(!key || !isUuid(key)) return this.users;
        
        return this.users.get(key);
    }

    set(user) {
        this.users.set(user.uuid, user);
        return true;
    }
}