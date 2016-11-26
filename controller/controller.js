
var ServerSocket = require('socket.io-client')('http://52.206.62.115:3001', {forceNew: true});
var Gpio = require('pigpio').Gpio;
var randomColor = require('randomcolor');


const controllerId = 1;
_ledRed = new Gpio(9, {mode: Gpio.OUTPUT});
_ledGreen = new Gpio(11, {mode: Gpio.OUTPUT});
_ledBlue = new Gpio(8, {mode: Gpio.OUTPUT});
var _currentColor = null;
var _goalColor;

var _timeoutTimer;
var _autoColors;


function connectServer() {

    setColor({r: 255, g: 0, b: 0}, false);

    ServerSocket.on('connect', function(){

        console.log("Connected to WebServer");

        if(_currentColor === null)
            setColor(_currentColor);

        ServerSocket.on('SetColor', function(color){
            setColor(color, false);
        });
    });
};

function setColor(color, isFade){

    if(color === null) {
        console.log("Invalid Color. Is NULL")
        return;
    }

    if(_currentColor !== null && color.r == _currentColor.r && color.g == _currentColor.g && color.b == _currentColor.b)
        return;

    _currentColor = color;


    if(_autoColors && !isFade)
        clearInterval(_autoColors);

    if(_timeoutTimer)
        clearTimeout(_timeoutTimer);

    console.log('Setting Color. R=' +
        ((color.r / 255)*100).toFixed(0) + '% G=' +
        ((color.g / 255)*100).toFixed(0) + '% B=' +
        ((color.b / 255)*100).toFixed(0) + '%'
    );

    sendColorMsg(_currentColor);

    _ledRed.pwmWrite(color.r);
    _ledGreen.pwmWrite(color.g);
    _ledBlue.pwmWrite(color.b);


    /*Set user timeout after 30 seconds*/
    if(!isFade) {
        _timeoutTimer = setTimeout(function () {
            console.log("Starting New Fade");
            fadeToRandom();
        }, 15000);
    };
};

function sendColorMsg(color){
    ServerSocket.emit('SendColor', color);
}

connectServer();

function fadeToRandom(){

    _goalColor = hexToRgb(randomColor.randomColor());

    console.log('Setting Color. R=' +
        ((_goalColor.r / 255)*100).toFixed(0) + '% G=' +
        ((_goalColor.g / 255)*100).toFixed(0) + '% B=' +
        ((_goalColor.b / 255)*100).toFixed(0) + '%'
    );

    /*Update color ever 10ms*/
    _autoColors = setInterval(function () {
        if(_goalColor.r == _currentColor.r && _goalColor.g == _currentColor.g && _goalColor.b == _currentColor.b)
        {
            console.log("Done a fade color");
            clearInterval(_autoColors);
            setTimeout(fadeToRandom, 5000);
            return;
        }

        var newColor = { r: _currentColor.r, g: _currentColor.g, b: _currentColor.b};

        if(_goalColor.r != newColor.r)
            newColor.r = (newColor.r > _goalColor.r) ? --newColor.r : ++newColor.r;

        if(_goalColor.g != newColor.g)
            newColor.g = (newColor.g > _goalColor.g) ? --newColor.g : ++newColor.g;

        if(_goalColor.b != newColor.b)
            newColor.b = (newColor.b > _goalColor.b) ? --newColor.b : ++newColor.b;

        setColor(newColor, true);

    }, 40);
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

