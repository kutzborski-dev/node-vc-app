const loginForm = document.querySelector('#login-form');
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

chat.on('receive-users', users => {
    const roomUsers = document.querySelector("#room-users");

    if(roomUsers && users.length) {
        roomUsers.innerHTML = users.map(user => '<span class="user user--'+ (user.online ? 'online' : 'offline') +'">'+ user.username +'</span>').join(', ');
    }
});