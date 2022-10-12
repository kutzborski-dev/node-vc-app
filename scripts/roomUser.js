function RoomUser(userData) {
    this.data = userData ?? {};
    
    this.get = (key = null) => {
        if(key == null) return this.data;
        if(this.data[key]) return this.data[key];
        return null;
    }

    this.set = (key, value) => {
        if(!key) return;
        if(key && (typeof key != 'object' && !value)) return;
        
        if(key && value) this.data[key] = value;
        if(typeof key == 'object') this.data = {...this.data, ...key};

        return true;
    }

    return new Proxy(this, {
        get: function(target, prop){
            if(prop in target) return target[prop];
            if(prop in target.data) return target.data[prop];
            return undefined;
        }
    });
}