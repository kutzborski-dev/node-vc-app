const loginForm = document.querySelector('#login-form');
const createRoomBtn = document.querySelector('#create-room');
const chat = new Chat;
const urlPath = window.location.pathname;

if(window.location.pathname.includes('login')) {
    if(chat.user.isLoggedIn()) location.href = '/rooms';

    const userInput = document.querySelector('#login-username');

    loginForm.onsubmit = () => {
        chat.user.login({
            username: userInput.value
        });
    }
}

if(!urlPath.match(/\/|home|login/) && !chat.user.isLoggedIn()) location.href = '/login';

if(createRoomBtn) {
    createRoomBtn.onclick = function() {
        location.href = '/room/'+ uuid();
    }
}

chat.on('receive-users', users => {
    const roomUsers = document.querySelector("#room-users");

    if(roomUsers && users.length) {
        roomUsers.innerHTML = users.map(user => `<span class="user user--${(user.online ? 'online' : 'offline')}">${user.username}</span>`).join(', ');
    }
});

chat.on('receive-rooms', rooms => {
    const roomsContainer = document.querySelector('#rooms');
    console.log('rooms', rooms);

    if(!rooms.length) {
        roomsContainer.innerHTML = `<h3>You haven't joined any rooms yet. Either <a href="/room/${uuid()}">Create your own</a> or join another room via an invitation.</h3>`;
        return;
    }

    rooms.forEach(room => {
        var cardHtml = ROOM_CARD_HTML;
        var matches = cardHtml.match(/\{(.*?)}/g);

        matches.forEach(match => {
            var prop = match.replace(/\{|\}/g, '');
            var roomVar = room;

            if(prop.includes('.')) {
                var props = prop.split('.');

                props.forEach(prop => {
                    roomVar = roomVar[prop];
                });
            } else {
                roomVar = roomVar[prop];
            }

            roomVar = roomVar || '';

            cardHtml = cardHtml.replace(match, roomVar);
        });

        roomsContainer.innerHTML += cardHtml;
    });
});