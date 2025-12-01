import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import MangaPage from "./pages/MangaPage/MangaPage";
import "./app.css";
import ReadManga from "./pages/ReadManga/ReadManga";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/MangaMind/" element={<Home key="home-page" />} />
        <Route path="/MangaMind/:mangaTitle/:mangaID" element={<MangaPage />} />
        <Route
          path="/MangaMind/:mangaTitle/:mangaID/:chapterID"
          element={<ReadManga />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
