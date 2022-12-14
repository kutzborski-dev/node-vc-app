function Chat(host = '/', port = 3001) {
    this.listeners = {};
    this.socket = io('/');
    this.user = new User(this);
    this.rooms = localStorage.getItem('rooms') ? JSON.parse(localStorage.getItem('rooms')) : [];
    //Current room
    this.room = new Room((localStorage.getItem('room') ? JSON.parse(localStorage.getItem('room')) : null), this);
    this.peer = new Peer(undefined, {
        host,
        port,
        metadata: {
            userID: this.user.uuid
        }
    });

    if(this.user.isLoggedIn()) this.socket.emit('user-login', this.user.uuid, this.user.data);

    this.on = (key, cb = null) => {
        this.listeners[key] = cb;

        if(this.user.isLoggedIn()) {
            switch(key) {
                case 'receiver-users':
                    if(!this.room) return;
                    this.room.join();
                    this.listeners['receive-users'](this.room.users);
                break;
            }
        }
    }

    this.socket.on('receive-rooms', rooms => {
        this.rooms = rooms;

        //trigger listener if active
        if(this.listeners['receive-rooms'] && typeof this.listeners['receive-rooms'] == typeof Function) {
            this.listeners['receive-rooms'](this.rooms);
        }
    });

    this.peer.on('open', (clientID) => {
        if(!this.user.isLoggedIn()) return;

        this.socket.on('update-user', user => {
            let userIndex = this.room.users.findIndex(u => u.uuid === user.uuid);

            this.room.users[userIndex].set(user);

            //trigger listener if active
            if(this.listeners['receive-users'] && typeof this.listeners['receive-users'] == typeof Function) {
                this.listeners['receive-users'](this.room.users);
            }
        });

        if(!window.location.pathname.includes('/room/create') && window.location.pathname.includes('/room/')) {
            //User trying to join a room
            //Get room ID from URL
            var roomID = window.location.pathname;
            roomID = roomID.replace('/room/', '');
            
            this.socket.emit('join-room', roomID, this.user.uuid, clientID);
        }
        
        //if(this.room && this.room.uuid) {
            this.peer.on('connection', conn => {
                if(!this.room.uuid) return;
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
        
            console.log('this.room', this.room);
            if(window.location.pathname.includes('/room/') && !window.location.pathname.includes('/room/create') && this.room.uuid) this.socket.emit('join-room', this.room.uuid, this.user.uuid, clientID);

            this.socket.on('update-user', user => {
                let userIndex = this.room.users.findIndex(u => u.uuid === user.uuid);

                this.room.users[userIndex].set(user);

                //trigger listener if active
                if(this.listeners['receive-users'] && typeof this.listeners['receive-users'] == typeof Function) {
                    this.listeners['receive-users'](this.room.users);
                }
            });

            this.socket.on('joined-room', (roomData) => {
                console.log('roomData', roomData);
                this.room.set(roomData);

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

                console.log('roomUser', roomUser);

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
        //}
    });
}