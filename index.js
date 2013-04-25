

// ### Core Modules
var net = require('net'),
    async = require('async');


module.exports = function () {


    return {
        net: require('net'),
        sock: net.createConnection(80, '192.168.1.100'),
        createBuffer: createBuffer
    };
};
var commands = {
    LEFT_FORWARD: createBuffer(25, { 4: 0xfa, 15: 0x02, 23: 0x04, 24: 0x0a }),
    INIT_0: 'GET /check_user.cgi?user=AC13&pwd=AC13 HTTP/1.1\r\nHost: 192.168.1.100:80\r\nUser-Agent: WifiCar/1.0 CFNetwork/485.12.7 Darwin/10.4.0\r\nAccept: */*\r\nAccept-Language: en-us\r\nAccept-Encoding: gzip, deflate\r\nConnection: keep-alive\r\n\r\n!',
    INIT_1: createBuffer(23, {}),
    INIT_2: createBuffer(49, { 4: 0x02, 15: 0x1a, 23: 0x41, 24: 0x43, 25: 0x31, 26: 0x33, 36: 0x41, 37: 0x43, 38: 0x31, 39: 0x33 }),
    INIT_3: createBuffer(24, { 4: 0x04, 15: 0x01, 19: 0x01, 23: 0x02 }),
    INIT_4: function (data) {
        var buf = createBuffer(27, { 15: 0x04, 19: 0x04 });
        for (var i = 0; i < data.length; i++) {
            buf[i + 23] = data[i];
        }
        console.log('buf: ', buf);
        return buf;
    },
    // INIT_5: createBuffer()
};
var initSocket = net.createConnection(80, '192.168.1.100');
initSocket.on('connect', function() {
    console.log('init connected');
    async.series({
        INIT_0: function (callback) {
            console.log('start init0')
            sendCmd(commands['INIT_0'], callback);
        },
        INIT_1: function (callback) {
            console.log('start init1')
            sendCmd(initSocket, commands['INIT_1'], callback);
        },
        INIT_2: function (callback) {
            console.log('start init2')
            sendCmd(initSocket, commands['INIT_2'], callback);
        },
        INIT_3: function (callback) {
            console.log('start init3')
            sendCmd(initSocket, commands['INIT_3']);
            // setInterval(function () {
            //     console.log('sending left forward');
            //     sendCmd(initSocket, commands['LEFT_FORWARD'], function (err, res) {});
            // }, 750);
        }
    }, function (err, res) {
        // check error
        if (err) return console.log('Error: ', err);
        console.log('res: ', res);
        // Create buffer for last init
        var midBuf = new Buffer(4),
            init3Buf = res['INIT_3'];
        for (var i = 0; i < 4; i++) {
            midBuf[i] = init3Buf[i + 25];
        }


        var buf = commands['INIT_4'](midBuf);
        var lastSocket = net.createConnection(80, '192.168.1.100');
        console.log('sending final init');
        lastSocket.on('connect', function () {
            sendCmd(lastSocket, buf);

            setInterval(function () {
                console.log('sending left forward');
                sendCmd(initSocket, commands['LEFT_FORWARD'], function (err, res) {});
            }, 500);
        });

        // console.log('sending left forward');
        // setInterval(function () {
        //     sendCmd(lastSocket, commands['LEFT_FORWARD'], function (err, res) {});
        // }, 500);
    });
});


function sendCmd (socket, data, cb) {
    var done = false;
    if (typeof data === 'function') {
        console.log('have socket');
        cb = data;
        data = socket;
        socket = net.createConnection(80, '192.168.1.100');

        socket.on('connect', function (data) {
            writeToSocket(socket, data, cb);
        });
    } else {
        writeToSocket(socket, data, cb);        
    }

}

function writeToSocket (socket, data, cb) {
    var done = false;

    // Grab data and deliver to callback
    socket.on('data', function (data) {
        console.log('data: ', data);
        if (!done && cb && typeof cb == 'function') cb(null, data);
        done = true;
    });

    // Log any errors
    socket.on('error', function (err) {
        console.log('err: ', err);
    });

    // Log disconnection
    socket.on('end', function () {
        console.log('Disconnected');
    });

    console.log('writing: ', data);

    // Write data
    if (typeof data !== 'string') {
        socket.write(data, 0);   
    } else {
        socket.write(data, 'utf8')
    }
}


