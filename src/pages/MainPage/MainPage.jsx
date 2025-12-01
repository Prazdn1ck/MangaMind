import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./mainpage.css";

const MainPage = () => {
  return (
    <div className="appContainer">
      <Navbar />
      <main className="mainTopPadding siteContainer">
        <h1 className="libraryTitle">Welcome to MangaMind</h1>
        <p style={{ color: "white", textAlign: "center" }}>
          Use the search bar above to explore manga.
        </p>
      </main>
    </div>
  );
};

export default MainPage;
