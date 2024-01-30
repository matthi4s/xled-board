# xled-board

This is a library for mapping and controlling a 2D LED board of Twinkly LED lights using the [xled-js](https://github.com/matthi4s/xled-js) 
library. It helps to map the relative floating point coordinates of the scanned Twinkly layout to a 2D grid of LEDs. It can
be used with multiple Twinkly devices at once and provides a simple interface to control the LEDs by sending realtime
frames.

<!-- TOC -->
* [Installation](#installation)
* [Example](#example)
* [Usage](#usage)
  * [Setup](#setup)
    * [Devices](#devices)
    * [Layout](#layout)
  * [Sending frames](#sending-frames)
    * [Manually](#manually)
    * [Interval](#interval)
    * [Queueing](#queueing)
  * [Changing LEDs](#changing-leds)
    * [Set color](#set-color)
    * [Get color](#get-color)
    * [Set color for all LEDs](#set-color-for-all-leds)
    * [Draw rectangle](#draw-rectangle)
    * [Draw line](#draw-line)
<!-- TOC -->

## Installation

```bash
npm install matthi4s/xled-board
```
*This library is not yet published to npm.*

## Example

```js
import {Board} from "xled-board";

let board = new Board();
await board.loadOrDiscoverDevices("devices.json");
await board.loadOrMapLayout("layout.json", {width: 40, height: 20});

board.start();

setInterval(() => {
    board.setColor(board.getRandomPosition(), Color.RANDOM);
}, 100);
```

## Usage

```js
import {Board} from "xled-board";

let board = new Board();
```

### Setup

#### Devices

**Automatically discover devices** 
```js
await board.discoverDevices();
```

**Manually add devices**
```js
import {Device} from "xled-board";

let device = new Device("<ip>", "ip").enableRGBW();
board.addDevice(device);
```

**Save devices to file**
```js
await board.saveDevices("devices.json");
```

**Load devices from file**
```js
await board.loadDevices("devices.json");
```

**Load devices from file or discover them and save**
```js
await board.loadOrDiscoverDevices("devices.json");
```

#### Layout

This library can read the layout from all Twinkly devices and map them to a 2D grid. You can just scan the layout
using the Twinkly app. Make sure to get a 2D layout which should be the default when using the simple scanning
feature. All devices that you want to use should be grouped and scanned together. Any LEDs that shouldn't be
part of the layout should be hidden from the scan.

**Map layout**
```js
await board.mapLayout({width: 40, height: 20});
```

The layout definition can contain one or multiple rectangles if you have a more complex layout.
You can define a layout with two rectangle like this:
```
3   xx
2   xx
1 oooo
0 oooo
  0123
```
using this code:
```js
await board.mapLayout([
    {x: 0, y: 0, width: 4, height: 2}, // o
    {x: 2, y: 2, width: 2, height: 2}  // x
]);
```

**Save layout to file**
```js
await board.saveLayout("layout.json");
```

**Load layout from file**
```js
await board.loadLayout("layout.json");
```

**Load layout from file or map and save it**
```js
await board.loadOrMapLayout("layout.json", {width: 40, height: 20});
```

### Sending frames

#### Manually
You can simply send the next full frame to all devices
```js
await board.sendFullFrame();
```
Make sure to send frames at least every few seconds or the devices will return to their default mode.

#### Interval
You can also send frames repeatedly, optionally with a custom sleep time between frames.
```js
import {Device} from "xled-board";

board.start(Device.FRAME_MODE_INTERVAL, 100);
```
The second argument is the sleep time in milliseconds. The default is 100ms.
This does not mean that the frame will be sent every 100ms. It just means that the next frame will be sent 100ms after
the previous one was sent. The actual time between frames depends on the time it takes to send the frame.

#### Queueing
The default and recommended mode is called queueing and only sends frames if necessary. When a change
is made to an LED, the frame will be sent more or less immediately. Changes made in quick succession will be
grouped together. If there are changes while a frame is being sent, the change will be queued and sent after the
current frame has been sent.

Also, frames are sent on a (much slower) regular interval to make sure that the devices don't return to their default
mode.

```js
board.start();
```

### Changing LEDs

#### Set color
```js
board.setColor(new Position(2, 3), new Color(255, 0, 0));
board.setColor(new Position(2, 3), Color.BLUE);
board.setColor(board.getRandomPosition(), Color.RANDOM);
```

#### Get color
```js
let color = board.getColor(new Position(2, 3));

// changing the color object will change the LED
color.lighten(0.1);

// use a copy if you want to use the color further
let colorCopy = color.clone();
```

#### Set color for all LEDs
```js
board.setColorForAll(Color.RED);
```

#### Draw rectangle
```js
board.drawRectangle(new Position(2, 3), new Position(5, 7), Color.RED);
```

#### Draw line
```js
board.drawLine(new Position(2, 3), new Position(5, 7), Color.RED);
```

