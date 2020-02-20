const ruuvi = require('node-ruuvitag');
const noble = require('@abandonware/noble');

module.exports = function (RED) {
    function RuuvitagNode(config) {
        RED.nodes.createNode(this, config);
        this.config = config;
        let node = this;
        let scanIntervalId = null;
        let scanTimeoutId = null;

        node.debug('config is ' + JSON.stringify(node.config));

        node.on('close', (done) => {
            node.debug('closing');

            if (scanIntervalId) {
                clearInterval(scanIntervalId);
                scanIntervalId = null;
            }

            if (scanTimeoutId) {
                clearInterval(scanTimeoutId);
                scanTimeoutId = null;
            }

            // remove current 'found' listener
            ruuvi.listeners('found').forEach(listener => {
                ruuvi.off('found', listener);
            });

            // and tag 'updated' listeners for all tags
            ruuvi._foundTags.forEach(tag => {
                tag.listeners('updated').forEach(listener => {
                    tag.off('updated', listener);
                });
            });

            // hack: clear out found tags so that found event gets fired again
            // when node is restarted (during flow re-deploy)
            ruuvi._foundTags = [];
            ruuvi._tagLookup = {};

            done();
        });

        ruuvi.on('found', tag => {
            let tagId = tag.id;
            let previousTime = 0;
            node.debug(tag.id + ' found');
            tag.on('updated', data => {
                node.debug('got data for ' + tagId);
                let currentTime = Date.now();
                if ((currentTime - previousTime) > (node.config.interval * 950)) {
                    let msg = { topic: node.config.prefix + tagId, payload: data };
                    node.debug('sending data ' + JSON.stringify(msg));
                    node.send(msg);
                    previousTime = currentTime;
                }
            });
        });

        function startScanning() {
            if (noble.state === 'poweredOn') {
                node.debug('start scanning');
                noble.startScanning();
            }
        }

        function stopScanning() {
            if (noble.state === 'poweredOn') {
                node.debug('stop scanning');
                noble.stopScanning();
            }
        }

        scanTimeoutId = setTimeout(() => {
            stopScanning();
        }, node.config.scantime * 1000);

        scanIntervalId = setInterval(() => {
            startScanning();
            scanTimeoutId = setTimeout(() => {
                stopScanning();
            }, node.config.scantime * 1000);
        }, node.config.interval * 1000);

    }

    RED.nodes.registerType("ruuvitag", RuuvitagNode);
}
