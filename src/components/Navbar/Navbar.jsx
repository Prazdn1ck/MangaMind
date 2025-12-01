import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import FoxMindImage from "../../assets/FoxMind.png";
import { IoIosSearch } from "react-icons/io";

const Navbar = ({ searchQuery, setSearchQuery, onSearch }) => {
  return (
    <header className="appHeaderContainer navbar">
      <div className="navbarInnerContainer">
        <Link to="/MangaMind/" className="navbarLogo">
          <img className="appTitleImg" src={FoxMindImage} alt="FoxMind" />
        </Link>
        <form
          className="navContainer"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="inputSearchManga"
            placeholder="Search manga..."
          />
          <button type="submit" className="searchBtn" aria-label="Search">
            <IoIosSearch />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Navbar;
