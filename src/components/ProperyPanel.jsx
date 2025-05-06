import React, { useState } from 'react'
import { MdAlignVerticalTop, MdAlignVerticalCenter, MdAlignVerticalBottom, MdAlignHorizontalRight, MdAlignHorizontalLeft, MdAlignHorizontalCenter } from "react-icons/md";
import { TbLayoutGridAdd } from "react-icons/tb";
import { RiFlipHorizontalFill, RiFlipVerticalFill } from "react-icons/ri";
import { TbRotateDot } from "react-icons/tb";
import { PiCornersOutBold, PiSquareBold } from "react-icons/pi";
import { HiEyeDropper } from "react-icons/hi2";

function ProperyPanel({ activeElement }) {
    const [checkBoxes, setCheckBoxes] = useState({
        transformWidth: 0,
        transformHeight: 0,
        transformLeft: 0,
        transformTop: 0,
        transformRotate: 0,
        appearanceOpacity: 0,
        blendMode: "Normal",
        isAllCorner: true,
        cornerRadiusAll: 0,
        cornerRadius1: 0,
        cornerRadius2: 0,
        cornerRadius3: 0,
        cornerRadius4: 0,
        fill: false,
        stroke: false,
        dropShadow: false,
        innerShadow: false,
    });

    const handleCheckboxChange = (e, type) => {
        const name = e.target.name;
        let value = e.target[type];

        if (name === "isAllCorner") {
            value = value === "true";
        }

        setCheckBoxes({ ...checkBoxes, [name]: value });
    };

    return (
        <div className='property-panel'>
            <div className="row g-0">
                <div className="col-6 d-flex align-items-center justify-content-around border-end border-bottom border-1">
                    <button disabled={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><MdAlignVerticalTop size={20} /></button>
                    <button disabled={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><MdAlignVerticalCenter size={20} /></button>
                    <button disabled={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><MdAlignVerticalBottom size={20} /></button>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-around border-start border-bottom border-1">
                    <button disabled={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><MdAlignHorizontalLeft size={20} /></button>
                    <button disabled={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><MdAlignHorizontalCenter size={20} /></button>
                    <button disabled={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><MdAlignHorizontalRight size={20} /></button>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-around border-end border-top border-bottom border-1 px-2">
                    <button disabled={activeElement === null || activeElement === "artboard" ? true : false} className='repeat-grid d-flex align-items-center justify-content-around'>
                        <TbLayoutGridAdd size={20} />
                        <span>Repeat grid</span>
                    </button>
                </div>
                <div className="col-6 d-flex align-items-center justify-content-around border-start border-top border-bottom border-1">
                    <button disabled={activeElement === "multiple" ? false : true} className='utils_icons'><MdAlignVerticalTop size={20} /></button>
                    <button disabled={activeElement === "multiple" ? false : true} className='utils_icons'><MdAlignVerticalCenter size={20} /></button>
                    <button disabled={activeElement === "multiple" ? false : true} className='utils_icons'><MdAlignVerticalBottom size={20} /></button>
                    <button disabled={activeElement === "multiple" ? false : true} className='utils_icons'><MdAlignHorizontalLeft size={20} /></button>
                </div>
                <div className="transform col-12 border-start border-top border-bottom border-1 p-2">
                    <p className='m-0'>TRANSFORM</p>
                    <div className="row g-0">
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-width">W</label>
                                <input readOnly={activeElement === null ? true : false} type="number" name="transformWidth" id="transform-width" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.transformWidth} />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-X">X</label>
                                <input readOnly={activeElement === null ? true : false} type="number" name="transformLeft" id="transform-X" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.transformLeft} />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-1">
                            <button disabled={activeElement === null ? true : false} hidden={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><RiFlipHorizontalFill size={20} /></button>
                            <button disabled={activeElement === null ? true : false} hidden={activeElement === null || activeElement === "artboard" ? true : false} className='utils_icons'><RiFlipVerticalFill size={20} /></button>
                        </div>
                    </div>
                    <div className="row g-0">
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-height">H</label>
                                <input readOnly={activeElement === null ? true : false} type="number" name="transformHeight" id="transform-height" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.transformHeight} />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-2">
                            <div>
                                <label htmlFor="transform-Y">Y</label>
                                <input readOnly={activeElement === null ? true : false} type="number" name="transformTop" id="transform-Y" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.transformTop} />
                            </div>
                        </div>
                        <div className="col-4 d-flex align-items-center justify-content-center py-1">
                            <div hidden={activeElement === null || activeElement === "artboard" ? true : false}>
                                <label htmlFor="transform-rotate"><TbRotateDot size={20} /></label>
                                <input readOnly={activeElement === null ? true : false} type="number" name="transformRotate" id="transform-rotate" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.transformRotate} />
                            </div>
                        </div>
                    </div>
                </div>
                {activeElement === "artboard" && (<div className="scrolling col-12 border-start border-top border-bottom border-1 p-2">
                    <p className='m-0'>SCROLLING</p>
                    <select disabled={activeElement === null ? true : false} className="form-select mt-2" name='scrollMode' onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.scrollMode} >
                        <option value="None">None</option>
                        <option value="Vertical">Vertical</option>
                    </select>
                    <div className='d-flex align-items-center justify-content-between mt-2'>
                        <label htmlFor="scrolling-viewport-height">Viewport Height</label>
                        <input readOnly={activeElement === null ? true : false} type="number" className='w-25' name="viewportHeight" id="scrolling-viewport-height" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.viewportHeight} />
                    </div>
                </div>)}
                <div className="appearance col-12 border-start border-top border-bottom border-1 px-2 py-2">
                    <p className='m-0'>APPEARANCE</p>
                    {activeElement !== "artboard" && (<div className="row g-0 mt-1">
                        <div className="col-9 d-flex flex-column align-items-start justify-content-between py-2">
                            <p className='m-0'>Opacity</p>
                            <input disabled={activeElement === null ? true : false} type="range" name="appearanceOpacity" id="appearance-opacity-range" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.appearanceOpacity} />
                        </div>
                        <div className="col-3 d-flex align-items-end justify-content-center py-2">
                            <input readOnly={activeElement === null ? true : false} type="number" name="appearanceOpacity" id="appearance-opacity-number" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.appearanceOpacity} />
                        </div>
                    </div>)}
                    {activeElement !== null && <div className="row g-0 mt-2">
                        <div className="col-12 d-flex flex-column align-items-start justify-content-between py-2">
                            {activeElement !== "artboard" && <>
                                <p className='m-0'>Blend mode</p>
                                <select disabled={activeElement === null ? true : false} className="form-select mt-1" name='blendMode' onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.blendMode} >
                                    <option value="Normal">Normal</option>
                                    <option value="Darken">Darken</option>
                                    <option value="Multiply">Multiply</option>
                                    <option value="Color Burn">Color Burn</option>
                                    <option value="Lighten">Lighten</option>
                                    <option value="Screen">Screen</option>
                                    <option value="Color Dodge">Color Dodge</option>
                                </select>
                                <div className="row g-0 mt-1">
                                    <div className="col-3 d-flex align-items-start justify-content-between">
                                        <label className={`utils_icons ${checkBoxes.isAllCorner ? 'active' : ''}`}>
                                            <input
                                                disabled={activeElement === null ? true : false}
                                                type="radio"
                                                name="isAllCorner"
                                                value={true}
                                                checked={checkBoxes.isAllCorner}
                                                onChange={(e) => { handleCheckboxChange(e, "value") }}
                                            />
                                            <PiSquareBold size={20} />
                                        </label>
                                        <label className={`utils_icons ${!checkBoxes.isAllCorner ? 'active' : ''}`}>
                                            <input
                                                disabled={activeElement === null ? true : false}
                                                type="radio"
                                                name="isAllCorner"
                                                value={false}
                                                checked={!checkBoxes.isAllCorner}
                                                onChange={(e) => { handleCheckboxChange(e, "value") }}
                                            />
                                            <PiCornersOutBold size={20} />
                                        </label>
                                    </div>
                                    <div className="col-9 d-flex align-items-center justify-content-between">
                                        {checkBoxes.isAllCorner ?
                                            <input readOnly={activeElement === null ? true : false} className="w-25" type="number" name="cornerRadiusAll" id="corner-radius-all" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.cornerRadiusAll} /> :
                                            <>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="cornerRadius1" id="corner-radius-1" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.cornerRadius1} />
                                                <input readOnly={activeElement === null ? true : false} type="number" name="cornerRadius2" id="corner-radius-2" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.cornerRadius2} />
                                                <input readOnly={activeElement === null ? true : false} type="number" name="cornerRadius3" id="corner-radius-3" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.cornerRadius3} />
                                                <input readOnly={activeElement === null ? true : false} type="number" name="cornerRadius4" id="corner-radius-4" onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.cornerRadius4} />
                                            </>
                                        }
                                    </div>
                                </div>
                            </>}
                            <div className="row g-3 w-100">
                                <div className="col-2 d-flex align-items-center justify-content-center">
                                    <input disabled={activeElement === null ? true : false} type="checkbox" name="fill" id="fill-on" checked={checkBoxes.fill} onChange={(e) => { handleCheckboxChange(e, "checked") }} />
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-start px-0 py-1">
                                    <input disabled={activeElement === null ? true : false} type="color" className='h-50' />
                                </div>
                                <div className="col-6 d-flex align-items-center justify-content-start ">
                                    Fill
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-between">
                                    <button disabled={activeElement === null ? true : false} className='utils_icons'><HiEyeDropper size={15} /></button>
                                </div>
                            </div>
                            {activeElement !== "artboard" && <div className="row g-3 w-100">
                                <div className="col-2 d-flex align-items-center justify-content-center">
                                    <input disabled={activeElement === null ? true : false} type="checkbox" name="stroke" id="stroke-on" checked={checkBoxes.stroke} onChange={(e) => { handleCheckboxChange(e, "checked") }} />
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-start px-0 py-1">
                                    <input disabled={activeElement === null ? true : false} type="color" className='h-50' />
                                </div>
                                <div className="col-6 d-flex align-items-center justify-content-start">
                                    Border
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-between">
                                    <button disabled={activeElement === null ? true : false} className='utils_icons'><HiEyeDropper size={15} /></button>
                                </div>

                                {checkBoxes.stroke && (
                                    <div className="col-12 d-flex align-items-center justify-content-between mt-0">
                                        <div className="row g-3 w-100">
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="stroke-size">Size</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="stroke-size" />
                                            </div>
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="stroke-dash">Dash</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="stroke-dash" />
                                            </div>
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="stroke-gap">Gap</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="stroke-gap" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>}
                        </div>
                    </div>}
                </div>
                {activeElement !== null && activeElement !== "artboard" && <div className="effects col-12 border-start border-top border-bottom border-1 px-2 py-2">
                    <p className='m-0'>EFFECTS</p>
                    <div className="row g-0 mt-2">
                        <div className="col-12 d-flex flex-column align-items-start justify-content-between py-2">
                            <div className="row g-3 w-100">
                                <div className="col-2 d-flex align-items-center justify-content-center">
                                    <input disabled={activeElement === null ? true : false} type="checkbox" name="innerShadow" id="inner-shadow-on" checked={checkBoxes.innerShadow} onChange={(e) => { handleCheckboxChange(e, "checked") }} />
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-start px-0 py-1">
                                    <input disabled={activeElement === null ? true : false} type="color" className='h-50' />
                                </div>
                                <div className="col-6 d-flex align-items-center justify-content-start">
                                    Inner Shadow
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-between">
                                    <button disabled={activeElement === null ? true : false} className='utils_icons'><HiEyeDropper size={15} /></button>
                                </div>

                                {checkBoxes.innerShadow && (
                                    <div className="col-12 d-flex align-items-center justify-content-between mt-0">
                                        <div className="row g-3 w-100">
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="inner-shadow-x">X</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="inner-shadow-x" />
                                            </div>
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="inner-shadow-y">Y</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="inner-shadow-y" />
                                            </div>
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="inner-shadow-b">B</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="inner-shadow-b" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="row g-3 w-100">
                                <div className="col-2 d-flex align-items-center justify-content-center">
                                    <input disabled={activeElement === null ? true : false} type="checkbox" name="dropShadow" id="drop-shadow-on" checked={checkBoxes.dropShadow} onChange={(e) => { handleCheckboxChange(e, "checked") }} />
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-start px-0 py-1">
                                    <input disabled={activeElement === null ? true : false} type="color" className='h-50' />
                                </div>
                                <div className="col-6 d-flex align-items-center justify-content-start">
                                    Drop Shadow
                                </div>
                                <div className="col-2 d-flex align-items-center justify-content-between">
                                    <button disabled={activeElement === null ? true : false} className='utils_icons'><HiEyeDropper size={15} /></button>
                                </div>

                                {checkBoxes.dropShadow && (
                                    <div className="col-12 d-flex align-items-center justify-content-between mt-0">
                                        <div className="row g-3 w-100">
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="drop-shadow-x">X</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="inner-shadow-x" />
                                            </div>
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="drop-shadow-y">Y</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="inner-shadow-y" />
                                            </div>
                                            <div className="col-4 d-flex align-items-center justify-content-center">
                                                <label htmlFor="drop-shadow-b">B</label>
                                                <input readOnly={activeElement === null ? true : false} type="number" name="" id="inner-shadow-b" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>}
                {activeElement === "artboard" && (<div className="grid col-12 border-start border-top border-bottom border-1 p-2">
                    <p className='m-0'>GRID</p>
                    <div className="row g-3 w-100 mt-1">
                        <div className="col-2 d-flex align-items-center justify-content-center">
                            <input disabled={activeElement === null ? true : false} type="checkbox" name="stroke" id="stroke-on" checked={checkBoxes.stroke} onChange={(e) => { handleCheckboxChange(e, "checked") }} />
                        </div>
                        <div className="col-10 d-flex align-items-center justify-content-center">
                            <select disabled={activeElement === null ? true : false} className="form-select" name='scrollMode' onChange={(e) => { handleCheckboxChange(e, "value") }} value={checkBoxes.scrollMode} >
                                <option value="None">None</option>
                                <option value="Vertical">Vertical</option>
                            </select>
                        </div>
                    </div>
                </div>)}
            </div>
        </div>
    )
}

export default ProperyPanel