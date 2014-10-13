# rover-2

Implementation of TCP network protocols for the [Brokstone Rover 2.0](http://www.brookstone.com/rover-20-app-controlled-spy-tank).  Note that all rover commands require a connection to the rover wifi network, typically beginning with `ROVER`.

Attempts to expose all functionality of the rover with an easy to use API.

> This module is still under heavy development. Pull-requests are welcome.


## Installation

Install via git:

```bash
$ npm install rover-2
```


## REPL

`rover-2` exposes a `repl.js` file for testing.  Currently the exposed locals include:

* `rover`: outward facing api object
* `utils`: byte utility functions
* `blow`: blowfish implementation


For example:

```
$ ./repl.js 
rover> rover
{ connect: [Function: connect],
  disconnect: [Function: disconnect],
  forwardLeft: [Function: forwardLeft],
  forwardRight: [Function: forwardRight],
  reverseLeft: [Function: reverseLeft],
  reverseRight: [Function: reverseRight],
  forward: [Function: forward],
  reverse: [Function: reverse],
  cameraUp: [Function: cameraUp],
  cameraDown: [Function: cameraDown],
  cameraStop: [Function: cameraStop],
  spin: [Function: spin] }
```

## Usage

Require and go:

```javascript
// Require rover
var rover = require('rover-2');

// Establish connection, then send some commands
rover.connect()
    .then(function () {
        console.log('sending forward');
        return rover.forward(1000);
    })
    .then(function () {
        console.log('stopping');
        return rover.stop();
    })
    .then(function () {
        console.log('sending reverse');
        return rover.reverse(1000);
    })
    .then(function () {
        console.log('spinning');
        return rover.spin('clockwise', 1000);
    })
    .catch(function (err) {
        console.log('failed: ', err);
    });

```

## API

#### rover.connect([callback])

Establishes connection to rover.  Requires connection to rover network.

* `callback`: [Optional] function to deliver connection error

___________________________________

#### rover.disconnect()

Closes connection with rover.  Any subsequent commands will throw an error, with the exception of `connect`.

___________________________________

#### rover.forwardLeft([duration])

Instructs the rover to move the left track forward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

___________________________________

#### rover.forwardRight([duration])

Instructs the rover to move the right track forward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

___________________________________

#### rover.reverseLeft([duration])

Instructs the rover to move the left track backward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

___________________________________

#### rover.reverseRight([duration])

Instructs the rover to move the right track backward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

___________________________________

#### rover.stopLeft()

Instructs the rover to stop left track movement.

___________________________________

#### rover.stopRight()

Instructs the rover to stop right track movement.

___________________________________

#### rover.forward([duration])

Instructs the rover to move both tracks forward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

___________________________________

#### rover.reverse([duration])

Instructs the rover to move both tracks backward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

___________________________________

#### rover.stop()

Instructs the rover to stop all track movement.

___________________________________

#### rover.cameraUp()

Instructs the rover to raise the camera.  Will continue until told to stop or reaches highest point.

___________________________________

#### rover.cameraDown()

Instructs the rover to lower the camera.  Will continue until told to stop or reaches lowest point.

___________________________________

#### rover.cameraStop()

Instructs the rover to stop all camera movement.

___________________________________

#### rover.spin([direction,][duration])

Instructs the rover to spin.

* `direction`: [Optional] direction of spin ('clockwise' or 'counter-clockwise'), defaults to 'clockwise'
* `duration`: [Optional] how long to continue spin