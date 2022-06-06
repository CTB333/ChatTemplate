import io from 'socket.io-client';

const Socket = io.connect('http://localhost:3030');

export default Socket;
