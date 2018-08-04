
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
        let offsetX = 660;
        let offsetY = 0;
        let rowProgressWidth = offsetY;
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

        offsetX = 660;
        offsetY = 0;
        rowProgressWidth = offsetY;
        rowProgressHeight = sideline.height;
        index = 0;
        widthSideline = sideline.width;
        while (widthSideline > 0) {

            for (let cont = 0; cont < files.length; cont++) {

                rowProgressWidth = rowProgressWidth + files[cont].dimension.width;

                switch (true) {
                    case monitor.width > rowProgressWidth :

                        complexFilter.push({
                            filter: 'overlay', options: { shortest:1, x: rowProgressWidth - files[cont].dimension.width, y:  rowProgressHeight},
                            inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                        });
                        index++;
                        widthSideline = widthSideline - files[cont].dimension.width;
                        break;
                    case monitor.width <= rowProgressWidth :

                        complexFilter.push({
                            filter: 'overlay', options: { shortest:1, x: rowProgressWidth - files[cont].dimension.width, y:  rowProgressHeight},
                            inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                        });
                        index++;

                        rowProgressHeight = rowProgressHeight + sideline.height;

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

        /*
         widthSideline = sideline.width;
         index = 0;
         let contentOffsetX;
         let contentOffsetY = offsetY;
         while (widthSideline > 0) {

             for (let cont = 0; cont < files.length; cont++) {

                 switch (true) {
                     case monitor.width > offsetX :
                         contentOffsetX = offsetX;
                         offsetX = offsetX + files[cont].dimension.width;
                         break;
                     case monitor.width <= offsetX :
                         contentOffsetY = contentOffsetY + sideline.height;
                         contentOffsetX = offsetX - monitor.width - files[cont].dimension.width;
                         offsetX = contentOffsetX + files[cont].dimension.width;
                         break;
                 }

                 complexFilter.push({
                     filter: 'overlay', options: { shortest:1, x: contentOffsetX, y:  contentOffsetY},
                     inputs: [`base${index}`, `block${index}`], outputs: `base${index+1}`
                 });


                 index ++;
                 widthSideline = widthSideline - files[cont].dimension.width;
             }
         }

         */

        console.log(complexFilter);
/*
        let outFile = 'test/out.mp4';

        command
            .complexFilter(complexFilter, 'base')
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
            */
    }


}

module.exports = SidelineResourceGenerator;