function Chat(host = '/', port = 3001) {
    this.listeners = {};
    this.socket = io('/');
    this.user = new User(this);
    this.peer = new Peer(undefined, {
        host,
        port,
        metadata: {
            userID: this.user.uuid
        }
    });

    if(ROOM_ID) this.room = new Room(ROOM_ID, this);

    this.on = (key, cb = null) => {
        this.listeners[key] = cb;

        if(key == 'receive-users' && this.user.isLoggedIn()) {
            this.room.join();
            this.listeners['receive-users'](this.room.users);
        }
    }

    this.peer.on('open', (clientID) => {
        if(!this.room) return;
        
        this.socket.on('update-user', user => {
            let userIndex = this.room.users.findIndex(u => u.uuid === user.uuid);

            this.room.users[userIndex].set(user);

            //trigger listener if active
            if(this.listeners['receive-users'] && typeof this.listeners['receive-users'] == typeof Function) {
                this.listeners['receive-users'](this.room.users);
            }
        });
        
        if(this.room.id) {
            this.peer.on('connection', conn => {
                conn.on('open', () => {
                    conn.on('data', data => {
                        switch(data.type) {
                            case 'user':
                                if(!data.data || typeof data.data !== 'object') return;
                                if(!this.room.users.find(u => u.uuid === data.data.uuid)) {
                                    var roomUser = new RoomUser(data.data);
                                    this.room.join(roomUser);
                                }
            
                                //trigger listener if active
                                if(this.listeners['receive-users'] && typeof this.listeners['receive-users'] == typeof Function) {
                                    this.listeners['receive-users'](this.room.users);
                                }
                            break;
                        }
                    });
                });
            });
        
            this.socket.emit('joined-room', this.room.id, this.user.uuid, clientID);

            this.socket.on('update-user', user => {
                let userIndex = this.room.users.findIndex(u => u.uuid === user.uuid);

                this.room.users[userIndex].set(user);

                //trigger listener if active
                if(this.listeners['receive-users'] && typeof this.listeners['receive-users'] == typeof Function) {
                    this.listeners['receive-users'](this.room.users);
                }
            });
            
            this.socket.on('receive-user', (peerID, user) => {
                if(!peerID) {
                    var roomUser = this.user;
                } else {
                    var roomUser = new RoomUser;
                }

                roomUser.set(user);

                if(!this.room.users.find(u => u.uuid === user.uuid)) this.room.users.push(roomUser);
                if(peerID) {
                    var userConn = this.peer.connect(peerID);

                    userConn.on('open', () => {
                        userConn.send({
                            type: 'user',
                            data: roomUser.get()
                        });
                    });
                }

                //trigger listener if active
                if(this.listeners['receive-users'] && typeof this.listeners['receive-users'] == typeof Function) {
                    this.listeners['receive-users'](this.room.users);
                }
            });
        }
    });
}