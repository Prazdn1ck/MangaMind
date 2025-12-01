// MangaList.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import { ListItem } from "../../components/ListItem/ListItem";

function MangaList() {
  const [mangaList, setMangaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmedQuery, setConfirmedQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      setConfirmedQuery(query);
      fetchMangaList(query);
    }
  }, []);

  const fetchMangaList = async (queryParam) => {
    const queryToUse = queryParam ?? searchQuery;
    if (!queryToUse) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `https://corsproxy.io/?https://api.mangadex.dev/manga?limit=15&title=${encodeURIComponent(
          queryToUse
        )}&includes[]=author&includes[]=cover_art`
      );
      setMangaList(res.data.data || []);
      setSearchParams({ q: queryToUse });
      setConfirmedQuery(queryToUse);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appContainer">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => fetchMangaList()}
      />
      <main className="mainTopPadding siteContainer">
        {loading && <p className="infoText">Loading...</p>}
        {error && <p className="errorText">{error}</p>}
        {confirmedQuery && <h2 className="libraryTitle">Manga Library</h2>}
        {!loading && !mangaList.length && confirmedQuery && (
          <p className="infoText">No results for «{confirmedQuery}»</p>
        )}
        <ul className="listContainer">
          {mangaList.map((manga, index) => (
            <ListItem manga={manga} key={index} />
          ))}
        </ul>
      </main>
    </div>
  );
}

export default MangaList;
