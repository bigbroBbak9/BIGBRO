'use strict';

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 32319;


server.on('listening', function () {
    console.log('ok, server is running');
});
server.listen(port, function () {
    console.log('listening on ' + port);
});
process.on('uncaughtException', function (err) {
    console.log(err, err.stack);
});
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


global.users = {};
global.mutes = {};
global.histories = {};

app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/admin.html');
});

io.on('connection', (socket) => {
    console.log('connected', socket.id);
    //Operating Information
    socket.on('req_state', function (admin) {
        socket.emit('res_state', {
            'people': Object.keys(global.users).length,
            'mutes': mutes,
            'rooms': io.sockets.adapter.rooms,
        });
    });


    //Join the Channel
    socket.on('join', function (user) {
        //Preventing Multiple Logging in
        for (const key in users) {
            if (users[key].id == user.id) {
                socket.emit('req_all_client_quit', "다른 클라이언트에서 접속중입니다.");
                return;
            }
        }

        if (socket.user) socket.leave(socket.user.ch);
        socket.user = user;
        global.users[socket.id] = user;

        //Channeling
        // var num = 0;
        // while (io.sockets.adapter.rooms[user.ch + num] &&
        //     io.sockets.adapter.rooms[user.ch + num].length > 100) {
        //     num++;
        // }
        // socket.user.ch = channel_final;
        // console.log('joined', user.id, "at", socket.user.ch);
        //One Channel
        var channel_final = user.ch;
        socket.user.ch = channel_final;

        //Response.
        socket.join(channel_final);
        // var a = {
        //     'channel': channel_final,
        //     'history': global.histories[channel_final],
        // }
        // console.log('a', a);
        // socket.emit('res_join', a);
        socket.emit('res_join', {
            'channel': channel_final,
            'history': global.histories[channel_final],
        });
    });


    //채팅.
    socket.on('req_message', function (msg, channelFromAdmin) {
        if (socket.user == undefined) {
            console.log('undefined', ch);
            return;
        }
        if (global.mutes.hasOwnProperty(msg.name)) {
            console.log('black', msg.name);
            return;
        }
        console.log('req_msg', socket.user, msg);
        var ch = channelFromAdmin || socket.user.ch;

        //Emit to Client
        io.sockets.in(ch).emit('res_message', msg);

        //운영툴이 받음.
        //data.channel 필요.
        // data.channel = ch;
        io.sockets.in('admin_0').emit('res_message_all', msg);

        //지난 대화 저장.
        if (!global.histories[ch]) global.histories[ch] = [];
        global.histories[ch].push(msg);
        if (global.histories[ch].length > 10)
            global.histories[ch].splice(0, 1);
    });

    //채팅금지.
    socket.on('req_chatting_mute', function (data) {
        console.log('mute', data);

        if (data.time == false) data.time = 6;
        var duration = data.time * 3600000;
        //메모리.
        if (global.mutes.hasOwnProperty(data.name)) global.mutes[data.id] += duration;
        else global.mutes[data.name] = Date.now() + duration;
    });
    //채팅금지 복권.
    socket.on('req_chatting_reinstated', function (data) {
        if (global.mutes.hasOwnProperty(data.name)) {
            delete global.mutes[data.name];
        }
    });


    //채팅.
    socket.on('req_system_message', function (msg, channelFromAdmin) {
        if (socket.user == undefined) {
            console.log('undefined', ch);
            return;
        }
        //if (global.mutes.hasOwnProperty(msg.name)) {
        //    console.log('black', msg.name);
        //    return;
        //}
        console.log('req_system_msg', socket.user, msg);
        var ch = channelFromAdmin || socket.user.ch;

        //Emit to Client
        io.sockets.in(ch).emit('req_system_message', msg);

        ////운영툴이 받음.
        ////data.channel 필요.
        //// data.channel = ch;
        //io.sockets.in('admin_0').emit('res_message_all', msg);

        ////지난 대화 저장.
        //if (!global.histories[ch]) global.histories[ch] = [];
        //global.histories[ch].push(msg);
        //if (global.histories[ch].length > 10)
        //    global.histories[ch].splice(0, 1);
    });



    //시스템 메세지.
    socket.on('system message', function (msg) {
        io.emit('system message', msg);
    });


    //Disconnect
    socket.on('disconnect', () => {
        console.log(socket.id, 'disconnected');
        if (global.users[socket.id]) delete global.users[socket.id];
    });
});

function Save(name) {

}
function Load() {

}