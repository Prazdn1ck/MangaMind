import { Link } from "react-router-dom";
import React from "react";
import "./ListItem.css";

export const ListItem = ({ manga }) => {
  const mangaTitle = manga.attributes.title.en || manga.attributes.title.ja;
  const coverFile = manga.relationships.find((rel) => rel.type === "cover_art")
    .attributes.fileName;

  return (
    <li className="itemContainer">
      <Link to={`/MangaMind/${mangaTitle}/${manga.id}`} className="coverLink">
        <img
          className="mangaCoverImg"
          src={`https://uploads.mangadex.org/covers/${manga.id}/${coverFile}`}
          alt={mangaTitle}
        />
      </Link>
      <div className="listItem">
        <Link
          to={`/MangaMind/${mangaTitle}/${manga.id}`}
          className="listItemLink"
        >
          {mangaTitle.length > 40
            ? mangaTitle.slice(0, 40) + "..."
            : mangaTitle}
        </Link>
      </div>
    </li>
  );
};
