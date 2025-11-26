import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    // Call the onSearch prop with the current search term
    if (onSearch) {
      console.log("Searching for:", searchTerm);
      onSearch(searchTerm);
    }
  };

  return (
    <div className=''>
      <input
        type="text"
        placeholder="Enter search term"
        value={searchTerm}
        onChange={handleInputChange}
      />
      <button onClick={handleSearchClick} className='btn btn-primary mx-5'>Search</button>
    </div>
  );
};

export default SearchBar;