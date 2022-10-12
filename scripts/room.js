function Room(roomData, instance) {
    this.instance = instance;
    this.data = typeof roomData == 'object' ? roomData : {id: roomData, users: []};

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

        this.data.users.splice(userIndex, 1);
        return true;
    }

    this.leave = () => {
        this.removeUser(this.instance.user);
        location.href = '/rooms';
    }

    return new Proxy(this, {
        get: function(target, prop){
            if(prop in target) return target[prop];
            if(prop in target.data) return target.data[prop];
            return undefined;
        }
    });
}