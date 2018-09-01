/**
 *
 */
class Mosaic {

    /**
     *
     */
    constructor() {

        this.height = 0;
        this.width = 0;

        this.currentXOffset = 0;
        this.currentYOffset = 0;

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
     * @param baseString
     */
    setBaseComplexFilter(baseString) {
        this._complexFilter.base = `${baseString} [base0]`;
    }

    /**
     * @param filter
     * @param target
     */
    appendFilterComplexFilter(filter) {
       // this.complexFilter.push(`[${this._filterIndex}:v] ${filter} [${target}]`);
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

    /**
     * @param sideline
     * @returns {Mosaic}
     */
    initFromMonitor(sideline) {
        this.height = sideline.monitor.height;
        this.width = sideline.monitor.width;

        if (sideline.sidelines && Array.isArray(sideline.sidelines) && sideline.sidelines.length > 0 && sideline.sidelines[0].monitor) {
            this.currentXOffset = sideline.sidelines[0].monitor.offsetY;
            this.currentYOffset = sideline.sidelines[0].monitor.offsetY;
        }
        return this;
    }

    /**
     * @param resource
     * @returns {Mosaic}
     */
    setResource(resource) {
        this.currentResource = resource;
        this.currentResourceXOffset = 0;
        this.currentResourceYOffset = 0;
        return this;
    }
}

module.exports = Mosaic;