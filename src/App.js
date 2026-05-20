import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Home from "./Home";
import Select from "./Select";
import Mode from "./Mode";
import Game from "./Game";
import Result from "./Result";
import Multiplay from "./Multiplay";
import MistakeStats from "./MistakeStats";
import Settings from "./Settings";
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src =
      "https://www.googletagmanager.com/gtag/js?id=G-9BV2543QVK";
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9BV2543QVK');
    `;
    document.head.appendChild(script2);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/select" element={<Select />} />
        <Route path="/mode" element={<Mode />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
        <Route path="/multiplay" element={<Multiplay />} />
        <Route path="/mistakes" element={<MistakeStats />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter basename="/">
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
