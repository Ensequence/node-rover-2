# node-rover-2

Implementation of tcp network protocols for the [Brokstone Rover 2.0](http://www.brookstone.com/rover-20-app-controlled-spy-tank).  Note that all rover commands require a connection to the rover wifi network, typically beginning with `ROVER`.

Attempts to expose all functionality of the rover with an easy to use API.  Still under heavy development.

## Installation

Install via git:

```bash
$ npm install git+ssh://gitlab:node-rover-2
```

## Repl

`node-rover-2` exposes a `repl.js` file for testing.  Currently the exposed locals include:

* `rover`: outward facing api object
* `utils`: byte utility functions
* `blow`: blowfish implementation

## Usage

Require and go:

```javascript
// Require rover
var rover = require('node-rover-2');

// Establish connection
rover.connect(function (err) {
    // Check if there was an error establishing connection
    if (err) return console.log('Connect error: ', err);

    // Move around
    rover.forward(1000);
    rover.reverse(1500);
});
```

## API

#### rover.connect([callback])

Establishes connection to rover.  Requires connection to rover network.

* `callback`: [Optional] function to deliver connection error

#### rover.disconnect()

Closes connection with rover.  Any subsequent commands will throw an error, with the exception of `connect`.

#### rover.forwardLeft([duration])

Instructs the rover to move the left track forward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

#### rover.forwardRight([duration])

Instructs the rover to move the right track forward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

#### rover.reverseLeft([duration])

Instructs the rover to move the left track backward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

#### rover.reverseRight([duration])

Instructs the rover to move the right track backward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

#### rover.forward([duration])

Instructs the rover to move both tracks forward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

#### rover.reverse([duration])

Instructs the rover to move both tracks backward.  Seems to persist for one second with a single instruction.

* `duration`: [Optional] ms to continue sending instruction

#### rover.cameraUp()

Instructs the rover to raise the camera.  Will continue until told to stop or reaches highest point.

#### rover.cameraDown()

Instructs the rover to lower the camera.  Will continue until told to stop or reaches lowest point.

#### rover.cameraStop()

Instructs the rover to stop all camera movement.

#### rover.spin([direction,][duration])

Instructs the rover to spin.

* `direction`: [Optional] direction of spin ('clockwise' or 'counter-clockwise'), defaults to 'clockwise'
* `duration`: [Optional] how long to continue spin