import BoardLayout from "./Board/BoardLayout.js";
import LED from "../LED.js";

export default class LayoutMapper {
    /** @type {SourceLayout[]} */ sourceLayouts= [];
    /** @type {BoardLayout} */ boardLayout;

    /**
     * @param {SourceLayout[]} sourceLayouts
     */
    constructor(sourceLayouts = []) {
        for (let sourceLayout of sourceLayouts) {
            this.addSourceLayout(sourceLayout);
        }
    }

    /**
     * @param {SourceLayout} sourceLayout
     */
    addSourceLayout(sourceLayout) {
        if (!sourceLayout.is2D()) {
            throw new Error('Only 2D layouts are supported');
        }
        this.sourceLayouts.push(sourceLayout);
    }

    /**
     * @param {TargetLayout} targetLayout
     * @return {BoardLayout}
     */
    map(targetLayout) {
        this.boardLayout = new BoardLayout();

        // start with active source coordinates
        let activeSourceCoordinates = this.getActiveSourceCoordinates();

        // sort from left to right
        activeSourceCoordinates = this.sortCoordinatesX(activeSourceCoordinates);
        for (let column of targetLayout.getColumns()) {
            let x = column.getX();

            // get the leftmost active source coordinates that should match this column
            let columnCoordinates = activeSourceCoordinates.splice(0, column.getYs().length);

            // sort them from bottom to top
            this.sortCoordinatesY(columnCoordinates);

            // match source coordinates to target column
            for (let i = 0; i < columnCoordinates.length; i++) {
                let sourceCoordinates = columnCoordinates[i];
                let y = column.getYs()[i];
                let led = LED.fromSourceCoordinates(sourceCoordinates).setX(x).setY(y);
                this.boardLayout.addLED(led);
            }
        }

        // add back inactive source coordinates
        for (let sourceCoordinates of this.getInactiveSourceCoordinates()) {
            let led = LED.fromSourceCoordinates(sourceCoordinates);
            this.boardLayout.addLED(led);
        }

        this.boardLayout.index();
        return this.boardLayout;
    }

    /**
     * @protected
     * @return {SourceCoordinates[]}
     */
    getActiveSourceCoordinates() {
        let activeSourceCoordinates = [];
        for (let sourceLayout of this.sourceLayouts) {
            activeSourceCoordinates.push(...sourceLayout.getActiveCoordinates());
        }
        return activeSourceCoordinates;
    }

    /**
     * @protected
     * @return {SourceCoordinates[]}
     */
    getInactiveSourceCoordinates() {
        let inactiveSourceCoordinates = [];
        for (let sourceLayout of this.sourceLayouts) {
            inactiveSourceCoordinates.push(...sourceLayout.getInactiveCoordinates());
        }
        return inactiveSourceCoordinates;
    }

    /**
     * @param {SourceCoordinates[]} coordinates
     * @return {SourceCoordinates[]}
     */
    sortCoordinatesX(coordinates) {
        return coordinates.sort((a, b) => {
            return a.getX() - b.getX();
        });
    }

    /**
     * @param {SourceCoordinates[]} coordinates
     * @return {SourceCoordinates[]}
     */
    sortCoordinatesY(coordinates) {
        return coordinates.sort((a, b) => {
            return a.getY() - b.getY();
        });
    }
}