# node-red-contrib-ruuvitag
Node-RED node for listening [RuuviTags](https://ruuvi.com/).

This is pretty much just a thin wrapper on top of [node-ruuvitag](https://github.com/pakastin/node-ruuvitag).

It listens to all RuuviTags in range and puts content of received messages without modifications to ```msg.payload```. RuuviTag ID is added to ```msg.topic``` (with configurable prefix). 

Default RuuviTag firmware sends data in BLE advertisements once per second. RuuviTag node can be configured to forward received data only if at least ```interval``` seconds have passed since data was previously forwarded.

Not really tested, but works for me on RPI 3.