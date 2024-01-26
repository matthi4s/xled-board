import TargetLayoutRectangle from "./TargetLayoutRectangle.js";
import TargetColumn from "./TargetColumn.js";

export default class TargetLayout {
    /** @type {TargetLayoutRectangle[]} */ rectangles;
    /** @type {TargetColumn[]} */ columns;

    /**
     * @param {TargetLayout|{x?: number, y?: number, width: number, height: number}|{x?: number, y?: number, width: number, height: number}[]} rectangles
     * @return {TargetLayout}
     */
    static fromArrayOrObject(rectangles) {
        if (rectangles instanceof TargetLayout) {
            return rectangles;
        }
        if (Array.isArray(rectangles)) {
            return new TargetLayout(rectangles.map(TargetLayoutRectangle.fromObject));
        }
        return new TargetLayout([TargetLayoutRectangle.fromObject(rectangles)]);
    }

    /**
     * @param {TargetLayoutRectangle[]} rectangles
     */
    constructor(rectangles) {
        this.rectangles = rectangles;
        this.createColumns();
    }

    /**
     * @protected
     */
    createColumns() {
        this.columns = [];
        for (let rectangle of this.rectangles) {
            for (let x = rectangle.getX(); x < rectangle.getMaxX(); x++) {
                let column = this.findColumn(x);
                if (!column) {
                    column = new TargetColumn(x);
                    this.columns.push(column);
                }
                for (let y = rectangle.getY(); y < rectangle.getMaxY(); y++) {
                    column.addY(y);
                }
            }
        }
        this.sortColumns();
    }

    /**
     * @protected
     * @param {number} x
     * @return {TargetColumn|null}
     */
    findColumn(x) {
        for (let column of this.columns) {
            if (column.getX() === x) {
                return column;
            }
        }
        return null;
    }

    /**
     * @protected
     */
    sortColumns() {
        this.columns.sort((a, b) => a.getX() - b.getX());
        this.columns.forEach(column => column.sortYs());
    }

    /**
     * @return {TargetColumn[]}
     */
    getColumns() {
        return this.columns;
    }
}