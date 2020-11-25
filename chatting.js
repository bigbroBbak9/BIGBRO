// Socket.io 서버 생성
// var Server = require('socket.io')
// var io = new Server(httpServer);

//축약버젼:
// var io = require('socket.io')(server)

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(3000, () => {
    // 서버 연결 성공
    console.log('listening on *:3000');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

io.on('connection', (socket) =>
{
    socket.on('chat message', (msg) =>
    {
        io.emit('chat message', msg);
    });
});