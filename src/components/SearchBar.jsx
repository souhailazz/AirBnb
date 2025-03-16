import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
    const [petsAllowed, setPetsAllowed] = useState(false);
    const [location, setLocation] = useState("");
    const [adults, setAdults] = useState("");
    const [children, setChildren] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create search params object
        const searchParams = {
            location: location || "",
            adults: adults || "",
            children: children || "",
            pets: petsAllowed
        };
        
        // Call the parent's onSearch function with the search params
        onSearch(searchParams);
    };

    return (
        <form className="SearchBar" onSubmit={handleSubmit}>
            <div className="InputContainer">
                <i className="fas fa-map-marker-alt"></i>
                <input 
                    type="text" 
                    placeholder="Lieu" 
                    name="location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            <div className="InputContainer">
                <i className="fas fa-user"></i>
                <input 
                    type="number" 
                    placeholder="Adultes" 
                    name="adults" 
                    min="0" 
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                />
            </div>

            <div className="InputContainer">
                <i className="fas fa-child"></i>
                <input 
                    type="number" 
                    placeholder="Enfants" 
                    name="children" 
                    min="0" 
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                />
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