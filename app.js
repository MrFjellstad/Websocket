var http = require('http'),
    WSServer = require('websocket').server,
    url = require('url'),


    plainHttpServer = http.createServer(function(request,response) {
        response.writeHead(200, {'Content-type' : 'text/html'});
        response.end(clientHtml);
    }).listen(8080),

    webSocketServer = new WSServer({httpServer: plainHttpServer}),
    accept = ['localhost','127.0.0.1','kent.fronter.net'],
    count = 0,
    clients = {};

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
        var object,
            recievedObject = JSON.parse(msg.utf8Data);

        object = JSON.stringify({
            text: recievedObject.message ,
            done: false,
            token: recievedObject.token
        });

        console.log('Recieved "' + recievedObject.message + '" from ' + request.origin);
        for(var i in clients) {
            if (clients[i] !== websocket) {
                clients[i].send(object);
            }
            console.log('Sendt ' + recievedObject.message + ' til ' + i);
        }
    });

    websocket.on('close', function(code, desc) {
        console.log('Disconnected: ' + code + ' - ' + desc)
    });

});
