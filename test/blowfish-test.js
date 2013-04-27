
var blowfish = require('./../lib/blowfish'),
    utils = require('./../lib/util'),
    key = 'AC13:00E04C082DD6-save-private:AC13';

// var blowfish = new Blowfish(key, key.length);

blowfish.init(key, key.length);

// Setup data
var data = new Buffer(16);
// data[0] = 0x84; data[1] = 0x5c; data[2] = 0x2a; data[3] = 0x54;
// data[4] = 0xdb; data[5] = 0xb1; data[6] = 0x1f; data[7] = 0x6b;
// data[8] = 0x23; data[9] = 0x08; data[10] = 0x9c; data[11] = 0x3d;
// data[12] = 0xa3; data[13] = 0x9b; data[14] = 0x8e; data[15] = 0x7f;
data[0] = 0x55; data[1] = 0xc8; data[2] = 0x94; data[3] = 0x07;
data[4] = 0x76; data[5] = 0xd7; data[6] = 0xb5; data[7] = 0x69;
data[8] = 0xf9; data[9] = 0x66; data[10] = 0x95; data[11] = 0x5d;
data[12] = 0x3d; data[13] = 0x31; data[14] = 0xcf; data[15] = 0x26;

console.log('initial data: ', data);


// Create buffers to hold each piece
var buf1 = new Buffer(4),
    buf2 = new Buffer(4),
    buf3 = new Buffer(4),
    buf4 = new Buffer(4);

// Copy each piece
data.copy(buf1, 0, 0, 4);
data.copy(buf2, 0, 4, 8);
data.copy(buf3, 0, 8, 12);
data.copy(buf4, 0, 12, 16);

console.log('buf1: ', buf1);
console.log('buf2: ', buf2);
console.log('buf3: ', buf3);
console.log('buf4: ', buf4);

var num1 = utils.byteArrayToInt(buf1, 0, 4);
var num2 = utils.byteArrayToInt(buf2, 0, 4);
var num3 = utils.byteArrayToInt(buf3, 0, 4);
var num4 = utils.byteArrayToInt(buf4, 0, 4);

console.log('num1 type: ', typeof num1);
console.log('num1: ', num1);
console.log('num2: ', num2);
console.log('num3: ', num3);
console.log('num4: ', num4);

// Encipher each pair
var left = blowfish.encipher([num1], [num2]);
var right = blowfish.encipher([num3], [num4]);

console.log('left: ', left);
console.log('right: ', right);

// Write validation
var validation = new Buffer(16);
var left0 = utils.int32ToByteArray(left[0]);
var left1 = utils.int32ToByteArray(left[1]);
var right0 = utils.int32ToByteArray(right[0]);
var right1 = utils.int32ToByteArray(right[1]);

console.log('left0: ', left0);
console.log('left1: ', left1);
console.log('right0: ', right0);
console.log('right1: ', right1);

left0.copy(validation, 0, 0, 4);
left1.copy(validation, 4, 0, 4);
right0.copy(validation, 8, 0, 4);
right1.copy(validation, 12, 0, 4);

console.log('final challenge: ', validation);