
class SidelineResourceGenerator {

    /**
     *
     * @param storage
     * @param resourceHydrator
     */
    constructor(storage, resourceHydrator) {
        this.hidrator = resourceHydrator;
        this.storageMonitor = storage;
    }

    /**
     *
     * @param name
     * @param files
     * @param sideline
     * @param output
     * @param options
     * @returns {Promise}
     */
    generateResource(name, files, sideline, output, options = {}) {

        return new Promise((resolve, reject) => {


            serviceManager.get('StoragePluginManager')
                .get(MonitorConfig.NAME_SERVICE)
                .get(sideline.virtualMonitorReference.virtualMonitorId)
                .then((monitor) => {
                    // Inject monitor in sideline
                    this._injectsMonitor(sideline, monitor.getMonitors({nested:true}));

                    // Order monitor
                    sideline.sidelines.sort(
                        (ele1, ele2) => {
                            return ele1.monitor.offsetY >= ele2.monitor.offsetY
                        }
                    );

                    let mosaic = new SidelineMosaic(sideline, this.hidrator);
                    mosaic.setBaseComplexFilter(`color=s=${mosaic.getWidth()}x${mosaic.getHeight()}:c=${options.backgroundColor ? options.backgroundColor : 'black'}`);

                    while (mosaic.getRemainingWidth() > 0) {
                        for (let cont = 0; files.length > cont; cont++) {
                            mosaic.addResource(files[cont]);
                        }
                    }

                    mosaic.generateVideo(name);
                });


            /**
            let command = new this.ffmpeg();
            let complexFilter = [];
            let backgroundColor = options.backgroundColor ? options.backgroundColor : 'black';
            complexFilter.push(`color=s=${monitor.width}x${monitor.height}:c=${backgroundColor} [base0]`);
            // TODO CONTROLL

            // TODO Extrat to polygon of monitor


            let rowProgressWidth = 660;
            let rowProgressHeight = sideline.height;
            let index = 0;
            let widthSideline = sideline.width;

            /**
             * Add files
            while (widthSideline > 0) {
                for (let cont = 0; cont < files.length; cont++) {

                    switch (true) {
                        case monitor.width > (rowProgressWidth + files[cont].dimension.width) :
                            complexFilter.push({
                                filter: 'setpts=PTS-STARTPTS',
                                inputs: `${index}:v`, outputs: `block${index}`
                            });
                            rowProgressWidth = rowProgressWidth + files[cont].dimension.width;
                            index++;
                            command = command.addInput(files[cont].location.path + files[cont].location.name);
                            break;
                        case monitor.width <= (rowProgressWidth + files[cont].dimension.width) :
                            complexFilter.push({
                                filter: 'setpts=PTS-STARTPTS',
                                inputs: `${index}:v`, outputs: `block${index}`
                            });
                            index++;
                            command = command.addInput(files[cont].location.path + files[cont].location.name);

                            rowProgressWidth = (rowProgressWidth + files[cont].dimension.width - monitor.width) - files[cont].dimension.width;
                            rowProgressHeight = rowProgressHeight + sideline.height;
                            complexFilter.push({
                                filter: 'setpts=PTS-STARTPTS',
                                inputs: `${index}:v`, outputs: `block${index}`
                            });
                            rowProgressWidth = rowProgressWidth + files[cont].dimension.width;
                            index++;
                            command = command.addInput(files[cont].location.path + files[cont].location.name);
                            break;
                    }


                    widthSideline = widthSideline - files[cont].dimension.width;
                }
            }


            widthSideline = sideline.width;
            rowProgressWidth = 660;
            rowProgressHeight = 0;
            index = 0;

            /**
             * Calculate the coordinates of the files

            while (widthSideline > 0) {
                for (let cont = 0; cont < files.length; cont++) {

                    switch (true) {
                        case monitor.width > (rowProgressWidth + files[cont].dimension.width) :
                            console.group('CONTAIN');
                            console.log('INDEX', index);
                            console.log('OFFESET', rowProgressWidth);
                            console.log('ROW PROGRESS HEIGHT', rowProgressHeight);
                            console.groupEnd();
                            complexFilter.push({
                                filter: 'overlay', options: { shortest:1, x: rowProgressWidth, y:  rowProgressHeight},
                                inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                            });
                            rowProgressWidth = rowProgressWidth + files[cont].dimension.width;
                            index++;
                            break;
                        case monitor.width <= (rowProgressWidth + files[cont].dimension.width) :
                            console.group('NEWLINE 1');
                            console.log('INDEX', index);
                            console.log('OFFESET', rowProgressWidth);
                            console.log('ROW PROGRESS HEIGHT', rowProgressHeight);
                            console.groupEnd();
                            complexFilter.push({
                                filter: 'overlay', options: { shortest:1, x: rowProgressWidth, y:  rowProgressHeight},
                                inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                            });
                            index++;

                            rowProgressWidth = (rowProgressWidth + files[cont].dimension.width - monitor.width) - files[cont].dimension.width;
                            rowProgressHeight = rowProgressHeight + sideline.height;
                            console.group('NEWLINE 1');
                            console.log('INDEX', index);
                            console.log('OFFESET', rowProgressWidth);
                            console.log('ROW PROGRESS HEIGHT', rowProgressHeight);
                            console.groupEnd();
                            complexFilter.push({
                                filter: 'overlay', options: { shortest:1, x: rowProgressWidth, y:  rowProgressHeight},
                                inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                            });
                            rowProgressWidth = rowProgressWidth + files[cont].dimension.width;
                            index++;
                            break;
                    }

                    widthSideline = widthSideline - files[cont].dimension.width;
                }
            }

            console.log(complexFilter);

            command
                .complexFilter(complexFilter, 'base'+index)
                .save(output)
                .on('error', function(err) {
                    reject(err.message);
                })
                .on('progress', options.progress ? options.progress : () =>{console.log('default progress')})
                .on('end', function(data) {
                    resolve(output);
                });

             **/

        });
    }

