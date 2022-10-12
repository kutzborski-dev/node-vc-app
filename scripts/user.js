function User(instance) {
    this.instance = instance;
    this.data = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : { uuid: uuid(), online: true };

    this.save = () => {
        localStorage.setItem('user', JSON.stringify(this.data));
    }
    
    //Only run if there is no user data cached yet
    if(!localStorage.getItem('user')) this.save();

    this.isLoggedIn = () => {
        return typeof this.data.username != typeof undefined;
    }

    this.login = (fields) => {
        if(!fields || this.isLoggedIn()) return;
        
        this.data = {...this.data, ...fields};

        this.save();
        this.instance.socket.emit('user-login', this.data.uuid, fields);
    }

    this.logout = () => {
        if(!this.isLoggedIn()) return;
        this.data = {};
        localStorage.removeItem('user');
        location.href = '/';
    }

    // Extend/inherit from RoomUser
    return new Proxy(Object.assign(new RoomUser, this), {
        get: function(target, prop){
            if(prop in target) return target[prop];
            if(prop in target.data) return target.data[prop];

            return undefined;
        }
    });
}