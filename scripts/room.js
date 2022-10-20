function Room(roomData, instance) {
    this.instance = instance;

    if(roomData) {
        this.data = typeof roomData == 'object' ? roomData : {id: roomData, users: []};
    } else {
        this.data = null;
    }

    this.hasUser = (userID = null) => {
        if(userID === null) userID = this.instance.user.uuid;
        return this.data.users.find(user => user.uuid === userID);
    }

    this.set = (key, value) => {
        if(!key) return;
        if(key && (typeof key != 'object' && !val)) return;
        if(key && (typeof key != 'object') && val) this.data[key] = value;
        if(key && (typeof key == 'object')) this.data = key;

        return true;
    }

    this.join = (user = null) => {
        user = user === null ? this.instance.user : user;

        var userExists = this.data.users.find(u => u.uuid === user.uuid);
        if(userExists) return;

        this.data.users.push(user);
        return true;
    }

    this.removeUser = (user) => {
        const userIndex = this.data.users.findIndex(u => u.uuid === user.uuid);
        if(userIndex < 0) return;
        const lastUser = this.data.users.length == 1;

        this.data.users.splice(userIndex, 1);

        this.instance.socket.emit('leave-room', user.uuid);

        if(lastUser) {
            //Remove room if user was the last one in the room
            this.instance.rooms = this.instance.rooms.filter(room => room.id !== this.id);
            this.data = null;
        }
        return true;
    }

    this.leave = () => {
        this.removeUser(this.instance.user);
        location.href = '/rooms';
    }

    this.create = (roomData) => {
        this.instance.socket.emit('create-room', roomData);
        this.instance.socket.on('room-created', data => {
            this.data = data;
            this.instance.rooms.push(this);
        });
    };

    return new Proxy(this, {
        get: function(target, prop){
            if(!target.data && ['hasUser', 'join', 'set', 'removeUser', 'leave'].includes(prop)) return undefined;
            if(prop in target) return target[prop];
            if(prop in target.data) return target.data[prop];
            return undefined;
        }
    });
}