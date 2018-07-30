/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const serviceManager = new ServiceManager();
const fs = require('fs');
/**
 * inject default services
 */
Application.injectServices(serviceManager);

serviceManager.eventManager.on(
    ServiceManager.LOAD_SERVICE,
    function(evt) {
        if (evt.data.name === 'Application') {

            serviceManager.set(
                'DexieManager',
                new DexieManager(serviceManager.get('Application').config.indexedDB.name)
            );

            serviceManager.get('DexieManager').init();
        }
    }
);

/**
 * @type {Object}
 */
serviceManager.set(
    'PaperToastNotification',
    new PaperToastNotification('notification')
).set(
    'Config',
    function (sm) {
        const fs = require('fs');
        return  JSON.parse(fs.readFileSync(__dirname + '/config/application.json'));
    }
).set(
    'Timer',
    function (sm) {
        const Timer = require('../node_modules/easytimer.js/dist/easytimer.min.js');

        let timer =  new Timer();
        timer.start({precision: 'secondTenths'});
        return timer;

    }
).set(
    'Application',
    (function(sm){
        const fs = require('fs');
        return new Application(
            JSON.parse(fs.readFileSync(__dirname + '/config/application.json')),
            'dashboard'
        );
    })()
).set(
    'TcpServer',
    function(sm){
        let config = sm.get('Config');

        return new TcpServer(
            config.tcpClient ? config.tcpClient : {}
        );
    }
).set(
    'ffmpeg',
    function (sm) {

        let FfmpegCommand = require('fluent-ffmpeg');
        let command = new FfmpegCommand();

        let heightRow = 90;
        let widthContent = 1720;
        let height = 540;
        let width  = 2064;
        let offsetX = 660;
        let offsetY = 0;

        let row = (Math.ceil(width*(height/heightRow)/widthContent) * Math.ceil(width / widthContent)) - Math.ceil(width / widthContent);
        console.log(row);
        let complexFilter = [];

        complexFilter.push(`color=s=${width}x${height}:c=black [base0]`);

        // Attach input file
        for (let cont = 0; cont < row; cont++) {

            command = command.addInput('test/test.mp4');


            complexFilter.push({
                filter: 'setpts=PTS-STARTPTS',
                inputs: `${cont}:v` , outputs: `block${cont}`
            });
        }

        let contentOffsetX;
        let contentOffsetY = offsetY;
        // Build Mosaic, block by block
        for (let cont = 0; cont < row; cont++) {

            switch (true) {
                case width > offsetX :
                    contentOffsetX = offsetX;
                    offsetX = offsetX + widthContent;
                    break;
                case width <= offsetX :
                    contentOffsetY = contentOffsetY + heightRow;
                    contentOffsetX = offsetX - width - widthContent;
                    offsetX = contentOffsetX + widthContent;
                    break;
            }


            complexFilter.push({
                filter: 'overlay', options: { shortest:1, x: contentOffsetX, y:  contentOffsetY},
                inputs: [`base${cont}`, `block${cont}`], outputs: `base${cont+1}`
            });

        }

        console.log(complexFilter);

        let outFile = 'test/out.mp4';

        command
            .complexFilter(complexFilter, 'base'+row)
            .save(outFile)
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('progress', function(progress) {
                console.log('... frames: ' + progress.frames);
            })
            .on('end', function() {
                console.log('Finished processing');
            });
    }
);
