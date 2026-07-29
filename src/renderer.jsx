import React from 'react';
import { createRoot } from 'react-dom/client';

import "./index.css";
import Title from './components/Title';
import Manual_Control from './components/Manual_Control';
import Display from './components/Display';
import Az_el from './components/Az_el';
import GPS from './components/GPS';

// GPS pointing stuff might all need to be in here. Idk how else I'd share
// that information if I want gps point to be in one half and tracking to be in the other

const App = () => {
  return (
    <>
      <div className="split-container">
        <div className="half left-side">
          <Title/>
          <Manual_Control/>
          <Az_el/>
          <Display/>
        </div>
        <div className="half right-side">
          <GPS/>
        </div>
      </div>
    </>
  )
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App/>);