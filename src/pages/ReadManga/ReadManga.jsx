import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import axios from "axios";
import "./ReadManga.css";

const ReadManga = () => {
  const [mangaData, setMangaData] = useState([]);
  const [mangaHash, setMangaHash] = useState();
  const [mangaBaseURL, setMangaBaseURL] = useState();
  const [verticalMode, setVerticalMode] = useState(true);
  const [chaptersList, setChaptersList] = useState([]);
  const [currentChapter, setCurrentChapter] = useState("");
  const [showHeader, setShowHeader] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [fade, setFade] = useState(false);
  const [allPages, setAllPages] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [savedScroll, setSavedScroll] = useState(0);

  const { mangaID, mangaTitle, chapterID } = useParams();
  const verticalRef = useRef(null);
  const lastScrollY = useRef(0);
  const chapterScrollPositions = useRef({});

  const preloadImages = (urls) => {
    return Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(url);
            img.onerror = () => resolve(url);
          })
      )
    );
  };

  const normalizeChaptersFromAggregate = (data) => {
    const chapters = [];
    if (!data?.volumes) return chapters;

    Object.values(data.volumes).forEach((vol) => {
      if (!vol?.chapters) return;
      Object.values(vol.chapters).forEach((ch) => {
        const id = ch?.id ? String(ch.id) : null;
        if (!id) return;
        const title =
          ch?.title || (ch?.chapter ? `Chapter ${ch.chapter}` : "Chapter");
        chapters.push({ id, title });
      });
    });

    return Array.from(new Map(chapters.map((c) => [c.id, c])).values());
  };

  useEffect(() => {
    let cancelled = false;

    const fetchChapter = async () => {
      try {
        const res = await axios.get(
          `https://corsproxy.io/?https://api.mangadex.org/at-home/server/${chapterID}`,
          { timeout: 15000 }
        );
        if (cancelled) return;

        const chapterData = res?.data?.chapter;
        if (!chapterData) return;

        setMangaData(chapterData.data || []);
        setMangaHash(chapterData.hash);
        setMangaBaseURL(res.data.baseUrl);
        setCurrentChapter(String(chapterID));
        setCurrentPage(0);

        const pages = chapterData.data.map(
          (img) => `${res.data.baseUrl}/data/${chapterData.hash}/${img}`
        );
        const loadedPages = await preloadImages(pages);
        if (!cancelled) setAllPages(loadedPages);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchChaptersList = async () => {
      try {
        const res = await axios.get(
          `https://corsproxy.io/?https://api.mangadex.org/manga/${mangaID}/aggregate?translatedLanguage[]=en`,
          { timeout: 15000 }
        );

        if (cancelled) return;

        const chapters = normalizeChaptersFromAggregate(res.data);
        setChaptersList(chapters);

        const idx = chapters.findIndex((ch) => ch.id === String(chapterID));
        setCurrentChapterIndex(idx >= 0 ? idx : 0);

        if (!currentChapter) setCurrentChapter(String(chapterID));
      } catch (err) {
        console.error(err);
      }
    };

    fetchChapter();
    fetchChaptersList();

    return () => {
      cancelled = true;
    };
  }, [chapterID, mangaID]);

  const MAX_LOADED_CHAPTERS = 3;

  const loadNextChapter = async () => {
    if (isLoadingChapter) return;
    if (!chaptersList.length) return;

    const nextIndex = currentChapterIndex + 1;
    if (nextIndex >= chaptersList.length) return;

    setIsLoadingChapter(true);

    const nextId = chaptersList[nextIndex].id;

    try {
      const res = await axios.get(
        `https://corsproxy.io/?https://api.mangadex.org/at-home/server/${nextId}`,
        { timeout: 15000 }
      );

      const chapterData = res?.data?.chapter;
      if (!chapterData) throw new Error();

      const nextPages = chapterData.data.map(
        (img) => `${res.data.baseUrl}/data/${chapterData.hash}/${img}`
      );

      const loadedPages = await preloadImages(nextPages);

      setAllPages((prev) => {
        const updated = [...prev, ...loadedPages];
        const maxPages = MAX_LOADED_CHAPTERS * 50;
        if (updated.length > maxPages) {
          return updated.slice(-maxPages);
        }
        return updated;
      });

      setCurrentChapterIndex(nextIndex);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingChapter(false);
    }
  };

  useEffect(() => {
    if (!verticalMode) return;

    const handleScroll = () => {
      const pos = window.scrollY + window.innerHeight;
      const height = document.documentElement.scrollHeight;
      if (pos >= height - 300) loadNextChapter();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [verticalMode, allPages, currentChapterIndex, isLoadingChapter]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleModeSwitch = () => {
    if (verticalMode && verticalRef.current) {
      setSavedScroll(window.scrollY);
    }
    setVerticalMode((prev) => !prev);
    setTimeout(() => {
      if (!verticalMode) {
        window.scrollTo({ top: savedScroll, behavior: "smooth" });
      } else {
        verticalRef.current.scrollTo({
          top: verticalRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  const handleChapterSelect = async (chapterId) => {
    chapterScrollPositions.current[currentChapter] = window.scrollY;

    setCurrentChapter(chapterId);
    setIsLoadingChapter(true);

    try {
      const res = await axios.get(
        `https://corsproxy.io/?https://api.mangadex.org/at-home/server/${chapterId}`,
        { timeout: 15000 }
      );

      const chapterData = res?.data?.chapter;
      if (!chapterData) return;

      const pages = chapterData.data.map(
        (img) => `${res.data.baseUrl}/data/${chapterData.hash}/${img}`
      );

      const loadedPages = await preloadImages(pages);

      setAllPages(loadedPages);

      const idx = chaptersList.findIndex((c) => c.id === chapterId);
      setCurrentChapterIndex(idx >= 0 ? idx : 0);
    } catch (err) {
      console.error(err);
    }

    setIsLoadingChapter(false);

    const saved = chapterScrollPositions.current[chapterId] || 0;
    window.scrollTo({ top: saved, behavior: "smooth" });
  };

  const handlePageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const middle = rect.width / 2;

    if (clickX < middle) {
      setCurrentPage((prev) => {
        if (prev === 0 && currentChapterIndex > 0) {
          handleChapterSelect(chaptersList[currentChapterIndex - 1].id);
          return prev;
        }
        return prev - 1;
      });
    } else {
      setCurrentPage((prev) => {
        if (prev === allPages.length - 1) {
          loadNextChapter();
          return prev;
        }
        return prev + 1;
      });
    }
  };

  useEffect(() => {
    if (verticalMode) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => {
          if (prev === 0 && currentChapterIndex > 0) {
            handleChapterSelect(chaptersList[currentChapterIndex - 1].id);
            return prev;
          }
          return prev - 1;
        });
      } else if (e.key === "ArrowRight") {
        setCurrentPage((prev) => {
          if (prev === allPages.length - 1) {
            loadNextChapter();
            return prev;
          }
          return prev + 1;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [verticalMode, currentChapterIndex, allPages]);

  return (
    <div className="readMangaContainer">
      {!allPages.length || !mangaBaseURL ? (
        <h2>Loading...</h2>
      ) : (
        <>
          <Link
            to={`/MangaMind/${mangaTitle}/${mangaID}`}
            className="backBtnFloating"
          >
            <IoChevronBack />
          </Link>

          <div className="container">
            <div
              className={`floatingHeader ${showHeader ? "visible" : "hidden"}`}
            >
              <span className="currentChapterTitle">
                {chaptersList[currentChapterIndex]?.title || "Chapter"}
              </span>

              <select
                className="chapterSelect"
                value={currentChapter}
                onChange={(e) => handleChapterSelect(e.target.value)}
              >
                {chaptersList.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>

              <button className="modeSwitchBtn" onClick={handleModeSwitch}>
                {verticalMode ? "Classic" : "Vertical"}
              </button>
            </div>

            {verticalMode ? (
              <div className="verticalScrollContainer" ref={verticalRef}>
                {allPages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Page ${index + 1}`}
                    className={`mangaPageImage ${fade ? "fade-in" : ""}`}
                    onLoad={() => setFade(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="mangaImageContainer">
                <img
                  src={allPages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className={`mangaPageImage ${fade ? "fade-in" : ""}`}
                  onLoad={() => setFade(true)}
                  onClick={handlePageClick}
                />
                <p className="pageCounter">
                  {currentPage + 1} / {allPages.length}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReadManga;
