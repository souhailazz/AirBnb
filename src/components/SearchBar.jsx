import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
    const [petsAllowed, setPetsAllowed] = useState(false);
    const [location, setLocation] = useState("");
    const [adults, setAdults] = useState("");
    const [children, setChildren] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(true);
    const searchBarRef = useRef(null);

    useEffect(() => {
        const checkMobileView = () => {
            if (window.innerWidth <= 768) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        checkMobileView();

        window.addEventListener('resize', checkMobileView);

        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setIsCollapsed(true);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
        <div className="search-container">
            <button 
                className="search-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <i className="fas fa-search"></i>
            </button>
            <form 
                ref={searchBarRef}
                className={`SearchBar ${isCollapsed ? 'collapsed' : ''}`} 
                onSubmit={handleSubmit}
            >
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
        </div>
    );
};

export default SearchBar;