    /**
     * @param sideline
     * @param monitors
     * @private
     */
    _injectsMonitor(sideline, monitors) {

        for (let index = 0; monitors.length > index; index++) {
            if (sideline.virtualMonitorReference.monitorId === monitors[index].id) {
                sideline.monitor = monitors[index];
                monitors.splice(index, 0);
                break;
            }
        }

        if (sideline.sidelines.length > 0) {
            for (let cont = 0; sideline.sidelines.length > cont; cont++) {
                this._injectsMonitor(sideline.sidelines[cont], monitors);
            }
        }

        return;
    }

    /**
     *
     * @param mosaic
     * @param resource
     * @private
     */
    _addResourceToMosaic(mosaic, resource) {

    }

    _test() {
        this.ffmpeg = require('fluent-ffmpeg');
        let command = new this.ffmpeg();
        let complexFilter = [];
        let backgroundColor = 'black';
        complexFilter.push(`color=s=${8640}x${90}:c=${backgroundColor} [base0]`);

        command = command.addInput('test/2880x90.mp4');
        command = command.addInput('test/2880x90.mp4');
        command = command.addInput('test/2880x90.mp4');

        complexFilter.push({
            filter: 'setpts=PTS-STARTPTS',
            inputs: `${0}:v`, outputs: `block${0}`
        });

        complexFilter.push({
            filter: 'setpts=PTS-STARTPTS',
            inputs: `${1}:v`, outputs: `block${1}`
        });

        complexFilter.push({
            filter: 'setpts=PTS-STARTPTS',
            inputs: `${2}:v`, outputs: `block${2}`
        });

        complexFilter.push({
            filter: 'overlay', options: { shortest:1, x: 0, y:  0},
            inputs: [`base${0}`, `block${0}`], outputs: `base${1}`
        });

        complexFilter.push({
            filter: 'overlay', options: { shortest:1, x: 2880, y:  0},
            inputs: [`base${1}`, `block${1}`], outputs: `base${2}`
        });

        complexFilter.push({
            filter: 'overlay', options: { shortest:1, x: 5760, y:  0},
            inputs: [`base${2}`, `block${2}`], outputs: `base${3}`
        });
        console.log('COMPLEX FILTER', complexFilter);

        command
            .complexFilter(complexFilter, 'base3')
            .save('test/8640x90.mp4')
            .on('error', function(err) {
                console.log(err.message);
            })
            .on('progress', () =>{console.log('default progress')})
            .on('end', function(data) {
                console.log('ok');
            });

    }

    _testCrop() {
        this.ffmpeg = require('fluent-ffmpeg');
        let command = new this.ffmpeg();
        let complexFilter = [];
        let backgroundColor = 'white';
        complexFilter.push(`color=s=${1920}x${1080}:c=${backgroundColor} [base0]`);

        command = command.addInput('test/test.mp4');

        complexFilter.push({
            filter: 'crop=400:90:0:0',
            inputs: `${0}:v`,
            outputs: `filter${0}`
        });

        complexFilter.push({
            filter: 'overlay',
            options: { shortest:1, x: 100, y:  100},
            inputs: [`base${0}`, `filter${0}`],
            outputs: `overlay${1}`
        });

        console.log('COMPLEX FILTER', complexFilter);
        command
            .complexFilter(complexFilter, 'overlay1')
            .save('test/croptest2.mp4')
            .on('error', function(err) {
                console.log(err.message);
            })
            .on('progress', () =>{console.log('default progress')})
            .on('end', function(data) {
                console.log('finito');
            });
    }
}

module.exports = SidelineResourceGenerator;