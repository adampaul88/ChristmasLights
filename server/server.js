/**
 * Created by adampaul on 11/24/16.
 */
var ClientIo = require('socket.io')();
var ControllerIo = require('socket.io')();


var controller = null;

ClientIo.on('connection', function(socket){
    console.log('Client Connected');

    socket.on('SetColor', function(color){
        sendColor(color);
    });
});

ControllerIo.on('connection', function(socket){

    console.log("Controller Connected  to Server. Controller ID = " + socket.ID);

    controller = socket;

    socket.on('disconnect', function(){
        controller = null;
        console.log("Controller Disconnected")
    });

    socket.on('SendColor', function(color){
        ClientIo.emit('CurrentColorClient', color);
    });

});

function sendColor(color){
    if(controller === null)
        return;

    controller.emit('SetColor', color);
}

function startSocketServer(){
    console.log("Starting Socket Servers. Client Port: 3000. Controller Port: 3001.");
    ControllerIo.listen(3001);
    ClientIo.listen(3000);
}



startSocketServer();



var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
port = process.argv[2] || 80;

http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname
        , filename = path.join(__dirname + "/../client", uri);

    fs.exists(filename, function(exists) {
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
