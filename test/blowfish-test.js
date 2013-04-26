
var Blowfish = require('./../lib/third-party/blowfish'),
    key = 'AC13:00E04C082DD6-save-private:AC13';

var blowfish = new Blowfish(key);


// Setup data
var data = new Buffer(16);
data[0] = 0x84; data[1] = 0x5c; data[2] = 0x2a; data[3] = 0x54;
data[4] = 0xdb; data[5] = 0xb1; data[6] = 0x1f; data[7] = 0x6b;
data[8] = 0x23; data[9] = 0x08; data[10] = 0x9c; data[11] = 0x3d;
data[12] = 0xa3; data[13] = 0x9b; data[14] = 0x8e; data[15] = 0x7f;


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

var num1 = buf1.readInt32BE(0);
var num2 = buf2.readInt32BE(0);
var num3 = buf3.readInt32BE(0);
var num4 = buf4.readInt32BE(0);

// Encipher each pair
var left = blowfish.encipher(num1, num2);
var right = blowfish.encipher(num3, num4);

console.log('left: ', left);
console.log('right: ', right);

// Write validation
var validation = new Buffer(16);
validation.writeUInt32BE(left[0], 0);
validation.writeUInt32BE(left[1], 4);
validation.writeUInt32BE(right[0], 8);
validation.writeUInt32BE(right[1], 12);
console.log(validation);