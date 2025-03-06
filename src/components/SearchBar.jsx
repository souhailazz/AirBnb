import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
    const [petsAllowed, setPetsAllowed] = useState(false);

    return (
        <form className="SearchBar" onSubmit={onSearch}>
          
            <div className="InputContainer">
                <i className="fas fa-map-marker-alt"></i>
                <input type="text" placeholder="Lieu" name="location" />
            </div>

            <div className="InputContainer">
                <i className="fas fa-user"></i>
                <input type="number" placeholder="Adultes" name="adults" min="0" />
            </div>

          
            <div className="InputContainer">
                <i className="fas fa-child"></i>
                <input type="number" placeholder="Enfants" name="children" min="0" />
            </div>

           
            <label className="CheckboxContainer">
                <input
                    type="checkbox"
                    name="pets"
                    checked={petsAllowed}
                    onChange={(e) => setPetsAllowed(e.target.checked)}
                />
                <i className="fas fa-paw"></i> Animaux autorisés
            </label>

            
            <button type="submit">
                <i className="fas fa-search"></i> Rechercher
            </button>
        </form>
    );
};

export default SearchBar;
