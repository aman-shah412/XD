import React, { useRef, useState, useEffect } from 'react'
import { FaUndoAlt, FaRedoAlt, FaPlus, FaMinus, FaRegSquare, FaRegCircle, FaSlash, FaLayerGroup } from "react-icons/fa";
import { FaArrowPointer, FaRegKeyboard } from "react-icons/fa6";
import { BiText } from "react-icons/bi";
import { TbZoomReset } from "react-icons/tb";
import { RiShapesLine } from "react-icons/ri";
import { IoCloudUploadOutline } from "react-icons/io5";
import { LuBrain } from "react-icons/lu";
import { FiTriangle } from "react-icons/fi";
import "../appCSS/instagram.css"
import "../appCSS/layerspanel.css"
import "../appCSS/propertypanel.css"
import * as fabric from "fabric";
import { Artboard } from "../subClass";
import LayersPanel from '../components/LayersPanel';
import ProperyPanel from '../components/ProperyPanel';

function Instagram() {

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const tempShape = useRef(null);

    const [canvas, setCanvas] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0.8);
    const [artBoardArray, setArtBoardArray] = useState([]);
    const [artBoard, setArtBoard] = useState(null);
    const [expand, setExpand] = useState(true);
    const [needToShift, setNeedToShift] = useState(false);
    const [shifted, setShifted] = useState(false);
    const [shapeType, setShapeType] = useState("");
    const [activeElement, setActiveElement] = useState(null)

    let startPos
    let endPos
    let dragStarted = false;
    let artboardsBound = []
    let inWhichArtboard = null
    let snappedEdge = null
    let snapThreshold = 10

    useEffect(() => {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth,
            height: window.innerHeight,
            preserveObjectStacking: true,
            perPixelTargetFind: true,
            // selectionFullyContained: true
        });

        setCanvas(fabricCanvas);
        setShapeType("CURSOR")
        createWhiteBoard(fabricCanvas)

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    useEffect(() => {
        if (canvas) {
            canvas.on('mouse:wheel', handleWheel);
            canvas.on('after:render', checkArtboardPosition);
        }

        return () => {
            if (canvas) {
                canvas.off('mouse:wheel', handleWheel);
                canvas.off('after:render', checkArtboardPosition);
            }
        };
    }, [zoomLevel])

    useEffect(() => {
        if (canvas) {
            canvas.on("mouse:down", handleDrawingStart)
            canvas.on("mouse:move", handleDrawing)
            canvas.on("mouse:up", handleDrawingEnd)
            canvas.on("object:moving", handleDragging)
            canvas.on("object:rotating", handleModification)
            canvas.on("object:scaling", handleModification)
            canvas.on("selection:created", handleSelectionCreated)
        }

        return () => {
            if (canvas) {
                canvas.off("mouse:down", handleDrawingStart)
                canvas.off("mouse:move", handleDrawing)
                canvas.off("mouse:up", handleDrawingEnd)
                canvas.off("object:moving", handleDragging)
                canvas.off("object:rotating", handleModification)
                canvas.off("object:scaling", handleModification)
                canvas.off("selection:created", handleSelectionCreated)
            }
        }
    }, [shapeType])


    const handleDrawingStart = (o) => {
        if (isDrawingRef.current) {
            tempShape.current = createTempShape(startPos)
            canvas.add(tempShape.current);
        } else {
            const activeSelection = canvas.getActiveObject();

            if (activeSelection && activeSelection?.type === 'activeselection') {
                setActiveElement("multiple")
            } else if (!activeSelection) {
                setActiveElement(null)
            } else {
                if (activeSelection.name.includes("artboard")) {
                    setActiveElement("artboard")
                } else {
                    setActiveElement(activeSelection.name)
                }
            }
        }
    }

    const handleDrawing = (o) => {
        canvas.getObjects().forEach((obj) => {
            if (obj.name === "guide_line") {
                canvas.remove(obj);
            }
        });
        if (isDrawingRef.current && !tempShape.current) {
            startPos = canvas.getPointer(o.e)
            const objects = getAllObjectsAtPointer(startPos).filter(obj => obj.name === "artboard").reverse();
            if (objects.length && objects[0]?.name.includes("artboard")) {
                inWhichArtboard = objects[0]
            } else {
                inWhichArtboard = null
            }

            if (inWhichArtboard) {
                // inWhichArtboard.set({selectable: false})
                const cardClientRect = inWhichArtboard.getBoundingRect();

                var snapToLeft = Math.abs(startPos.x - cardClientRect.left) < snapThreshold
                var snapToRight = Math.abs(startPos.x - (cardClientRect.left + cardClientRect.width)) < snapThreshold
                var snapToTop = Math.abs(startPos.y - cardClientRect.top) < snapThreshold
                var snapToBottom = Math.abs(startPos.y - (cardClientRect.top + cardClientRect.height)) < snapThreshold;
                var snapToCenterX = Math.abs(startPos.x - (cardClientRect.left + (cardClientRect.width / 2))) < snapThreshold;
                var snapToCenterY = Math.abs(startPos.y - (cardClientRect.top + (cardClientRect.height / 2))) < snapThreshold;


                if (snapToLeft) {
                    snappedEdge = "left"
                    startPos = { x: cardClientRect.left, y: startPos.y };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                } else if (snapToRight) {
                    snappedEdge = "right"
                    startPos = { x: cardClientRect.left + cardClientRect.width, y: startPos.y };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }

                if (snapToTop) {
                    snappedEdge = "top"
                    startPos = { x: startPos.x, y: cardClientRect.top };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                } else if (snapToBottom) {
                    snappedEdge = "bottom"
                    startPos = { x: startPos.x, y: cardClientRect.top + cardClientRect.height };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }

                if (snapToCenterX) {
                    snappedEdge = "centerX"
                    startPos = { x: cardClientRect.left + (cardClientRect.width / 2), y: startPos.y };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }
                if (snapToCenterY) {
                    snappedEdge = "centerY"
                    startPos = { x: startPos.x, y: cardClientRect.top + (cardClientRect.height / 2) };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }

                if (snapToLeft && snapToTop) {
                    snappedEdge = "top-left"
                    startPos = { x: cardClientRect.left, y: cardClientRect.top };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }
                if (snapToRight && snapToTop) {
                    snappedEdge = "top-right"
                    startPos = { x: cardClientRect.left + cardClientRect.width, y: cardClientRect.top };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }
                if (snapToRight && snapToBottom) {
                    snappedEdge = "bottom-right"
                    startPos = { x: cardClientRect.left + cardClientRect.width, y: cardClientRect.top + cardClientRect.width };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }
                if (snapToLeft && snapToBottom) {
                    snappedEdge = "bottom-left"
                    startPos = { x: cardClientRect.left, y: cardClientRect.top + cardClientRect.width };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }
                if (snapToCenterX && snapToCenterY) {
                    snappedEdge = "centerX-centerY"
                    startPos = { x: cardClientRect.left + (cardClientRect.width / 2), y: cardClientRect.top + (cardClientRect.height / 2) };
                    drawGuideLine(inWhichArtboard, snappedEdge)
                }
            }
        }

        if (isDrawingRef.current && tempShape.current) {
            endPos = canvas.getPointer(o.e);
            const shiftPressed = o.e.shiftKey;

            if (inWhichArtboard) {
                const cardClientRect = inWhichArtboard.getBoundingRect();
                let tempClientRect

                const drawingDirection = {
                    left: endPos.x < startPos.x,
                    right: endPos.x > startPos.x,
                    top: endPos.y < startPos.y,
                    bottom: endPos.y > startPos.y,
                };

                let tempWidth = Math.abs(endPos.x - startPos.x);
                let tempHeight = Math.abs(endPos.y - startPos.y);
                if (shiftPressed) {
                    if (shapeType === "TRIANGLE") {
                        const size = Math.min(tempWidth, tempHeight * (2 / Math.sqrt(3)));
                        tempWidth = size;
                        tempHeight = (Math.sqrt(3) / 2) * size
                    } else {
                        const size = Math.min(tempWidth, tempHeight);
                        tempWidth = tempHeight = size;
                    }
                }

                tempClientRect = {
                    left: startPos.x < endPos.x ? Math.min(startPos.x, endPos.x) : Math.max(startPos.x, endPos.x),
                    top: startPos.y < endPos.y ? Math.min(startPos.y, endPos.y) : Math.max(startPos.y, endPos.y),
                    width: tempWidth,
                    height: tempHeight,
                };

                var snapToLeft = drawingDirection.left && Math.abs((tempClientRect.left - tempClientRect.width) - cardClientRect.left) < snapThreshold
                var snapToRight = drawingDirection.right && Math.abs((tempClientRect.left + tempClientRect.width) - (cardClientRect.left + cardClientRect.width)) < snapThreshold
                var snapToTop = drawingDirection.top && Math.abs((tempClientRect.top - tempClientRect.height) - cardClientRect.top) < snapThreshold
                var snapToBottom = drawingDirection.bottom && Math.abs((tempClientRect.top + tempClientRect.height) - (cardClientRect.top + cardClientRect.height)) < snapThreshold;
                var snapLeftToRightCenterX = drawingDirection.right && Math.abs((tempClientRect.left + tempClientRect.width) - (cardClientRect.left + (cardClientRect.width / 2))) < snapThreshold;
                var snapTopToBottomCenterY = drawingDirection.bottom && Math.abs((tempClientRect.top + tempClientRect.height) - (cardClientRect.top + (cardClientRect.height / 2))) < snapThreshold;
                var snapRightToLeftCenterX = drawingDirection.left && Math.abs((tempClientRect.left - tempClientRect.width) - (cardClientRect.left + (cardClientRect.width / 2))) < snapThreshold;
                var snapBottomToTopCenterY = drawingDirection.top && Math.abs((tempClientRect.top - tempClientRect.height) - (cardClientRect.top + (cardClientRect.height / 2))) < snapThreshold;

                if ((snappedEdge === null || !snappedEdge.includes("left")) && snapToLeft) {
                    endPos = { x: cardClientRect.left, y: endPos.y };
                    drawGuideLine(inWhichArtboard, "left")
                } else if ((snappedEdge === null || !snappedEdge.includes("right")) && snapToRight) {
                    endPos = { x: cardClientRect.left + cardClientRect.width, y: endPos.y };
                    drawGuideLine(inWhichArtboard, "right")
                }

                if ((snappedEdge === null || !snappedEdge.includes("top")) && snapToTop) {
                    endPos = { x: endPos.x, y: cardClientRect.top };
                    drawGuideLine(inWhichArtboard, "top")
                } else if ((snappedEdge === null || !snappedEdge.includes("bottom")) && snapToBottom) {
                    endPos = { x: endPos.x, y: cardClientRect.top + cardClientRect.height };
                    drawGuideLine(inWhichArtboard, "bottom")
                }

                if ((snappedEdge === null || !snappedEdge.includes("centerX")) && (snapLeftToRightCenterX || snapRightToLeftCenterX)) {
                    endPos = { x: cardClientRect.left + (cardClientRect.width / 2), y: endPos.y };
                    drawGuideLine(inWhichArtboard, "centerX")
                }
                if ((snappedEdge === null || !snappedEdge.includes("centerY")) && (snapTopToBottomCenterY || snapBottomToTopCenterY)) {
                    endPos = { x: endPos.x, y: cardClientRect.top + (cardClientRect.height / 2) };
                    drawGuideLine(inWhichArtboard, "centerY")
                }

            } else {

            }

            updateTempShape(endPos, shiftPressed);
            canvas.requestRenderAll()
        }
    }

    const handleDrawingEnd = () => {
        if (isDrawingRef.current) {

            const squareBounds = tempShape.current.getBoundingRect();
            const cardNodes = canvas.getObjects().filter(obj => obj.name === "artboard").reverse();

            const doRectanglesOverlap = (rect1, rect2) => {
                return (
                    rect1.left < rect2.left + rect2.width &&
                    rect1.left + rect1.width > rect2.left &&
                    rect1.top < rect2.top + rect2.height &&
                    rect1.top + rect1.height > rect2.top
                );
            };

            for (const cardNode of cardNodes) {
                const cardBounds = cardNode.getBoundingRect();

                if (doRectanglesOverlap(squareBounds, cardBounds)) {
                    inWhichArtboard = cardNode;
                    break;
                }
            }

            if (inWhichArtboard) {
                tempShape.current.clipPath = new fabric.Rect({
                    left: inWhichArtboard.left,
                    top: inWhichArtboard.top,
                    width: inWhichArtboard.width,
                    height: inWhichArtboard.height,
                    absolutePositioned: true
                })
                inWhichArtboard.addChild(tempShape.current)
            }

            tempShape.current.setCoords();
            tempShape.current = null
        } else {
            const activeSelection = canvas.getActiveObject();

            if (activeSelection && activeSelection?.type === 'activeselection') {
                setActiveElement("multiple")
            } else if (!activeSelection) {
                setActiveElement(null)
            } else {
                if (activeSelection.name.includes("artboard")) {
                    setActiveElement("artboard")
                } else {
                    setActiveElement(activeSelection.name)
                }
            }
        }

        if (dragStarted) {
            dragStarted = false
        }
    }

    function createTempShape(startPoint) {
        switch (shapeType) {
            case "SQUARE":
                return new fabric.Rect({
                    left: startPoint.x,
                    top: startPoint.y,
                    width: 0,
                    height: 0,
                    fill: '#000000',
                    stroke: 'black',
                    strokeWidth: 1,
                    name: "shape",
                    snapAngle: 30,
                    snapThreshold: 5,
                    cornerStyle: 'circle',
                    borderColor: 'blue',
                    cornerColor: 'white',
                    cornerStrokeColor: 'blue',
                    borderScaleFactor: 2,
                    transparentCorners: false,
                });
            case "CIRCLE":
                return new fabric.Ellipse({
                    left: startPoint.x,
                    top: startPoint.y,
                    rx: 0,
                    ry: 0,
                    fill: '#000000',
                    stroke: 'black',
                    strokeWidth: 1,
                    originX: 'center',
                    originY: 'center',
                    name: "shape",
                    snapAngle: 30,
                    snapThreshold: 5,
                    cornerStyle: 'circle',
                    borderColor: 'blue',
                    cornerColor: 'white',
                    cornerStrokeColor: 'blue',
                    borderScaleFactor: 2,
                    transparentCorners: false,
                });
            case "TRIANGLE":
                return new fabric.Triangle({
                    left: startPoint.x,
                    top: startPoint.y,
                    width: 0,
                    height: 0,
                    fill: '#000000',
                    stroke: 'black',
                    strokeWidth: 1,
                    name: "shape",
                    snapAngle: 30,
                    snapThreshold: 5,
                    cornerStyle: 'circle',
                    borderColor: 'blue',
                    cornerColor: 'white',
                    cornerStrokeColor: 'blue',
                    borderScaleFactor: 2,
                    transparentCorners: false,
                });
            default:
                null
        }
    }

    function updateTempShape(endPos, shiftPressed) {
        switch (shapeType) {
            case "SQUARE":
                let width = Math.abs(endPos.x - startPos.x);
                let height = Math.abs(endPos.y - startPos.y);

                if (shiftPressed) {
                    const size = Math.min(width, height);
                    width = height = size;
                }

                tempShape.current.set({
                    width: width,
                    height: height,
                    left: startPos.x + (endPos.x > startPos.x ? 0 : -width),
                    top: startPos.y + (endPos.y > startPos.y ? 0 : -height)
                });
                tempShape.current.setCoords()
                break;
            case "CIRCLE":
                let rx = Math.abs(endPos.x - startPos.x) / 2;
                let ry = Math.abs(endPos.y - startPos.y) / 2;

                if (shiftPressed) {
                    const radius = Math.min(rx, ry);
                    rx = ry = radius;
                }

                tempShape.current.set({
                    rx: rx,
                    ry: ry,
                    left: startPos.x + (endPos.x > startPos.x ? rx : -rx),
                    top: startPos.y + (endPos.y > startPos.y ? ry : -ry)
                });
                tempShape.current.setCoords()
                break;
            case "TRIANGLE":
                let triangleWidth = Math.abs(endPos.x - startPos.x);
                let triangleHeight = Math.abs(endPos.y - startPos.y);

                if (shiftPressed) {
                    const size = Math.min(triangleWidth, triangleHeight * (2 / Math.sqrt(3)));
                    triangleWidth = size;
                    triangleHeight = (Math.sqrt(3) / 2) * size
                }

                tempShape.current.set({
                    width: triangleWidth,
                    height: triangleHeight,
                    left: startPos.x + (endPos.x > startPos.x ? 0 : -triangleWidth),
                    top: startPos.y + (endPos.y > startPos.y ? 0 : -triangleHeight)
                });
                tempShape.current.setCoords()
                break;
            default:
                break;
        }
    }

    const handleDragging = (o) => {
        let target = o.target
        let activeObjects = canvas.getActiveObjects()
        let cursorPos = o.pointer

        if (activeObjects.some(obj => obj.name === "artboard" || obj.name === "artboard_title")) {
            activeObjects = activeObjects.filter(obj => obj.name !== "artboard" && obj.name !== "artboard_title")
            activeObjects.forEach((element) => {
                element.clipPath = new fabric.Rect({
                    left: target.left + element.left,
                    top: target.top + element.top,
                    width: target.width + element.getScaledWidth(),
                    height: target.height + element.getScaledHeight(),
                    absolutePositioned: true
                })
                element?.artboardParent?.removeChild(element)
            })
            return;
        }


        if (!dragStarted) {
            let artboards = canvas.getObjects().filter(obj => obj.name === "artboard").reverse();
            dragStarted = true

            artboardsBound = artboards.map((boards) => {
                const artboardRect = boards.getBoundingRect();

                const adjustedLeft = (artboardRect.left);
                const adjustedTop = (artboardRect.top);
                const adjustedWidth = artboardRect.width;
                const adjustedHeight = artboardRect.height;

                return { board: boards, left: adjustedLeft, top: adjustedTop, width: adjustedWidth, height: adjustedHeight }
            })
        }

        for (let boardsBound of artboardsBound) {
            const isInsideArtboard = cursorPos.x >= boardsBound.left &&
                cursorPos.x <= boardsBound.left + boardsBound.width &&
                cursorPos.y >= boardsBound.top &&
                cursorPos.y <= boardsBound.top + boardsBound.height;

            if (isInsideArtboard) {
                inWhichArtboard = boardsBound
                break
            } else {
                inWhichArtboard = null
            }
        }

        activeObjects.forEach((element) => {
            if (inWhichArtboard) {
                element.clipPath = new fabric.Rect({
                    left: inWhichArtboard.left,
                    top: inWhichArtboard.top,
                    width: inWhichArtboard.width,
                    height: inWhichArtboard.height,
                    absolutePositioned: true
                })
                inWhichArtboard.board.addChild(element)
            } else {
                let bounds = element.getBoundingRect()
                element.clipPath = new fabric.Rect({
                    left: bounds.left,
                    top: bounds.top,
                    width: bounds.width,
                    height: bounds.height,
                    absolutePositioned: true,
                })
                element?.artboardParent?.removeChild(element)
            }
            canvas.requestRenderAll();
        })
    }

    const handleModification = (o) => {
        let target = o.target
        let activeObjects = canvas.getActiveObjects()
        activeObjects.forEach((element) => {
            if (!element.artboardParent) {
                if (activeObjects.length > 1) {
                    element.clipPath = new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: target.width + element.getScaledWidth(),
                        height: target.height + element.getScaledHeight(),
                        originX: "center",
                        originY: "center",
                    })
                } else {
                    element.clipPath = new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: element.getScaledWidth(),
                        height: element.getScaledHeight(),
                        originX: "left",
                        originY: "top",
                    })
                }
            }
        })
    }

    const handleSelectionCreated = (o) => {
        const activeSelection = canvas.getActiveObject();

        if (activeSelection && activeSelection.type === 'activeselection') {
            activeSelection.set({
                cornerStyle: 'circle',
                borderColor: 'blue',
                cornerColor: 'white',
                cornerStrokeColor: 'blue',
                borderScaleFactor: 2,
                transparentCorners: false,
                snapAngle: 30,
                snapThreshold: 5,
            });

            canvas.requestRenderAll();
        }
        let filteredObjects = o.selected.filter(obj => obj.name !== "artboard_title");
        if (filteredObjects.length === 1) {
            canvas.setActiveObject(filteredObjects[0]);
            canvas.renderAll();
        }
    }

    const handleWheel = (opt) => {
        opt.e.preventDefault();
        opt.e.stopPropagation();

        const zoomFactor = 1.01;
        const delta = opt.e.deltaY > 0 ? 1 : -1;
        let newZoom = zoomLevel;

        if (opt.e.ctrlKey) {
            newZoom = delta > 0 ? zoomLevel / zoomFactor : zoomLevel * zoomFactor;
            newZoom = Math.max(0.1, Math.min(newZoom, 5));
            setZoomLevel(newZoom);

            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
        } else {
            const dx = opt.e.deltaX;
            const dy = opt.e.deltaY;
            canvas.relativePan(new fabric.Point(-dx, -dy));
        }

        canvas.getObjects().forEach((obj) => obj.setCoords());

        canvas.requestRenderAll();
    };

    const handleZoomIn = () => {
        if (canvas) {
            const newZoom = zoomLevel + 0.1;
            canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoom);
            setZoomLevel(newZoom);
        }
    };

    const handleZoomOut = () => {
        if (canvas) {
            const newZoom = zoomLevel - 0.1;
            if (newZoom > 0.1) { // Prevent zooming out too much
                canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoom);
                setZoomLevel(newZoom);
            }
        }
    };

    const handleResetZoom = () => {
        if (canvas) {
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // Reset to default
            setZoomLevel(0.6);
            canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, 0.6);
        }
    };

    const createWhiteBoard = (fabricCanvas) => {

        const artboard = new Artboard({
            left: 0,
            top: 0,
            width: 1080,
            height: 1080,
            originX: "left",
            originY: "top",
            fill: getRandomColor(),
            label: `Artboard ${artBoardArray.length + 1}`,
            id: generateRandomId("artboard_"),
            name: "artboard",
            cornerStyle: 'circle',
            borderColor: 'blue',
            cornerColor: 'white',
            cornerStrokeColor: 'blue',
            borderScaleFactor: 2,
            transparentCorners: false,
            // lockScalingFlip: true,
            // selectable: false
        });

        artboard.setControlsVisibility({
            mtr: false,
        });

        if (artBoardArray.length < 1) {
            const boundingRect = artboard.getBoundingRect();
            const centerX = (fabricCanvas.width - boundingRect.width) / 2 - boundingRect.left;
            const centerY = (fabricCanvas.height - boundingRect.height) / 2 - boundingRect.top;

            artboard.set({
                left: centerX,
                top: centerY,
            });

            artboard.setCoords();
            handleSetZoom(fabricCanvas, artboard)
        } else {
            const { left: x1, top: y1, width: w1, height: h1 } = artBoardArray[artBoardArray.length - 1]

            artboard.set({
                left: x1 + w1 + 20,
                top: y1,
            });
            artboard.setCoords();
        }

        setArtBoard(artboard)
        setArtBoardArray([...artBoardArray, artboard])

        artboard.addTo(fabricCanvas);
        fabricCanvas.renderAll();

    }

    const handleSetZoom = (fabricCanvas, artboard) => {
        const canvasWidth = fabricCanvas.width;
        const canvasHeight = fabricCanvas.height;

        const artboardWidth = artboard.width * artboard.scaleX;
        const artboardHeight = artboard.height * artboard.scaleY;

        const zoomX = canvasWidth / artboardWidth;
        const zoomY = canvasHeight / artboardHeight;
        const zoomLevel = Math.min(zoomX, zoomY) * 0.8;

        fabricCanvas.zoomToPoint(
            { x: canvasWidth / 2, y: canvasHeight / 2 },
            zoomLevel
        );

        setZoomLevel(zoomLevel);
    }

    const checkArtboardPosition = () => {
        const boundingRect = artBoard.getBoundingRect();
        const transform = canvas.viewportTransform;

        const transformedLeft = boundingRect.left * transform[0] + transform[4];

        if (transformedLeft <= 400) {
            setNeedToShift(true)
        } else {
            setNeedToShift(false)
        }
    };

    const handleExpandLeftPanel = () => {
        setExpand(!expand)

        if (needToShift && !expand) {
            canvas.viewportTransform[4] += 350;
            canvas.requestRenderAll();
            setShifted(true)
        }

        if (shifted) {
            canvas.viewportTransform[4] -= 350;
            canvas.requestRenderAll();
            setShifted(false)
        }
    }

    const startDrawing = (shape, isDraw) => {
        isDrawingRef.current = isDraw
        canvas.isDrawingMode = isDraw
        setShapeType(shape)
        if (isDraw) {
            canvas.defaultCursor = "crosshair"
            canvas.discardActiveObject()
        } else {
            canvas.defaultCursor = "default"
        }
    }

    function getAbsolutePosition(obj, group) {
        if (!group) return obj;

        const matrix = group.calcTransformMatrix();
        const absolutePosition = fabric.util.transformPoint(
            { x: obj.left, y: obj.top },
            matrix
        );

        return {
            left: absolutePosition.x,
            top: absolutePosition.y,
            width: obj.width * group.scaleX,
            height: obj.height * group.scaleY,
            object: obj
        };
    }

    function getAllObjectsAtPointer(pos) {
        const pointer = pos;
        const foundObjects = [];

        canvas.forEachObject(obj => {
            if (obj.containsPoint(pointer)) {
                if (obj.type === 'group') {
                    obj._objects.forEach(child => {
                        const absolutePos = getAbsolutePosition(child, obj);
                        const childPointer = {
                            x: pointer.x,
                            y: pointer.y,
                        };

                        // Check if the click is inside the transformed child
                        if (
                            childPointer.x >= absolutePos.left &&
                            childPointer.x <= absolutePos.left + absolutePos.width &&
                            childPointer.y >= absolutePos.top &&
                            childPointer.y <= absolutePos.top + absolutePos.height
                        ) {
                            foundObjects.push(absolutePos.object);
                        }
                    });
                } else {
                    foundObjects.push(obj);
                }
            }
        });

        return foundObjects;
    }

    function isArtboardFullyInsideSelectionBox(obj, selectionBox) {
        const objBoundingBox = obj.getBoundingRect();
        return (
            objBoundingBox.left >= selectionBox.left &&
            objBoundingBox.top >= selectionBox.top &&
            objBoundingBox.left + objBoundingBox.width <= selectionBox.left + selectionBox.width &&
            objBoundingBox.top + objBoundingBox.height <= selectionBox.top + selectionBox.height
        );
    }

    function findObjectByNameInGroups(name, objects = canvas.getObjects()) {
        for (const obj of objects) {
            if (obj.name === name) {
                return obj;
            }

            if (obj.type === 'group') {
                const foundInGroup = findObjectByNameInGroups(name, obj.getObjects());
                if (foundInGroup) {
                    return foundInGroup;
                }
            }
        }
        return null;
    }

    function generateRandomId(id) {
        return id + (Math.random() * 1000) + 1
    }

    function getRandomColor() {
        var letters = "0123456789ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color.toUpperCase();
    }

    function drawGuideLine(card, edge) {
        let vertPoint
        let horPoint
        let strokeWidth = 5

        if (edge === "left") {
            vertPoint = { x1: card.left, y1: card.top, x2: card.left, y2: card.top + card.getScaledHeight() };
        }

        if (edge === "right") {
            vertPoint = { x1: card.left + card.getScaledWidth(), y1: card.top, x2: card.left + card.getScaledWidth(), y2: card.top + card.getScaledHeight() };
        }

        if (edge === "top") {
            horPoint = { x1: card.left, y1: card.top, x2: card.left + card.getScaledWidth(), y2: card.top };
        }

        if (edge === "bottom") {
            horPoint = { x1: card.left, y1: card.top + card.getScaledHeight(), x2: card.left + card.getScaledWidth(), y2: card.top + card.getScaledHeight() };
        }

        if (edge === "centerX") {
            vertPoint = { x1: card.left + card.getScaledWidth() / 2, y1: card.top, x2: card.left + card.getScaledWidth() / 2, y2: card.top + card.getScaledHeight() };
        }

        if (edge === "centerY") {
            horPoint = { x1: card.left, y1: card.top + card.getScaledHeight() / 2, x2: card.left + card.getScaledWidth(), y2: card.top + card.getScaledHeight() / 2 };
        }

        if (vertPoint) {
            const verticalLine = new fabric.Line([vertPoint.x1, vertPoint.y1, vertPoint.x2, vertPoint.y2], {
                stroke: '#FF4AE1',
                strokeWidth: strokeWidth,
                selectable: false,
                name: 'guide_line'
            });
            canvas.add(verticalLine);
            canvas.bringObjectToFront(verticalLine)
        }

        if (horPoint) {
            const horizontalLine = new fabric.Line([horPoint.x1, horPoint.y1, horPoint.x2, horPoint.y2], {
                stroke: '#FF4AE1',
                strokeWidth: strokeWidth,
                selectable: false,
                name: 'guide_line'
            });
            canvas.add(horizontalLine);
            canvas.bringObjectToFront(horizontalLine)
        }
    }

    return (
        <>
            <div>
                <div className='left_panel d-flex flex-column justify-content-between'>
                    <div className='element_panel d-flex flex-column align-items-center justify-content-around'>
                        <button className={`utils_icons ${shapeType === "CURSOR" ? "active" : ""}`} onClick={() => { startDrawing("CURSOR", false) }}><FaArrowPointer size={20} /></button>
                        <button className={`utils_icons ${shapeType === "TEXT" ? "active" : ""}`} onClick={() => { startDrawing("TEXT", false) }}><BiText size={20} /></button>
                        <button className="utils_icons"><IoCloudUploadOutline size={20} /></button>
                        <button className="utils_icons"><LuBrain size={20} /></button>
                        <button className={`utils_icons ${shapeType === "SQUARE" ? "active" : ""}`} onClick={() => { startDrawing("SQUARE", true) }}><FaRegSquare size={20} /></button>
                        <button className={`utils_icons ${shapeType === "CIRCLE" ? "active" : ""}`} onClick={() => { startDrawing("CIRCLE", true) }}><FaRegCircle size={20} /></button>
                        <button className={`utils_icons ${shapeType === "TRIANGLE" ? "active" : ""}`} onClick={() => { startDrawing("TRIANGLE", true) }}><FiTriangle size={20} /></button>
                        <button className={`utils_icons ${shapeType === "LINE" ? "active" : ""}`} onClick={() => { startDrawing("LINE", false) }}><FaSlash size={20} /></button>
                        <button className="utils_icons" onClick={handleResetZoom}><TbZoomReset size={20} /></button>
                    </div>
                    <div className='tools_panel'>
                        <button className={`utils_icons ${expand ? "active" : ""}`} onClick={handleExpandLeftPanel}><FaLayerGroup size={20} /></button>
                        <button className="utils_icons"><FaRegKeyboard size={20} /></button>
                    </div>
                </div>
                <LayersPanel expand={expand} artBoardArray={artBoardArray} createWhiteBoard={createWhiteBoard} canvas={canvas} handleExpandLeftPanel={handleExpandLeftPanel} />
            </div>
            <canvas ref={canvasRef} />
            <div className='zoom_undo_redo d-flex align-items-center justify-content-around'>
                <button className="utils_icons"><FaUndoAlt size={20} /></button>
                <button className="utils_icons" onClick={handleZoomOut}><FaMinus size={20} /></button>
                <div><input className='zoom_percent' type="number" readOnly value={`${Math.round(zoomLevel * 100)}`} /></div>
                <button className="utils_icons" onClick={handleZoomIn}><FaPlus size={20} /></button>
                <button className="utils_icons"><FaRedoAlt size={20} /></button>
            </div>
            <ProperyPanel activeElement={activeElement} />
        </>
    )
}

export default Instagram