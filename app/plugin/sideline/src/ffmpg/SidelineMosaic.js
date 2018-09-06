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
     * @returns {boolean}
     */
    hasNextSideline() {
        return !!this._sideline.sidelines[this._sidelineMonitorIndex + 1];
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
            inputs: [this._overlayIndex !== 0 ? `overlay${this._overlayIndex}` : 'base0', `filter${this._filterIndex - 1}`],
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
        let resourceRemaingWidth = this.currentResource.getWidth();

        while (resourceRemaingWidth > 0 && this._remainingWidth > 0)  {

            let sideline = this.getCurrentSideline();

            switch (true) {

                case this.currentResource.getWidth() >= sideline.monitor.width && sideline.monitor.width < this._sideline.monitor.width:
                    this.consoleLog('CROP AFTER', resourceRemaingWidth);
                    this.inputs.push(this.currentResource);
                    this.appendFilterComplexFilter(`crop=${sideline.monitor.width}:${sideline.monitor.height}:${this.currentYOffset}:${this.currentXOffset}`);
                    this.appendOverlayComplexFilter(this.currentXOffset, this.currentYOffset);

                    if (this.hasNextSideline()) {
                        this._sidelineMonitorIndex++;
                        this.currentYOffset = this.getCurrentSideline().monitor.offsetY;
                        this.currentXOffset = this.getCurrentSideline().monitor.offsetX;
                    }
                    this.currentResourceXOffset += sideline.monitor.width;
                    resourceRemaingWidth -= sideline.monitor.width;
                    this.consoleLog('CROP POST', resourceRemaingWidth);
                    break;

                case resourceRemaingWidth >= sideline.monitor.width:
                case this.currentXOffset + resourceRemaingWidth > sideline.monitor.width:
                    this.consoleLog('SBORDA AFTER', resourceRemaingWidth);
                    this.inputs.push(this.currentResource);
                    this.appendFilterComplexFilter(`setpts=PTS-STARTPTS`);
                    this.appendOverlayComplexFilter(this.currentXOffset, this.currentYOffset);

                    this.currentXOffset -= sideline.monitor.width;
                    this.currentYOffset += this._sideline.height;
                    this.currentResourceXOffset += sideline.monitor.offsetX;
                    resourceRemaingWidth -=  Math.abs(this.currentXOffset);
                    this._sidelineMonitorIndex = this.currentYOffset < (sideline.monitor.height + sideline.monitor.offsetY) ? this._sidelineMonitorIndex : this._sidelineMonitorIndex +1;

                    this.consoleLog('SBORDA POST', resourceRemaingWidth);
                    break;
                case this.getCurrentResourceRemainingWidth() <= sideline.monitor.width:

                    this.consoleLog('RIEMPIRE AFTER', resourceRemaingWidth);
                    this.inputs.push(this.currentResource);
                    this.appendFilterComplexFilter(`setpts=PTS-STARTPTS`);
                    this.appendOverlayComplexFilter(this.currentXOffset - this.currentResourceXOffset, this.currentYOffset);
                    resourceRemaingWidth -= this.getCurrentResourceRemainingWidth();
                    this.currentXOffset += this.getCurrentResourceRemainingWidth();
                    this.currentResourceXOffset += this.getCurrentResourceRemainingWidth();
                    this.consoleLog('RIEMPIRE POST', resourceRemaingWidth);
                    break;
                default:
                    this.consoleLog('DEFAULT', resourceRemaingWidth);
                    break;

            }
        }

        this._remainingWidth = this._remainingWidth - resource.dimension.width;
        console.log('FINISH RESOURCE');
        this.clearCurrentResource();
    }

    consoleLog(name, resourceRemaingWidth) {
        console.group(name);
        console.log('getCurrentResourceRemainingWidth', this.getCurrentResourceRemainingWidth())
        console.log('currentYOffset', this.currentYOffset);
        console.log('currentXOffset', this.currentXOffset);
        console.log('currentResourceXOffset', this.currentResourceXOffset);
        console.log('_sidelineMonitorIndex', this._sidelineMonitorIndex);
        console.log('resourceRemaingWidth', resourceRemaingWidth);
        console.groupEnd();
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
            complexFilter.push(this._complexFilter.filter[cont]);
        }

        for (let cont = 0; this._complexFilter.overlay.length > cont; cont++) {
            complexFilter.push(this._complexFilter.overlay[cont]);
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

    __TEST() {
        // VIDEO FROM IMAGE
        // ffmpeg -loop 1 -t 15 -r 60 -s 1600x90 -i arcobaleno.png  -vcodec libx264 -crf 25 -pix_fmt yuv420p test.mp4
    }
}

module.exports = SidelineMosaic;