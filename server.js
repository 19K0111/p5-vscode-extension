// server2.js: expressモジュールを使用
// 静的ファイルを利用できる

var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http, { maxHttpBufferSize: 1e12 /* 1TB */ });

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

http.listen(3000, function () {
    // console.log('listening on *:3000');
});

// var http = require('http'),
//     socketIO = require('socket.io'),
//     fs = require('fs'),
//     // express = require('express'),
//     server,
//     io;


// var path = require('path');
// var mime = {
//     ".html": "text/html",
//     ".css": "text/css"
//     // 読み取りたいMIMEタイプはここに追記
// };

var frameCount = 0;
let save_frame_flag = true;
let environment = {};
let frames = [];

// server = new http.createServer(function (req, res) {

//     if (req.url == '/') {
//         filePath = '/index.html';
//     } else {
//         filePath = req.url;
//     }
//     var fullPath = __dirname + filePath;

//     res.writeHead(200, { "Content-Type": mime[path.extname(fullPath)] || "text/plain" });
//     fs.readFile(fullPath, function (err, data) {
//         if (err) {
//             // エラー時の応答
//         } else {
//             res.end(data, 'UTF-8');
//         }
//     });
// }).listen(3000);

// io = socketIO(server, { maxHttpBufferSize: 1e12 /* 1TB */ });
console.log('Server is running at http://localhost:3000/');
// クライアントが接続してきたときの処理
io.on('connection', function (socket) {
    console.log(`connected: ${socket.id}`);
    socket.emit('greeting-from-server', {
        greeting: 'Hello Client'
    });
    socket.on('greeting-from-client', function (message) {
        console.log(message);
    });
    socket.on('saveFrameCount', function (cnt) {
        frameCount = cnt;
        console.log(`saved: ${frameCount}`);
    });
    socket.on('saveEnvironment', function (env) {
        environment = env;
        environment.stop_flag = false;
        console.log(`saved environment: ${environment}`);
    });
    socket.on('saveFrame', function (img) {
        frames = img;
        console.log(`saved frames: ${frames.length > 0 ? "(Base64 string)" : ""}`);
    });
    socket.on('saveFlag', function (flag) {
        save_frame_flag = flag;
        console.log(`save flag: ${save_frame_flag}`);
    });
    setTimeout(() => {
        console.log(`${new Date()}`);
        socket.emit("sendEnvironment", environment);
        console.log(`sent environment: ${environment}`);
        socket.emit("sendFrameCount", frameCount);
        console.log(`sent: ${frameCount}`);
        socket.emit("sendFrame", frames);
        console.log(`sent Base64 frames: ${frames.length > 0 ? "(Base64 string)" : ""}`);
        socket.emit("sendFlag", save_frame_flag);
        console.log(`sent save flag: ${save_frame_flag}\n`);
    }, 500);
});

io.on('disconnect', function (socket) {
    console.log(`disconnected: ${socket.id}`);
});
