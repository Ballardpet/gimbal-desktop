import React from 'react';

export default function Manual_Control() {
    return (
        <section>
            <h2 className="center_elements">Manual Control: Can Use Arrow Keys</h2>

            <div className="center_elements">
                <button type="button" className="control" >up</button>
            </div>
            <div className="center_elements">
                <button type="button" className="control" >left</button>
                <button type="button" className="control" >stop</button>
                <button type="button" className="control" >right</button>
            </div>
            <div className="center_elements">
                <button type="button" className="control" >down</button>
            </div>

            <div className="center_elements">
                <label htmlFor ="speed">Speed: </label>
                <input type="range" min="1" max="8" className="slider" id="speed" name="speed" />
            </div>
        </section>
    )
}