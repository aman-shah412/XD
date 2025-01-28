import React, { useRef, useState, useEffect } from 'react'
import { FaUndoAlt, FaRedoAlt, FaPlus, FaMinus, FaRegSquare, FaRegCircle, FaSlash, FaLayerGroup } from "react-icons/fa";
import { FaRegKeyboard, FaLock, FaLockOpen } from "react-icons/fa6";
import { BiText } from "react-icons/bi";
import { IoIosCloseCircle } from "react-icons/io";
import { MdOutlineDragIndicator } from "react-icons/md";
import { TbZoomReset } from "react-icons/tb";
import { RiShapesLine } from "react-icons/ri";
import { IoCloudUploadOutline } from "react-icons/io5";
import { LuBrain, LuEye, LuEyeClosed } from "react-icons/lu";
import { FiTriangle } from "react-icons/fi";
import "../appCSS/instagram.css"
import * as fabric from "fabric";

function Instagram() {

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const tempShape = useRef(null);

    const [canvas, setCanvas] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0.6);
    const [artBoardArray, setArtBoardArray] = useState([]);
    const [artBoard, setArtBoard] = useState(null);
    const [expand, setExpand] = useState(false);
    const [needToShift, setNeedToShift] = useState(false);
    const [shifted, setShifted] = useState(false);
    const [shapeType, setShapeType] = useState("");

    let startPos
    let offsetX, offsetY
    let titleDowned = false
    let clickedTitle = null
    let clickedGroup = null
    let selectionBox = null;

    useEffect(() => {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth,
            height: window.innerHeight,
            preserveObjectStacking: true,
        });

        setCanvas(fabricCanvas);
        const browserZoomLevel = Math.round(window.devicePixelRatio * 100);

        const fabricZoomLevel = 120 - (4 / 5) * browserZoomLevel;
        fabricCanvas.zoomToPoint({ x: fabricCanvas.width / 2, y: fabricCanvas.height / 2 }, fabricZoomLevel / 100);
        setZoomLevel(fabricZoomLevel / 100)
        setShapeType(null)
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
            canvas.on("selection:created", selectionCreated)
        }

        return () => {
            if (canvas) {
                canvas.off("mouse:down", handleDrawingStart)
                canvas.off("mouse:move", handleDrawing)
                canvas.off("mouse:up", handleDrawingEnd)
                canvas.off("selection:created", selectionCreated)
            }
        }
    }, [shapeType])


    const handleDrawingStart = (o) => {
        startPos = canvas.getPointer(o.e);

        if (isDrawingRef.current) {
            tempShape.current = createTempShape(startPos)
            canvas.add(tempShape.current);
        } else {
            if (o.target?.name?.includes("artboard_title")) {
                clickedTitle = o.target
                clickedGroup = canvas.getObjects().find(obj => obj.id === o.target.groupID);
                titleDowned = true
                offsetX = { title: clickedTitle.left - startPos.x, group: clickedGroup.left - startPos.x };
                offsetY = { title: clickedTitle.top - startPos.y, group: clickedGroup.top - startPos.y };
                canvas.selection = false
            }
            // else {
            //     selectionBox = {
            //         left: startPos.x,
            //         top: startPos.y,
            //         width: 0,
            //         height: 0,
            //     };
            // }
        }
    }

    const handleDrawing = (o) => {
        if (isDrawingRef.current && !tempShape.current) {
            startPos = canvas.getPointer(o.e);
            const objects = getAllObjectsAtPointer(startPos);
        }

        if (isDrawingRef.current && tempShape.current) {
            const endPos = canvas.getPointer(o.e);
            const shiftPressed = o.e.shiftKey;
            updateTempShape(endPos, shiftPressed);
            canvas.requestRenderAll()
        }
        if (titleDowned) {
            const endPos = canvas.getPointer(o.e);

            clickedTitle.set({
                left: endPos.x + offsetX.title,
                top: endPos.y + offsetY.title
            })
            clickedTitle.setCoords();

            clickedGroup.set({
                left: endPos.x + offsetX.group,
                top: endPos.y + offsetY.group
            })
            clickedGroup.setCoords();
            canvas.requestRenderAll();
        }

        if (selectionBox) {
            const pointer = canvas.getPointer(o.e);
            selectionBox.width = Math.abs(pointer.x - startPos.x);
            selectionBox.height = Math.abs(pointer.y - startPos.y);
            selectionBox.left = Math.min(pointer.x, startPos.x);
            selectionBox.top = Math.min(pointer.y, startPos.y);
        }
    }

    const handleDrawingEnd = () => {
        if (isDrawingRef.current) {
            tempShape.current.setCoords();
            canvas.remove(tempShape.current)
            artBoard.parent.add(tempShape.current)
            isDrawingRef.current = false
            canvas.defaultCursor = "default"
            canvas.selection = true;
            tempShape.current = null
        }

        if (titleDowned) {
            canvas.selection = true
            titleDowned = false
            clickedTitle = null
            clickedGroup = null
            offsetX = null
            offsetY = null
            canvas.renderAll();
        }

        if (selectionBox) {
            const objectsInsideSelection = canvas.getObjects().filter((obj) => {
                if (obj.type === 'group') {
                    const foundInGroup = findObjectByNameInGroups('artboard_rect', obj.getObjects());
                    if (foundInGroup) {
                        return isArtboardFullyInsideSelectionBox(foundInGroup, selectionBox);
                    }
                }
                return false;
            });

            if (objectsInsideSelection.length) {
                canvas.setActiveObject(objectsInsideSelection[0])
                canvas.renderAll()
            } else {
                canvas.discardActiveObject()
            }
            selectionBox = null
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
                    fill: 'rgba(0,0,0,0.3)',
                    stroke: 'black',
                    strokeWidth: 1,
                    selectable: true
                });
            case "CIRCLE":
                return new fabric.Ellipse({
                    left: startPoint.x,
                    top: startPoint.y,
                    rx: 0,
                    ry: 0,
                    fill: 'rgba(0,0,0,0.3)',
                    stroke: 'black',
                    strokeWidth: 1,
                    selectable: false,
                    originX: 'center',
                    originY: 'center'
                });
            case "TRIANGLE":
                return new fabric.Triangle({
                    left: startPoint.x,
                    top: startPoint.y,
                    width: 0,
                    height: 0,
                    fill: 'rgba(0,0,0,0.3)',
                    stroke: 'black',
                    strokeWidth: 1,
                    selectable: false
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
                break;
            default:
                break;
        }
    }

    function selectionCreated(e) {
        let selectedElement = e.selected
        if (selectedElement) {
            selectedElement.forEach((element) => {

                if (element.name === "artboard_group") {
                    const rect = element._objects.find(ele => ele.name === "artboard_rect")
                    const canvasZoom = canvas.getZoom();
                    const rectTransform = rect.getBoundingRect(true);
                    const groupTransform = element.getBoundingRect(true);

                    const controls = element.controls;

                    const offsets = {
                        tl: {
                            x: (rectTransform.left - groupTransform.left) * canvasZoom,
                            y: (rectTransform.top - groupTransform.top) * canvasZoom,
                        },
                        tr: {
                            x: (rectTransform.left + rectTransform.width - groupTransform.left - groupTransform.width) * canvasZoom,
                            y: (rectTransform.top - groupTransform.top) * canvasZoom,
                        },
                        bl: {
                            x: (rectTransform.left - groupTransform.left) * canvasZoom,
                            y: (rectTransform.top + rectTransform.height - groupTransform.top - groupTransform.height) * canvasZoom,
                        },
                        br: {
                            x: (rectTransform.left + rectTransform.width - groupTransform.left - groupTransform.width) * canvasZoom,
                            y: (rectTransform.top + rectTransform.height - groupTransform.top - groupTransform.height) * canvasZoom,
                        },
                        ml: {
                            x: (rectTransform.left - groupTransform.left) * canvasZoom,
                            y: (rectTransform.top + (rectTransform.height / 2) - groupTransform.top - (groupTransform.height / 2)) * canvasZoom,
                        },
                        mt: {
                            x: (rectTransform.left + (rectTransform.width / 2) - groupTransform.left - (groupTransform.width / 2)) * canvasZoom,
                            y: (rectTransform.top - groupTransform.top) * canvasZoom,
                        },
                        mr: {
                            x: (rectTransform.left + rectTransform.width - groupTransform.left - groupTransform.width) * canvasZoom,
                            y: (rectTransform.top + (rectTransform.height / 2) - groupTransform.top - (groupTransform.height / 2)) * canvasZoom,
                        },
                        mb: {
                            x: (rectTransform.left + (rectTransform.width / 2) - groupTransform.left - (groupTransform.width / 2)) * canvasZoom,
                            y: (rectTransform.top + rectTransform.height - groupTransform.top - groupTransform.height) * canvasZoom,
                        },
                    };

                    element.controls.tl = new fabric.Control({ ...controls.tl, offsetX: offsets.tl.x, offsetY: offsets.tl.y });
                    element.controls.tr = new fabric.Control({ ...controls.tr, offsetX: offsets.tr.x, offsetY: offsets.tr.y });
                    element.controls.bl = new fabric.Control({ ...controls.bl, offsetX: offsets.bl.x, offsetY: offsets.bl.y });
                    element.controls.br = new fabric.Control({ ...controls.br, offsetX: offsets.br.x, offsetY: offsets.br.y });
                    element.controls.ml = new fabric.Control({ ...controls.ml, offsetX: offsets.ml.x, offsetY: offsets.ml.y });
                    element.controls.mt = new fabric.Control({ ...controls.mt, offsetX: offsets.mt.x, offsetY: offsets.mt.y });
                    element.controls.mr = new fabric.Control({ ...controls.mr, offsetX: offsets.mr.x, offsetY: offsets.mr.y });
                    element.controls.mb = new fabric.Control({ ...controls.mb, offsetX: offsets.mb.x, offsetY: offsets.mb.y });

                    element.setCoords()
                    canvas.requestRenderAll()
                }
            })
        }
    }

    const handleWheel = (opt) => {
        opt.e.preventDefault();
        opt.e.stopPropagation();

        let newZoom = zoomLevel;
        const pointer = canvas.getPointer(opt.e)

        if (opt.e.ctrlKey) {
            const zoomFactor = 1.01;
            const delta = opt.e.deltaY > 0 ? 1 : -1;
            newZoom = delta > 0 ? zoomLevel / zoomFactor : zoomLevel * zoomFactor;
            newZoom = Math.max(0.1, Math.min(newZoom, 5));
            setZoomLevel(newZoom)
        } else {
            const dx = opt.e.deltaX;
            const dy = opt.e.deltaY;
            canvas.viewportTransform[4] -= dx;
            canvas.viewportTransform[5] -= dy;
        }

        if (newZoom != zoomLevel) {
            canvas.zoomToPoint({ x: pointer.x, y: pointer.y }, newZoom);
        }

        canvas.getObjects().forEach((obj) => {
            obj.setCoords();
        });

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

        const artboardTitle = new fabric.FabricText(`Artboard ${artBoardArray.length + 1}`, {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'gray',
            hoverCursor: "text",
            name: "artboard_title",
            id: `artboardTitle_${artBoardArray.length + 1}`,
            groupID: `artboardGroup_${artBoardArray.length + 1}`,
            selectable: false,
            evented: true,
            hasControls: false,
            hasBorders: false,
        });

        const artboardRect = new fabric.Rect({
            width: 1080,
            height: 1080,
            fill: '#FFFFFF',
            name: "artboard_rect",
            id: `artboardRect_${artBoardArray.length + 1}`,
            groupID: `artboardGroup_${artBoardArray.length + 1}`
        });


        const artboardGroup = new fabric.Group([artboardRect], {
            left: 0,
            top: 0,
            clipPath: new fabric.Rect({
                width: 1080,
                height: 1080,
                left: -540,
                top: -540,
            }),
            name: "artboard_group",
            id: `artboardGroup_${artBoardArray.length + 1}`,
            title: `Artboard ${artBoardArray.length + 1}`,
            textID: `artboardTitle_${artBoardArray.length + 1}`,
            rectID: `artboardRect_${artBoardArray.length + 1}`,
            cornerStyle: 'circle',
            borderColor: 'blue',
            cornerColor: 'white',
            cornerStrokeColor: 'blue',
            borderScaleFactor: 2,
            transparentCorners: false,
            hoverCursor: 'default',
            selectable: true,
            evented: true,
            subTargetCheck: true,
            hasControls: true,
            hasBorders: false,
            lockScalingFlip: true,
        });

        artboardGroup.setControlsVisibility({
            mtr: false,
        });


        if (artBoardArray.length < 1) {
            const boundingRect = artboardGroup.getBoundingRect();
            const centerX = (fabricCanvas.width - boundingRect.width) / 2 - boundingRect.left;
            const centerY = (fabricCanvas.height - boundingRect.height) / 2 - boundingRect.top;

            artboardTitle.set({
                left: centerX,
                top: centerY - 50,
            });
            artboardGroup.set({
                left: centerX,
                top: centerY,
            });

            artboardTitle.setCoords();
            artboardGroup.setCoords();
        } else {
            const { left: x1, top: y1, width: w1, height: h1 } = artBoardArray[artBoardArray.length - 1]
            artboardTitle.set({
                left: x1 + w1 + 20,
                top: y1 - 50,
            });
            artboardGroup.set({
                left: x1 + w1 + 20,
                top: y1,
            });
            artboardTitle.setCoords();
            artboardGroup.setCoords();
        }

        setArtBoard(artboardRect)
        setArtBoardArray([...artBoardArray, artboardGroup])
        fabricCanvas.add(artboardGroup);
        fabricCanvas.add(artboardTitle);
        fabricCanvas.renderAll();
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

    const startDrawing = (shape) => {
        setShapeType(shape)
        isDrawingRef.current = true
        canvas.defaultCursor = "crosshair"
        canvas.selection = false;
    }

    function getAbsolutePosition(obj, group) {
        if (!group) return obj; // If not in a group, return as is

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

    return (
        <>
            <div>
                <div className='left_panel d-flex flex-column justify-content-between'>
                    <div className='element_panel d-flex flex-column align-items-center justify-content-around'>
                        <button className="utils_icons"><BiText size={20} /></button>
                        <button className="utils_icons"><RiShapesLine size={20} /></button>
                        <button className="utils_icons"><IoCloudUploadOutline size={20} /></button>
                        <button className="utils_icons"><LuBrain size={20} /></button>
                        <button className="utils_icons" onClick={() => { startDrawing("SQUARE") }}><FaRegSquare size={20} /></button>
                        <button className="utils_icons" onClick={() => { startDrawing("CIRCLE") }}><FaRegCircle size={20} /></button>
                        <button className="utils_icons" onClick={() => { startDrawing("TRIANGLE") }}><FiTriangle size={20} /></button>
                        <button className="utils_icons"><FaSlash size={20} /></button>
                        <button className="utils_icons" onClick={handleResetZoom}><TbZoomReset size={20} /></button>
                    </div>
                    <div className='tools_panel'>
                        <button className="utils_icons" onClick={handleExpandLeftPanel}><FaLayerGroup size={20} /></button>
                        <button className="utils_icons"><FaRegKeyboard size={20} /></button>
                    </div>
                </div>
                {expand && <div className="left_expanded_panel">
                    <div className='left_expanded_panel_content'>
                        <div className='position-relative d-flex justify-content-center align-items-center'>
                            <span className='mb-3 text-light'>Layers</span>
                            <button className="close_icon"><IoIosCloseCircle size={25} /></button>
                        </div>
                        <div className='accordion_content'>
                            <div className="accordion" id="layer_accordion">
                                {artBoardArray.map((board, i) => {
                                    return <div className="accordion-item mb-3" key={i}>
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse_${i + 1}`} aria-expanded="true" aria-controls="collapseOne">
                                            Artboard {i + 1}
                                        </button>
                                        <div id={`collapse_${i + 1}`} className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#layer_accordion">
                                            <div className="accordion-body px-1">
                                                <div className="preview-tile-container">
                                                    <div className="preview-tile">
                                                        <MdOutlineDragIndicator size={25} color='#FFFFFF' />
                                                        <img src="vite.svg" alt="" />
                                                        <div className="d-flex flex-column">
                                                            <button className='tile-control-button'>
                                                                {/* <FaLock size={15} /> */}
                                                                <FaLockOpen size={15} />
                                                            </button>
                                                            <button className='tile-control-button'>
                                                                <LuEye />
                                                                {/* <LuEyeClosed /> */}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </div>
                        <div>
                            <button className='add_new_artboard mt-4' onClick={() => { createWhiteBoard(canvas) }}>New Artboard</button>
                        </div>
                    </div>
                </div>}
            </div>
            <canvas ref={canvasRef} />
            <div className='zoom_undo_redo d-flex align-items-center justify-content-around'>
                <button className="utils_icons"><FaUndoAlt size={20} /></button>
                <button className="utils_icons" onClick={handleZoomOut}><FaMinus size={20} /></button>
                <div><input className='zoom_percent' type="number" readOnly value={`${Math.round(zoomLevel * 100)}`} /></div>
                <button className="utils_icons" onClick={handleZoomIn}><FaPlus size={20} /></button>
                <button className="utils_icons"><FaRedoAlt size={20} /></button>
            </div>
        </>
    )
}

export default Instagram