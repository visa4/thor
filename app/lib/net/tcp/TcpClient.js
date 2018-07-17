try {
    Utils = require('./../Utils');
}
catch (err) {

    Utils = require(__dirname + '/lib/Utils.js');
}


class TcpClient  {

    static get DEFAULT_PORT() {return 8002} ;

    static get DEFAULT_IP() {return '127.0.0.1'} ;

    constructor(options = {}) {

        const net = require('net');

        this.socket = new net.Socket();

        this.socket.connect(
            options.port ? options.port : TcpClient.DEFAULT_PORT,
            options.ip ? options.ip : TcpClient.DEFAULT_IP,
            this._connect.bind(this)
        );

        /**
         *
         */
        this.socket.on('data', this.data.bind(this));

        this.socket.on('close', this._close.bind(this));
    }

    send(data) {

       this.socket.write(data);
    }

    /**
     * @param evt
     */
    data(evt) {
        console.log('TCP DATA', evt.toString());
    }


    _connect(evt) {
        console.log('TCP CLIENT REMOVE', this, evt);
    }

    /**
     */
    _close() {
        console.log('TCP CLOSE', 'Start listening');
    }

    /**
     * @param evt
     */
    _error(evt) {
        console.log('TCP ERROR', evt);
    }
}

module.exports = TcpClient;