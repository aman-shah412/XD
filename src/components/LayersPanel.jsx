import React from 'react'
import { IoIosCloseCircle } from "react-icons/io";
import { MdOutlineDragIndicator } from "react-icons/md";
import { FaLockOpen } from "react-icons/fa6";
import { LuEye } from "react-icons/lu";

function LayersPanel({ expand, artBoardArray, createWhiteBoard, canvas, handleExpandLeftPanel }) {
    return (
        <div>
            {expand && <div className="left_expanded_panel">
                <div className='left_expanded_panel_content'>
                    <div className='position-relative d-flex justify-content-center align-items-center'>
                        <span className='mb-2 text-light'>Layers</span>
                        <button className="close_icon" onClick={handleExpandLeftPanel}><IoIosCloseCircle size={25} /></button>
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
                                                            <FaLockOpen />
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
                        <button className='add_new_artboard mt-3' onClick={() => { createWhiteBoard(canvas) }}>New Artboard</button>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default LayersPanel
