import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from "./components/Navbar";
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import Map from "./components/Map";
import MyTrees from "./components/MyTrees";
import NoPageFound from "./components/NoPageFound";

import './App.css'
import "./components/Navbar.css"

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/trees" element={<MyTrees />} />
        <Route path="*" element={<NoPageFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
  )
}

export default App
