const ruuvi = require('node-ruuvitag');

module.exports = function(RED) {
    function RuuvitagNode(config) {
        RED.nodes.createNode(this, config);
        this.config = config;
        var node = this;

        node.debug('config is ' + JSON.stringify(node.config));

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
    }

    RED.nodes.registerType("ruuvitag", RuuvitagNode);
}
