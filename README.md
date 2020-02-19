# node-red-contrib-ruuvitag
Node-RED node for listening [RuuviTags](https://ruuvi.com/).

This is pretty much just a thin wrapper on top of [node-ruuvitag](https://github.com/pakastin/node-ruuvitag).

It listens to all RuuviTags in range and puts content of received messages without modifications to ```msg.payload```. RuuviTag ID is added to ```msg.topic``` (with configurable prefix). 

# Configuration
*Scan interval* controls how often scanning is performed and results forwarded.

*Scan time* controls for how log scanning remains active. Default RuuviTag firmware sends data in BLE advertisements once per second, but sometimes advertisements might get lost and it's probably best to set this to a few seconds or so.

Not really tested, but works for me on RPI 3.