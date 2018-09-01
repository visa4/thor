/**
 *
 */
class SidelineMosaic {

    /**
     *
     */
    constructor(sideline) {

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
     * @param {String} baseString
     */
    setBaseComplexFilter(baseString = '') {
        this._complexFilter.base = `${baseString} [base0]`;
    }

    /**
     * @param filter
     * @param target
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
    appendOverlayComplexFilter(startTarget, lastTarget, x, y) {
        this._complexFilter.overlay.push({
            filter: 'overlay',
            options:  { shortest:1, x: x, y:  y},
            inputs: [startTarget, lastTarget],
            outputs: `overlay${this._overlayIndex}`
        });
        this._overlayIndex++;
    }

    attachResource(resource) {

    }
}

module.exports = SidelineMosaic;