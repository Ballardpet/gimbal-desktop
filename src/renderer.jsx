import React from 'react';
import { createRoot } from 'react-dom/client';

import "./index.css";
import Thingy from './components/TestComponent';


const App = () => {
  return (
    <>
      <div>Hello!</div>
      <Thingy/>
      <div className="split-container">
        <div className="half left-side">
          <div>I am on the left</div>
        </div>
        <div className="half right-side">
          <div>I am on the right</div>
        </div>
      </div>
    </>
  )
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App/>);