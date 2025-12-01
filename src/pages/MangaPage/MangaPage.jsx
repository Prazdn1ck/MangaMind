import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import axios from "axios";
import "./mangaPage.css";

const MangaPage = () => {
  const [volumeChaptersData, setVolumeChaptersData] = useState({});
  const [mangaData, setMangaData] = useState({});
  const [languageSelected, setLanguageSelected] = useState("en");
  const [loadingChapters, setLoadingChapters] = useState(false);
  const { mangaTitle, mangaID } = useParams();

  const fetchVolumesChaptersData = async (lang) => {
    setLoadingChapters(true);
    try {
      const res = await axios.get(
        `https://corsproxy.io/?https://api.mangadex.dev/manga/${mangaID}/aggregate?translatedLanguage%5B%5D=${lang}`
      );
      setVolumeChaptersData(res.data.volumes || {});
    } catch (err) {
      console.error(err);
      setVolumeChaptersData({});
    } finally {
      setLoadingChapters(false);
    }
  };

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await axios.get(
          `https://corsproxy.io/?https://api.mangadex.org/manga/${mangaID}?includes%5B%5D=cover_art&includes%5B%5D=author`
        );
        setMangaData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchManga();
    fetchVolumesChaptersData(languageSelected);
  }, [languageSelected, mangaID]);

  if (!mangaData?.attributes) return <h2>Loading...</h2>;

  const coverFile = mangaData.relationships?.find(
    (rel) => rel.type === "cover_art"
  )?.attributes?.fileName;
  const coverUrl = `https://uploads.mangadex.org/covers/${mangaData.id}/${coverFile}`;

  const sortedChapters = (chapters) =>
    Object.values(chapters).sort((a, b) => {
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      if (numA === numB && a.chapter && b.chapter) {
        return a.chapter.localeCompare(b.chapter, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return numA - numB;
    });

  return (
    <div className="mangaPage">
      <header
        className="mangaHeader"
        style={{ backgroundImage: `url(${coverUrl})` }}
      >
        <div className="overlay" />
        <Link to={`/MangaMind/`} className="backBtn">
          <IoChevronBack />
        </Link>
        <div className="mangaHeaderContent">
          <img src={coverUrl} alt={mangaTitle} className="mangaCover" />
          <div className="mangaInfo">
            <h1 className="mangaTitle">{mangaTitle}</h1>
            <p className="mangaAuthor">
              {mangaData.relationships?.find((r) => r.type === "author")
                ?.attributes?.name || "Unknown Author"}
            </p>
            <p className="mangaDesc">
              {mangaData.attributes.description[languageSelected] ||
                mangaData.attributes.description.en ||
                "No description available."}
            </p>
            <div className="tags">
              {mangaData.attributes.tags.slice(0, 6).map((tag, i) => (
                <span key={i} className="tag">
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="chaptersSection">
        <div className="chapterHeader">
          <h2>Volumes & Chapters</h2>
          <select
            value={languageSelected}
            onChange={(e) => setLanguageSelected(e.target.value)}
            className="langSelect"
          >
            <option value="en">English</option>
            <option value="uk">Ukrainian</option>
            <option value="pt-br">Português</option>
            <option value="ja">日本語</option>
            <option value="ru">Русский</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
        {loadingChapters ? (
          <p className="noChapters">Loading chapters...</p>
        ) : Object.keys(volumeChaptersData).length === 0 ? (
          <p className="noChapters">No chapters available for this language.</p>
        ) : (
          Object.values(volumeChaptersData).map((volume, vIndex) => (
            <div key={volume.volume || vIndex} className="volumeBlock">
              <h3 className="volumeTitle">Volume {volume.volume || "?"}</h3>
              <div className="chaptersGrid">
                {sortedChapters(volume.chapters).map((ch) => (
                  <Link
                    to={`/MangaMind/${mangaTitle}/${mangaID}/${ch.id}`}
                    key={ch.id}
                    className="chapterCard"
                  >
                    <p className="chapterNumber">Chapter {ch.chapter || "?"}</p>
                    {ch.title && <p className="chapterTitle">{ch.title}</p>}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default MangaPage;
