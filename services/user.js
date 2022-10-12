import { uuid } from 'uuidv4';

export default class User {
    constructor(userID) {
        this.uuid = userID ?? uuid();
    }

    set(key = null, val = null) {
        if(!key) return;
        if(typeof key !== 'object' && val === null) return;

        if(typeof key === 'object') {
            const userData = key;
            userData.online = true;

            Object.keys(userData).forEach(k => {
                if(typeof this[k] === typeof Function) return;
                this[k] = userData[k];
            });

            return true;
        }

        this[key] = val;
        return true;
    }
}