
class SidelineResourceGenerator {

    /**
     *
     */
    constructor() {
        this.ffmpeg = require('fluent-ffmpeg');
    }

    /**
     *
     * @param name
     * @param files
     * @param monitor
     * @param sideline
     * @param options
     */
    generateResource(name, files, monitor, sideline, options = {}) {

        return new Promise((resolve, reject) => {
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
             */
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
             */
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

            let outFile = 'test/out.mp4';

            command
                .complexFilter(complexFilter, 'base'+index)
                .save(outFile)
                .on('error', function(err) {
                    reject(err.message);
                })
                .on('progress', options.progress ? options.progress : () =>{})
                .on('end', function(data) {
                    resolve(data);
                });

        });
    }
}

module.exports = SidelineResourceGenerator;