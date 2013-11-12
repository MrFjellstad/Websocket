var http = require('http');
var WSServer = require('websocket').server;
var url = require('url');
var clientHtml = require('fs').readFileSync('client.html');

var plainHttpServer = http.createServer(function(request,response) {
    response.writeHead(200, {'Content-type' : 'text/html'});
    response.end(clientHtml);
}).listen(8080);

var webSocketServer = new WSServer({httpServer: plainHttpServer});

var accept = ['localhost','127.0.0.1','kent.fronter.net'];

var count = 0;
var clients = {};

webSocketServer.on('request', function (request) {
    request.origin = request.origin || '*';
    if (accept.indexOf(url.parse(request.origin).hostname) === -1) {
        request.reject();
        console.log('disalowed ' + request.origin);
        return;
    }


    var websocket = request.accept(null, request.origin);

    console.log('Adding client ' + count);
    clients[count++] = websocket;


    websocket.on('message', function(msg) {
        var object = JSON.stringify({text:msg.utf8Data , done:false});

        console.log('Recieved "' + msg.utf8Data + '" from ' + request.origin);
        for(var i in clients) {
            clients[i].send(object);
            console.log('Sendt ' + msg.utf8Data + ' til ' + i);
        }
    });

    websocket.on('close', function(code, desc) {
        console.log('Disconnected: ' + code + ' - ' + desc)
    });

});