function createBuffer (length, data) {
    // console.log('creating buffer with data: ', data);
    var buf = new Buffer(length);
    buf.write('MO_O');
    for (var i = 4; i < length; i++) {
        buf[i] = 0x00;
    }
    // console.log('buf: ', buf);
    for (var prop in data) {
        (function (index) {
            buf[index] = data[index];
        })(prop);
    }
    // console.log('buf: ', buf);

    return buf;
}
    // public boolean Connect() {

    //     try {
            
    //         //Initializing command socket
    //         SocketAddress sockaddr = new InetSocketAddress("192.168.1.100", 80);
    //         cSock = new Socket();
    //         cSock.connect(sockaddr,10000);
    
            
                
    //         //Setting the connection
    //         WriteStart();
    //         ReceiveAnswer(0);
            
    //         cSock.close();
            
    //         //Reinitializing the command socket
    //         cSock = new Socket();
    //         cSock.connect(sockaddr,10000);
            
    //         byte[] buffer = new byte[2048];
            
    //         for (int i = 1; i < 4; i++) {
                
    //             WriteCmd(i, null);
    //             buffer = ReceiveAnswer(i);
    //         }
            
    //         byte[] imgid = new byte[4];
            
    //         for (int i = 0; i < 4; i++)
    //             imgid[i] = buffer[i + 25];

    //         vSock = new Socket();
    //         vSock.connect(sockaddr,10000);
    //         WriteCmd(4, imgid);
            
    //         startStreaming();
            
    //         isConnected = true;
            
            
            
    //     } catch (Exception e) {
    //          return false;  
    //     }
        
    //     return true;
    // }

    // private void WriteCmd(int index, byte[] extra_input) {
    //     int len = 0;
    //     switch (index) {
    //     case 1:
    //         len = 23;
    //         break;
    //     case 2:
    //         len = 49;
    //         break;
    //     case 3:
    //         len = 24;
    //         break;
    //     case 4:
    //         len = 27;
    //         break;
    //     case 5:
    //         len = 25;
    //         break; // cmd for the wheels
    //     case 6:
    //         len = 25;
    //         break;
    //     case 7:
    //         len = 25;
    //         break;
    //     case 8:
    //         len = 25;
    //         break;
    //     case 9:
    //         len = 23;
    //         break;
    //     case 10:
    //         len = 24;
    //         break;
    //     case 11:
    //         len = 24;
    //         break;
    //     }
    //     byte[] buffer = new byte[len];
    //     for (int i = 4; i < len; i++)
    //         buffer[i] = '\0';
    //     buffer[0] = 'M';
    //     buffer[1] = 'O';
    //     buffer[2] = '_';
    //     buffer[3] = 'O';
    //     if (index == 4) {
    //         buffer[3] = 'V';
    //     }

    //     switch (index) {
    //     case 1:
    //         break;
    //     case 2:
    //         buffer[4] = 0x02;
    //         buffer[15] = 0x1a;
    //         buffer[23] = 'A';
    //         buffer[24] = 'C';
    //         buffer[25] = '1';
    //         buffer[26] = '3';
    //         buffer[36] = 'A';
    //         buffer[37] = 'C';
    //         buffer[38] = '1';
    //         buffer[39] = '3';
    //         break;
    //     case 3:
    //         buffer[4] = 0x04;
    //         buffer[15] = 0x01;
    //         buffer[19] = 0x01;
    //         buffer[23] = 0x02;
    //         break;
    //     case 4:
    //         buffer[15] = 0x04;
    //         buffer[19] = 0x04;
    //         for (int i = 0; i < 4; i++)
    //             buffer[i + 23] = extra_input[i];
    //         break;
    //     case 5: // left Wheel Foward
    //         buffer[4] = (byte) 0xfa;
    //         buffer[15] = 0x02;
    //         buffer[19] = 0x01;
    //         buffer[23] = 0x04;
    //         buffer[24] = (byte) 0x0a;
    //         break;
    //     case 6: // Left Wheel Backward
    //         buffer[4] = (byte) 0xfa;
    //         buffer[15] = 0x02;
    //         buffer[19] = 0x01;
    //         buffer[23] = 0x05;
    //         buffer[24] = (byte) 0x0a;
    //         break;
    //     case 7: // Right wheel Foward
    //         buffer[4] = (byte) 0xfa;
    //         buffer[15] = 0x02;
    //         buffer[19] = 0x01;
    //         buffer[23] = 0x01;
    //         buffer[24] = (byte) 0x0a;
    //         break;
    //     case 8: // Right Wheel Backward
    //         buffer[4] = (byte) 0xfa;
    //         buffer[15] = 0x02;
    //         buffer[19] = 0x01;
    //         buffer[23] = 0x02;
    //         buffer[24] = (byte) 0x0a;
    //         break;
    //     case 9: // IR off(?)
    //         buffer[4] = (byte) 0xff;
    //         break;
    //     case 10:
    //         buffer[4] = (byte) 0x0e;
    //         buffer[15] = 0x01;
    //         buffer[19] = 0x01;
    //         buffer[23] = (byte)0x5e;
    //         break;
    //     case 11:
    //         buffer[4] = (byte) 0x0e;
    //         buffer[15] = 0x01;
    //         buffer[19] = 0x01;
    //         buffer[23] = (byte)0x5f;
    //         break;

    //     }
        
    //     if (index != 4) {
    //         try {
    //             cSock.getOutputStream().write(buffer, 0, len);
    //             cmdBuffer = buffer;
    //         } catch (IOException e) {
    //             // TODO Auto-generated catch block
    //             e.printStackTrace();
    //         }   
    //     } 
    //     else {
            
    //         try {
    //             vSock.getOutputStream().write(buffer, 0, len);
    //         } catch (IOException e) {
    //             // TODO Auto-generated catch block
    //             e.printStackTrace();
    //         }
    //     }
        
    // }