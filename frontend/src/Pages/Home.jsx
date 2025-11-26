import SearchBar from "../components/SearchBar"
import React, { useState } from "react"
const Home = () => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (term) => {
    console.log('Searching for:', term);
    // Here you would implement your search logic,
    // like filtering a list or fetching data
    // For demonstration, let's just set some dummy results
    setSearchResults([`Result for "${term}" 1`, `Result for "${term}" 2`]);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl p-4">
        <h1>My App</h1>
        <SearchBar onSearch={handleSearch} />
        <h2>Search Results:</h2>
        {searchResults.length > 0 ? (
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        ) : (
          <p>No results yet. Search for something!</p>
        )}
      </div>
    </div>
  );
}

export default Home
