const ruuvi = require('node-ruuvitag');
const noble = require('@abandonware/noble');

module.exports = function (RED) {
    function RuuvitagNode(config) {
        RED.nodes.createNode(this, config);
        this.config = config;
        let node = this;

        noble.stopScanning();

        node.debug('config is ' + JSON.stringify(node.config));

        node.on('close', (done) => {
            node.debug('closing');
            noble.stopScanning();
            // hack: clear out found tags so that found event gets fired again 
            // when node is restarted (during flow re-deploy)
            ruuvi._foundTags = [];
            ruuvi._tagLookup = {};
            done();
        });

        ruuvi.on('found', tag => {
            let tagId = tag.id;
            let previousTime = 0;
            node.debug('ruuvitag ' + tag.id + ' found');
            tag.on('updated', data => {
                node.debug('got ruuvitag data for ' + tagId);
                let currentTime = Date.now();
                if ((currentTime - previousTime) > (node.config.interval * 1000)) {
                    let msg = { topic: node.config.prefix + tagId, payload: data };
                    node.debug('sending ruuvitag data ' + JSON.stringify(msg));
                    node.send(msg);
                    previousTime = currentTime;
                }
            });
        });

        setInterval(() => {
            node.debug('start scanning');
            noble.startScanning();
            setTimeout(() => {
                noble.stopScanning();
            }, node.config.scantime * 1000);
        }, node.config.interval * 1000);

    }

    RED.nodes.registerType("ruuvitag", RuuvitagNode);
}
