// This should be the arrow keys to manually move & stop the gimbal

// Eventually add a speed slider
    // Maybe like 1-8
    // Pan: 00-3F-FF
        // 256 total options
        // multiply input by 32 and subtract 1 for speed
    // Tilt: 00-3f
        //64 total options
        // multiply input by 8 and subtract 1 for speed
//import { useEffect, useRef } from "react";
import React, { useEffect, useRef } from "react";

export default function Manual_control(){
    const activeDirection = useRef(null);

    const handleClick = async (direction) => {

        
        if (direction == "stop") {
            console.log("Gimbal stopped");
            const data = await window.api.manualStop();
            console.log(data);

        }
        else {
            const speed = document.getElementById("speed").value
            console.log("Direction clicked: ", direction, " At speed: ", speed);
            const data = await window.api.manualMove(direction, speed);
            console.log(data);
        }
    }

    useEffect(() => {

        // arrow keys to directions
        const keyToDirection = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right",
        };

        // button pressed
        const handleKeyDown = (event) => {

            // convert key pressed to direction
            const direction = keyToDirection[event.key];

            // if it's not a direction, return
            if (!direction) return;

            event.preventDefault();

            // Ignore auto-repeat events while key is held
            if (event.repeat) return;

            // set the current direction to the key pressed, and then start moving
            activeDirection.current = direction;
            handleClick(direction);
        };

        // button let go
        const handleKeyUp = (event) => {
            const direction = keyToDirection[event.key];

            if (!direction) return;

            event.preventDefault();

            // if the button let go is the current key, set currect direction to null and send the stop command
            if (activeDirection.current === direction) {
                activeDirection.current = null;
                handleClick("stop");
            }
        };

        // Add the event listeners on mount
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Remove them on unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    
    return (
        <section>
            <h2>Manual Control: Can Use Arrow Keys</h2>
            <div>
                <button type="button" className="control" onClick={() => handleClick("up")}>up</button>
            </div>
            <div>
                <button type="button" className="control" onClick={() => handleClick("left")}>left</button>
                <button type="button" className="control" onClick={() => handleClick("stop")}>stop</button>
                <button type="button" className="control" onClick={() => handleClick("right")}>right</button>
            </div>
            <div>
                <button type="button" className="control" onClick={() => handleClick("down")}>down</button>
            </div>
            <div className="slidecontainer">
                <label htmlFor ="speed">Speed: </label>
                <input type="range" min="1" max="8" className="slider" id="speed" name="speed" />
            </div>
        </section>
    )
}