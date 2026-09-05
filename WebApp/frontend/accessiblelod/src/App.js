import logo from './logo.svg';
import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes, Link} from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import Cloud from './pages/cloud';
import FairnessInfo from './pages/accessibility_info.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddDataset from './pages/add_dataset';
import Search from './pages/search';
import Dashboard from './pages/dashboard';
import About from './pages/about';
import AccessibilityFramework from './pages/accessibility_framework';
import ReactGA from 'react-ga4'
const GA_ID = process.env.REACT_APP_GA_ID

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

function App() {
  ReactGA.initialize(GA_ID);
  
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);
  
  
  return (
      <HashRouter>
        <Routes>
          <Route path="/" element={isMobile ? <Search /> : <Cloud />} />
          <Route path='/accessibility_info' element={<FairnessInfo />} />
          {/* <Route path='/add-dataset' element={<AddDataset />} /> */}
          <Route path='/search' element={<Search />} />
          {/* <Route path='/dashboard' element={<Dashboard />} /> */}
          <Route path='/about' element={<About />} />
          <Route path='/accessibility-framework' element={<AccessibilityFramework />} />
          <Route path='*' element={<Cloud />} /> 
        </Routes>
      </HashRouter>
  );
}

export default App;
