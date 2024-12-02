import React, { useEffect, useState } from "react";
import axios from "axios";

const ShowList = ({ cart = [], addToCart = () => {} }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterType, setFilterType] = useState("TITLE");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/books");
        const xmlData = response.data;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "application/xml");

        const resultCode = xmlDoc.getElementsByTagName("CODE")[0]?.textContent;
        if (resultCode !== "INFO-000") {
          throw new Error(
            xmlDoc.getElementsByTagName("MESSAGE")[0]?.textContent || "API Error"
          );
        }

        const rows = xmlDoc.getElementsByTagName("row");
        const bookArray = Array.from(rows).map((row) => ({
          CTRLNO: row.getElementsByTagName("CTRLNO")[0]?.textContent || "N/A",
          TITLE: row.getElementsByTagName("TITLE")[0]?.textContent || "제목 없음",
          AUTHOR: row.getElementsByTagName("AUTHOR")[0]?.textContent || "저자 없음",
          PUBLER: row.getElementsByTagName("PUBLER")[0]?.textContent || "출판사 없음",
          AVAILABLE: "대여 가능", // 기본값 설정
        }));

        setBooks(bookArray);
        setFilteredBooks(bookArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("데이터를 가져오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (!books || books.length === 0) return;

    let updatedBooks = books;

    if (searchKeyword) {
      updatedBooks = updatedBooks.filter((book) =>
        book[filterType]?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (showAvailableOnly) {
      updatedBooks = updatedBooks.filter(
        (book) => book.AVAILABLE === "대여 가능"
      );
    }

    setFilteredBooks(updatedBooks);
  }, [searchKeyword, filterType, showAvailableOnly, books]);

  const displayedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>데이터를 불러오는 중입니다...</p>;
  if (error) return <p>오류 발생: {error}</p>;

  return (
    <div className="container">
      <h1>도서 리스트</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="검색어 입력"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <select
          onChange={(e) => setFilterType(e.target.value)}
          value={filterType}
        >
          <option value="TITLE">제목</option>
          <option value="AUTHOR">저자</option>
          <option value="PUBLER">출판사</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
          />
          대여 가능 도서만 보기
        </label>
        <button className="btn btn-primary" onClick={() => alert("장바구니 보기")}>
          장바구니 보기
        </button>
        <button className="btn btn-secondary" onClick={() => alert("대여 리스트 보기")}>
          대여 리스트 보기
        </button>
      </div>

      <div id="data-list">
        {displayedBooks.map((book) => (
          <div key={book.CTRLNO} className="book-item">
            <hr />
            <div>
              <strong>{book.TITLE}</strong>
              <p>{`${book.AUTHOR} / ${book.PUBLER}`}</p>
              <span
                style={{
                  color: book.AVAILABLE === "대여 가능" ? "green" : "red",
                }}
              >
                {book.AVAILABLE}
              </span>
            </div>
            <div>
              <button
                className="btn btn-warning"
                onClick={() => addToCart(book)}
                disabled={cart.some((item) => item.CTRLNO === book.CTRLNO)}
              >
                {cart.some((item) => item.CTRLNO === book.CTRLNO)
                  ? "장바구니에 있음"
                  : "장바구니 추가"}
              </button>
              <button
                className="btn btn-info"
                onClick={() => alert(`상세보기: ${book.TITLE}`)}
              >
                상세보기
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredBooks.length / itemsPerPage) }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`page-btn ${currentPage === pageNumber ? "active" : ""}`}
              onClick={() => changePage(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ShowList;
