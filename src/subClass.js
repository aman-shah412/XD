import * as fabric from "fabric";

class ArtboardSubclass extends fabric.Rect {
    constructor(options = {}) {
        super(options);

        // this.type = "artboard";
        this.label = options.label || "Artboard";
        this.children = [];

        this.labelled = new fabric.IText(this.label, {
            fontSize: 30,
            fill: "black",
            textAlign: "center",
            originX: "left",
            originY: "bottom",
            selectable: false,
            evented: true,
            editable: true,
            hasControls: false,
            hasBorders: false,
            hoverCursor: "text",
            moveCursor: "text",
        });

        this.updateLabelPosition();
        this.attachEvents();
    }

    updateLabelPosition() {
        if (this.labelled) {
            this.labelled.set({
                left: this.left,
                top: this.top,
            });
            this.labelled.setCoords();
        }
    }

    updateArtboardPosition() {
        const deltaX = this.labelled.left - this.left;
        const deltaY = this.labelled.top - this.top;

        this.set({
            left: this.labelled.left,
            top: this.labelled.top,
        });

        this.children.forEach(child => {
            child.set({
                left: child.left + deltaX,
                top: child.top + deltaY
            });
            child.clipPath.set({
                left: this.labelled.left,
                top: this.labelled.top,
            });
            child.setCoords();
            child.clipPath.setCoords();
        });

        this.setCoords();
    }

    set(key, value) {
        super.set(key, value);
        this.updateLabelPosition();
    }

    attachEvents() {
        this.on("moving", () => this.updateLabelPosition());
        this.labelled.on("moving", () => this.updateArtboardPosition());
    }

    addTo(canvas) {
        canvas.add(this);
        canvas.add(this.labelled);
    }

    addChild(child) {
        if (!this.children.includes(child)) {
            this.children.push(child);
        }
        child.artboardParent = this;

        if (this.children.length > 0) {
            this.selectable = false
        }
    }

    removeChild(child) {
        this.children = this.children.filter(c => c !== child);
        delete child.artboardParent;

        if (this.children.length < 1) {
            this.selectable = true
        }
    }

    toObject() {
        return {
            ...super.toObject(),
            label: this.label,
            children: this.children.map(child => child.toObject()),
        };
    }

}

export const Artboard = ArtboardSubclass