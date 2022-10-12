import { isUuid } from 'uuidv4';

export default class Rooms {
    rooms = new Map();

    has(roomID) {
        if(!isUuid(roomID)) return;

        return this.rooms.has(roomID);
    }

    get(key = null) {
        if(!key || !isUuid(key)) return this.rooms;
        
        return this.rooms.get(key);
    }

    set(room) {
        this.rooms.set(room.uuid, room);
        return true;
    }
}