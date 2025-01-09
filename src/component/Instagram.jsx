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
    const [canvas, setCanvas] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0.6);
    const [artBoardArray, setArtBoardArray] = useState([]);
    const [artBoard, setArtBoard] = useState();
    const [expand, setExpand] = useState(true);
    const [needToShift, setNeedToShift] = useState(false);
    const [shifted, setShifted] = useState(false);

    useEffect(() => {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth,
            height: window.innerHeight,
        });

        setCanvas(fabricCanvas);
        fabricCanvas.zoomToPoint({ x: fabricCanvas.width / 2, y: fabricCanvas.height / 2 }, zoomLevel);
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
            }
        };
    }, [canvas, zoomLevel])

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
        const rect = new fabric.Rect({
            width: 1080,
            height: 1080,
            fill: '#FFFFFF',
            name: `artboard_${artBoardArray.length + 1}`,
        });

        const group = new fabric.Group([rect], {
            left: 0,
            top: 35,
            clipPath: new fabric.Rect({
                width: 1080,
                height: 1080,
                left: -540,
                top: -540,
            }),
            name: `elementGroup_${artBoardArray.length + 1}`,
        });
        var text = new fabric.FabricText(`Artboard ${artBoardArray.length + 1}`, {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: '#FFFFFF',
            hoverCursor: "text",
            name: `artboardTitle_${artBoardArray.length + 1}`,
            // evented: true,
        });

        const artBoardMainGroup = new fabric.Group([group, text], {
            left: 0,
            top: 0,
            name: `mainArtboardGroup_${artBoardArray.length + 1}`,
            hoverCursor: 'default',
            selectable: false,
            evented: true,
            subTargetCheck: true
        })

        const boundingRect = artBoardMainGroup.getBoundingRect();
        const centerX = (fabricCanvas.width - boundingRect.width) / 2 - boundingRect.left;
        const centerY = (fabricCanvas.height - boundingRect.height) / 2 - boundingRect.top;

        artBoardMainGroup.set({
            left: centerX,
            top: centerY,
        });

        setArtBoard(rect)
        setArtBoardArray([...artBoardArray, artBoardMainGroup])
        fabricCanvas.add(artBoardMainGroup);
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

        if (needToShift) {
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

    return (
        <>
            <div>
                <div className='left_panel d-flex flex-column justify-content-between'>
                    <div className='element_panel d-flex flex-column align-items-center justify-content-around'>
                        <button className="utils_icons" onClick={handleExpandLeftPanel}><BiText size={20} /></button>
                        <button className="utils_icons"><RiShapesLine size={20} /></button>
                        <button className="utils_icons"><IoCloudUploadOutline size={20} /></button>
                        <button className="utils_icons"><LuBrain size={20} /></button>
                        <button className="utils_icons"><FaRegSquare size={20} /></button>
                        <button className="utils_icons"><FaRegCircle size={20} /></button>
                        <button className="utils_icons"><FiTriangle size={20} /></button>
                        <button className="utils_icons"><FaSlash size={20} /></button>
                        <button className="utils_icons" onClick={handleResetZoom}><TbZoomReset size={20} /></button>
                    </div>
                    <div className='tools_panel'>
                        <button className="utils_icons"><FaLayerGroup size={20} /></button>
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