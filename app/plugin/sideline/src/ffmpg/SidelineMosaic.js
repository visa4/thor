/**
 *
 */
class SidelineMosaic {

    /**
     *
     */
    constructor(sideline, resourceHydrator) {

        this.ffmpeg = require('fluent-ffmpeg');
        this.hidrator = resourceHydrator;
        this._sideline = sideline;
        this._sidelineMonitorIndex = 0;
        this._remainingWidth = sideline.width;

        this.currentXOffset = 0;
        this.currentYOffset = 0;
        if (sideline.sidelines && Array.isArray(sideline.sidelines) && sideline.sidelines.length > 0 && sideline.sidelines[0].monitor) {
            this.currentXOffset = sideline.sidelines[0].monitor.offsetX;
            this.currentYOffset = sideline.sidelines[0].monitor.offsetY;
        }

        this.currentResource = null;
        this.currentResourceXOffset = 0;
        this.currentResourceYOffset = 0;

        this.inputs = [];

        this._complexFilter = {
            base : null,
            filter : [],
            overlay :[]
        };

        this._filterIndex = 0;
        this._overlayIndex = 0;
    }

    /**
     * @returns {Number}
     */
    getHeight() {
        return this._sideline.monitor.height;
    }

    /**
     * @returns {Number}
     */
    getWidth() {
        return this._sideline.monitor.width;
    }

    /**
     * @returns {Number}
     */
    getRemainingWidth() {
        return this._remainingWidth;
    }

    /**
     * @returns {null}
     */
    getCurrentSideline() {
        return this._sideline.sidelines[this._sidelineMonitorIndex] ? this._sideline.sidelines[this._sidelineMonitorIndex] : null;
    }

    /**
     * @param {String} baseString
     */
    setBaseComplexFilter(baseString = '') {
        this._complexFilter.base = `${baseString} [base0]`;
    }

    /**
     * @param filter
     */
    appendFilterComplexFilter(filter) {
        this._complexFilter.filter.push({
            filter: filter,
            inputs: `${this._filterIndex}:v`,
            outputs: `filter${this._filterIndex}`
        });
        this._filterIndex++;
    }

    /**
     * @param startTarget
     * @param lastTarget
     * @param x
     * @param y
     */
    appendOverlayComplexFilter(x, y) {
        this._complexFilter.overlay.push({
            filter: 'overlay',
            options:  { shortest:1, x: x, y:  y},
            inputs: [this._filterIndex === 0 ? `overlay${this._overlayIndex}` : 'base0', `filter${this._filterIndex - 1}`],
            outputs: `overlay${this._overlayIndex + 1}`
        });
        this._overlayIndex++;
    }

    /**
     * @param resource
     * @returns {SidelineMosaic}
     */
    setCurrentResource(resource) {
        this.currentResource = this.hidrator.hydrate(resource);
        this.currentResourceXOffset = 0;
        this.currentResourceYOffset = 0;
        return this;
    }

    /**
     * @returns {Number|null}
     */
    getCurrentResourceRemainingWidth() {
        let remainingWidth = null;
        if (this.currentResource) {
            remainingWidth = this.currentResource.getWidth() - this.currentResourceXOffset;
        }

        return remainingWidth;
    }

    /**
     * @returns {SidelineMosaic}
     */
    clearCurrentResource() {
        this.currentResource = null;
        this.currentResourceXOffset = 0;
        this.currentResourceYOffset = 0;
        return this;
    }

    /**
     * @param resource
     */
    addResource(resource) {

        this.setCurrentResource(resource);
        let widthResource = this.currentResource.getWidth();

        while (widthResource > 0)  {

            let sideline = this.getCurrentSideline();
           // this.inputs.push(resource);


            switch (true) {

                case sideline != null && this.currentResource.getWidth() >= sideline.monitor.width && sideline.monitor.width < this._sideline.monitor.width:

                    this.inputs.push(this.currentResource);
                    this.appendFilterComplexFilter(`crop=${sideline.monitor.width}:${sideline.monitor.height}:${this.currentYOffset}:${this.currentXOffset}`);
                    this.appendOverlayComplexFilter(this.currentXOffset, this.currentYOffset);
                    console.group('CROP');
                    // TODO ADD INPUT
                    this._sidelineMonitorIndex++;
                    this.currentYOffset =  sideline.monitor.offsetY;
                    this.currentXOffset = sideline.monitor.offsetX;
                    this.currentResourceXOffset = this.currentResourceXOffset + sideline.monitor.width;
                    widthResource = widthResource - sideline.monitor.width;
                    break;
                case this.getCurrentResourceRemainingWidth() >= sideline.width:
                   // this.inputs.push(this.currentResource);
                    console.group('SBORDA');
                    this.currentYOffset = this.currentYOffset + this._sideline.height;
                    this.currentXOffset = sideline.monitor.offsetX;
                    this.currentResourceXOffset = this.currentResourceXOffset + sideline.monitor.offsetX;
                    widthResource = widthResource - sideline.monitor.width;
                    this._sidelineMonitorIndext = this.currentYOffset < sideline.monitor.height + sideline.monitor.offsetY;

                    break;
                case this.getCurrentResourceRemainingWidth() < sideline.width:
                   // this.inputs.push(this.currentResource);
                    console.group('RIEMPIRE');
                    this.currentXOffset = sideline.monitor.offsetX;
                    widthResource = widthResource - this.getCurrentResourceRemainingWidth();


                    break;
                default:
                    console.group('DEFAULT');
                    break;

            }

            console.log('RESOURCE REMAING WIDTH', this.getCurrentResourceRemainingWidth())
            console.log('OFFSET X', this.currentYOffset);
            console.log('OFFSET Y', this.currentXOffset);
            console.log('RESOURCE OFFSET X', this.currentResourceXOffset);
            console.log('NEXT', this._sidelineMonitorIndex);
            console.groupEnd();
        }

        this._remainingWidth = this._remainingWidth - resource.dimension.width;
        console.log('FINISH RESOURCE');
        this.clearCurrentResource();
    }

    /**
     *
     */
    generateVideo(name) {

        let command = new this.ffmpeg();
        let complexFilter = [];

        for (let cont = 0; this.inputs.length > cont; cont++) {
            command.addInput(this.inputs[cont].getPath());
        }

        complexFilter.push(this._complexFilter.base);

        for (let cont = 0; this._complexFilter.filter.length > cont; cont++) {
            complexFilter.push(this._complexFilter.filter[0]);
        }

        for (let cont = 0; this._complexFilter.overlay.length > cont; cont++) {
            complexFilter.push(this._complexFilter.overlay[0]);
        }

        console.log('COMPLEX FILTER', complexFilter);

        command
            .complexFilter(complexFilter, `overlay${this._overlayIndex}`)
            .save(`test/${name}.mp4`)
            .on('error', function(err) {
                console.log(err.message);
            })
            .on('progress', () =>{console.log('default progress')})
            .on('end', function(data) {
                console.log('ok');
            });
    }
}

module.exports = SidelineMosaic;