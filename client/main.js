/**
 * Created by adampaul on 11/24/16.
 */

var socket = io.connect('http://52.206.62.115:3000');
var _colorHistory = '#0000ff'
var _resizeTimer;

$(document).ready(function() {
   setupColorPicker();
});

function resizedw(){
    // Haven't resized in 100ms!
}

window.onresize = function(){
    setupColorPicker();
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resizeDone, 100);
};

function setupColorPicker(){

    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    var w1 = (width > 480) ? 450 : width - 50;
    var colorPickerWheel = $.farbtastic("#colorPickerWheel", {callback: pickerUpdate, width: w1, height: w1, startColor: _colorHistory});

    colorPickerWheel.setColor(_colorHistory);

    $('#colorWheelContainer').css('margin-left',(width / 2) - (w1 / 2));

    $('#titleH').css('font-size', w1 / 7);
    $('#currentColor').css('height', w1 / 5.5);
    $('#currentColor').css('width', w1 / 5.5);
}

function resizeDone(){
    //setupColorPicker();
}

function pickerUpdate(color){
    if(color == _colorHistory)
        return;

    _colorHistory = color;
    console.log("Color Picker Wheel: " + color);
    socket.emit('SetColor', hexToRgb(color));
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

socket.on('CurrentColorClient', function(color){
    $('#currentColor').css('background-color',rgbToHex(color.r, color.g, color.b));
});

socket.on('connect', function(){
    pickerUpdate('#0000FF');
    $('#currentColor').css('background-color','#0000FF');
});
