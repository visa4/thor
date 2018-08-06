
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
    generateResource(name, files, monitor, sideline, options = {autoFill:true}) {

        let command = new this.ffmpeg();
        let complexFilter = [];
        let backgroundColor = options.backgroundColor ? options.backgroundColor : 'black';
        complexFilter.push(`color=s=${monitor.width}x${monitor.height}:c=${backgroundColor} [base0]`);
        // TODO CONTROLL

        // TODO Extrat to polygon of monitor

        let rowProgressWidth = 600;
        let rowProgressHeight = sideline.height;
        let index = 0;
        let widthSideline = sideline.width;

        while (widthSideline > 0) {

            for (let cont = 0; cont < files.length; cont++) {

                rowProgressWidth = rowProgressWidth + files[cont].dimension.width;

                switch (true) {
                    case monitor.width > rowProgressWidth :
                        command = command.addInput(files[cont].location.path + files[cont].location.name);
                        complexFilter.push({
                            filter: 'setpts=PTS-STARTPTS',
                            inputs: `${index}:v`, outputs: `block${index}`
                        });
                        index++;
                        widthSideline = widthSideline - files[cont].dimension.width;
                        break;
                    case monitor.width <= rowProgressWidth :
                        command = command.addInput(files[cont].location.path + files[cont].location.name);
                        complexFilter.push({
                            filter: 'setpts=PTS-STARTPTS',
                            inputs: `${index}:v`, outputs: `block${index}`
                        });
                        index++;

                        command = command.addInput(files[cont].location.path + files[cont].location.name);
                        complexFilter.push({
                            filter: 'setpts=PTS-STARTPTS',
                            inputs: `${index}:v`, outputs: `block${index}`
                        });
                        index++;
                        rowProgressWidth = rowProgressWidth - monitor.width;
                        widthSideline = widthSideline - files[cont].dimension.width;
                        break;
                }
            }
        }

        let offsetX = 0;
        rowProgressWidth = 600;
        rowProgressHeight = 0;
        index = 0;
        widthSideline = sideline.width;
        while (widthSideline > 0) {

            for (let cont = 0; cont < files.length; cont++) {

                rowProgressWidth = rowProgressWidth + files[cont].dimension.width;

                switch (true) {
                    case monitor.width > rowProgressWidth :
                        offsetX = rowProgressWidth - files[cont].dimension.width;
                        console.group('MAX');
                        console.log('INDEX', index);
                        console.log('OFFESET', offsetX);
                        console.log('ROW PROGRESS', rowProgressWidth);
                        console.log('ROW PROGRESS HEIGHT', rowProgressHeight);
                        console.groupEnd();
                        complexFilter.push({
                            filter: 'overlay', options: { shortest:1, x: offsetX, y:  rowProgressHeight},
                            inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                        });
                        index++;
                        widthSideline = widthSideline - files[cont].dimension.width;
                        break;
                    case monitor.width <= rowProgressWidth :

                        offsetX = rowProgressWidth - files[cont].dimension.width;
                        console.group('MIN 1');
                        console.log('INDEX', index);
                        console.log('OFFESET', offsetX);
                        console.log('ROW PROGRESS', rowProgressWidth);
                        console.log('ROW PROGRESS HEIGHT', rowProgressHeight);
                        console.groupEnd();
                        complexFilter.push({
                            filter: 'overlay', options: { shortest:1, x: offsetX, y:  rowProgressHeight},
                            inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                        });

                        index++;
                        rowProgressHeight = rowProgressHeight + sideline.height;
                        offsetX = monitor.width - (offsetX + files[cont].dimension.width);
                        console.group('MIN 2');
                        console.log('INDEX', index);
                        console.log('OFFESET', offsetX);
                        console.log('ROW PROGRESS WIDTH', rowProgressWidth);
                        console.log('ROW PROGRESS HEIGHT', rowProgressHeight);
                        console.groupEnd();
                        complexFilter.push({
                            filter: 'overlay', options: { shortest:1, x: rowProgressWidth - files[cont].dimension.width, y:  rowProgressHeight},
                            inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                        });

                        index++;
                        rowProgressWidth = rowProgressWidth - monitor.width;
                        widthSideline = widthSideline - files[cont].dimension.width;
                        break;
                }
            }
        }

        console.log(complexFilter);

        let outFile = 'test/out.mp4';

        command
            .complexFilter(complexFilter, 'base'+index)
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


}

module.exports = SidelineResourceGenerator;