import { useState } from 'react'
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import heroImg from './assets/hero.png'
import NavBar from "./components/Navbar";
import Home from "./components/Home";
import Map from "./components/Map";
import MyTrees from "./components/MyTrees";
import NoPageFound from "./components/NoPageFound";

import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import "./components/Navbar.css"

function App() {

  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/trees" element={<MyTrees />} />
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
