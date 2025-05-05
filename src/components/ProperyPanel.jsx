import React from 'react'
import { MdAlignVerticalTop, MdAlignVerticalCenter, MdAlignVerticalBottom, MdAlignHorizontalRight, MdAlignHorizontalLeft, MdAlignHorizontalCenter } from "react-icons/md";
import { TbLayoutGridAdd } from "react-icons/tb";
import { RiFlipHorizontalFill, RiFlipVerticalFill } from "react-icons/ri";
import { TbRotateDot } from "react-icons/tb";

function ProperyPanel() {
    return (
        <div className='property-panel'>
            <div className="row g-0">
                <div className="col-6 d-flex align-items-center justify-content-around border-end border-bottom border-1">
                    <button className='utils_icons'><MdAlignVerticalTop size={20} /></button>
                    <button className='utils_icons'><MdAlignVerticalCenter size={20} /></button>
                    <button className='utils_icons'><MdAlignVerticalBottom size={20} /></button>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-around border-start border-bottom border-1">
                    <button className='utils_icons'><MdAlignHorizontalLeft size={20} /></button>
                    <button className='utils_icons'><MdAlignHorizontalCenter size={20} /></button>
                    <button className='utils_icons'><MdAlignHorizontalRight size={20} /></button>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-around border-end border-top border-bottom border-1 px-2">
                    <button className='repeat-grid d-flex align-items-center justify-content-around'>
                        <TbLayoutGridAdd size={20} />
                        <span>Repeat grid</span>
                    </button>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-around border-start border-top border-bottom border-1">
                    <button className='utils_icons'><MdAlignVerticalTop size={20} /></button>
                    <button className='utils_icons'><MdAlignVerticalCenter size={20} /></button>
                    <button className='utils_icons'><MdAlignVerticalBottom size={20} /></button>
                    <button className='utils_icons'><MdAlignHorizontalLeft size={20} /></button>
                </div>
                <div className="transform col-12 border-start border-top border-bottom border-1 px-2 py-2">
                    <p className='m-0'>TRANSFORM</p>
                    <div className="row g-0">
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-width">W</label>
                                <input type="number" name="" id="transform-width" />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-X">X</label>
                                <input type="number" name="" id="transform-X" />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-1">
                            <button className='utils_icons'><RiFlipHorizontalFill size={20} /></button>
                            <button className='utils_icons'><RiFlipVerticalFill size={20} /></button>
                        </div>
                    </div>
                    <div className="row g-0">
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-height">H</label>
                                <input type="number" name="" id="transform-height" />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-Y">Y</label>
                                <input type="number" name="" id="transform-Y" />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-1">
                            <div>
                                <label htmlFor="transform-rotate"><TbRotateDot size={20} /></label>
                                <input type="number" name="" id="transform-rotate" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="transform col-12 border-start border-top border-bottom border-1 px-2 py-2">
                    <p className='m-0'>APPEARANCE</p>
                    <div className="row g-0">
                        <div className="col-9 d-flex flex-column align-items-start justify-content-between py-2">
                            <p className='m-0'>opacity</p>
                            <input type="range" value={100} name="" id="" />
                        </div>
                        <div className="col-3 d-flex align-items-center justify-content-center py-2">
                            <input type="number" name="" id="appearance-opacity" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProperyPanel