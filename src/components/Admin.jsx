import { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css"; // Import the CSS file

const Admin = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    adresse: "",
    ville: "",
    prix: 0,
    capacite: 1,
    nbrAdultes: 1,
    nbrEnfants: 0,
    accepteAnimaux: false,
    latitude: 0,
    longitude: 0,
    frais_menage: 0,
    max_animaux: 0,
    surface: 0,
    balcon_surface: 0,
    chauffage: false,
    wifi: false,
    television: false,
    lave_Linge: false,
    seche_cheveux: false,
    cuisine_equipee: false,
    parking_payant: false,
    petit_dejeuner_inclus: false,
    lit_parapluie: false,
    menage_disponible: false,
    nombre_min_nuits: 1,
    remise_semaine: 0,
    remise_mois: 0,
    checkin_heure: "14:00",
    checkout_heure: "11:00",
    politique_annulation: "",
    depart_instructions: "",
    regles_maison: "",
    photos: [{ photo_url: "" }],
  });

  // Fetch existing apartments
  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5276/api/Apartments");
      setApartments(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch apartments");
      setLoading(false);
      console.error("Error fetching apartments:", err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle photo URL changes
  const handlePhotoChange = (index, value) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos[index] = { photo_url: value };

    setFormData((prev) => ({
      ...prev,
      photos: updatedPhotos,
    }));
  };

  // Add new photo field
  const handleAddPhotoField = () => {
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, { photo_url: "" }],
    }));
  };

  // Remove photo field
  const handleRemovePhotoField = (index) => {
    if (formData.photos.length > 1) {
      const updatedPhotos = formData.photos.filter((_, i) => i !== index);

      setFormData((prev) => ({
        ...prev,
        photos: updatedPhotos,
      }));
    }
  };

  // Move to next step
  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Move to previous step
  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Toggle form visibility
  const toggleFormVisibility = () => {
    setShowForm(!showForm);
    // Reset form and step when toggling
    if (!showForm) {
      setCurrentStep(1);
    }
  };

  // Submit form to create apartment
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Transform the data to match the API's expected format
      const submitData = {
        ...formData,
        titre: formData.titre,
        description: formData.description,
        adresse: formData.adresse,
        ville: formData.ville,
        prix: Number.parseFloat(formData.prix),
        capacite: Number.parseInt(formData.capacite),
        nbrAdultes: Number.parseInt(formData.nbrAdultes),
        nbrEnfants: Number.parseInt(formData.nbrEnfants),
        accepteAnimaux: formData.accepteAnimaux,
        latitude: Number.parseFloat(formData.latitude),
        longitude: Number.parseFloat(formData.longitude),
        frais_menage: Number.parseFloat(formData.frais_menage),
        max_animaux: Number.parseInt(formData.max_animaux),
        surface: Number.parseFloat(formData.surface),
        balcon_surface: Number.parseFloat(formData.balcon_surface),
        chauffage: formData.chauffage,
        wifi: formData.wifi,
        television: formData.television,
        lave_Linge: formData.lave_Linge,
        seche_cheveux: formData.seche_cheveux,
        cuisine_equipee: formData.cuisine_equipee,
        parking_payant: formData.parking_payant,
        petit_dejeuner_inclus: formData.petit_dejeuner_inclus,
        lit_parapluie: formData.lit_parapluie,
        menage_disponible: formData.menage_disponible,
        nombre_min_nuits: Number.parseInt(formData.nombre_min_nuits),
        remise_semaine: Number.parseFloat(formData.remise_semaine),
        remise_mois: Number.parseFloat(formData.remise_mois),
        checkin_heure: formData.checkin_heure,
        checkout_heure: formData.checkout_heure,
        politique_annulation: formData.politique_annulation,
        depart_instructions: formData.depart_instructions,
        regles_maison: formData.regles_maison,
        photos: formData.photos.filter((photo) => photo.photo_url.trim() !== ""),
      };

      // Send the data to the API
      const response = await axios.post("http://localhost:5276/api/Apartments", submitData);

      console.log("Apartment created:", response.data);
      setSuccessMessage("Apartment created successfully!");

      // Reset the form and hide it
      setFormData({
        titre: "",
        description: "",
        adresse: "",
        ville: "",
        prix: 0,
        capacite: 1,
        nbrAdultes: 1,
        nbrEnfants: 0,
        accepteAnimaux: false,
        latitude: 0,
        longitude: 0,
        frais_menage: 0,
        max_animaux: 0,
        surface: 0,
        balcon_surface: 0,
        chauffage: false,
        wifi: false,
        television: false,
        lave_Linge: false,
        seche_cheveux: false,
        cuisine_equipee: false,
        parking_payant: false,
        petit_dejeuner_inclus: false,
        lit_parapluie: false,
        menage_disponible: false,
        nombre_min_nuits: 1,
        remise_semaine: 0,
        remise_mois: 0,
        checkin_heure: "14:00",
        checkout_heure: "11:00",
        politique_annulation: "",
        depart_instructions: "",
        regles_maison: "",
        photos: [{ photo_url: "" }],
      });
      setShowForm(false);
      setCurrentStep(1);

      // Refresh apartment list
      fetchApartments();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to create apartment");
      console.error("Error creating apartment:", err);
    }
  };

  // Delete apartment
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this apartment?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5276/api/Apartments/${id}`);

        // Refresh apartment list
        fetchApartments();

        setSuccessMessage("Apartment deleted successfully!");

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);

        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to delete apartment");
        console.error("Error deleting apartment:", err);
      }
    }
  };

  // Render form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3 className="step-title">Step 1: Basic Information</h3>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Surface Area (m²)</label>
              <input
                type="number"
                name="surface"
                value={formData.surface}
                onChange={handleInputChange}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Balcony Surface (m²)</label>
              <input
                type="number"
                name="balcon_surface"
                value={formData.balcon_surface}
                onChange={handleInputChange}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className="form-input"
                step="0.000001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className="form-input"
                step="0.000001"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={toggleFormVisibility} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleNextStep} className="btn btn-primary">
                Next Step
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3 className="step-title">Step 2: Pricing and Amenities</h3>

            <div className="form-group">
              <label className="form-label">Price (€/night)</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cleaning Fee (€)</label>
              <input
                type="number"
                name="frais_menage"
                value={formData.frais_menage}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Capacity</label>
              <input
                type="number"
                name="capacite"
                value={formData.capacite}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Adults</label>
              <input
                type="number"
                name="nbrAdultes"
                value={formData.nbrAdultes}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Children</label>
              <input
                type="number"
                name="nbrEnfants"
                value={formData.nbrEnfants}
                onChange={handleInputChange}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Nights Stay</label>
              <input
                type="number"
                name="nombre_min_nuits"
                value={formData.nombre_min_nuits}
                onChange={handleInputChange}
                className="form-input"
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weekly Discount (%)</label>
              <input
                type="number"
                name="remise_semaine"
                value={formData.remise_semaine}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Discount (%)</label>
              <input
                type="number"
                name="remise_mois"
                value={formData.remise_mois}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-in Time</label>
              <input
                type="time"
                name="checkin_heure"
                value={formData.checkin_heure}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-out Time</label>
              <input
                type="time"
                name="checkout_heure"
                value={formData.checkout_heure}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <h4>Amenities</h4>
            <div className="checkbox-grid">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="accepteAnimaux"
                    checked={formData.accepteAnimaux}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Pets Allowed</span>
                </label>
              </div>

              {formData.accepteAnimaux && (
                <div className="form-group">
                  <label className="form-label">Max Number of Pets</label>
                  <input
                    type="number"
                    name="max_animaux"
                    value={formData.max_animaux}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="chauffage"
                    checked={formData.chauffage}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Heating</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={formData.wifi}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>WiFi</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="television"
                    checked={formData.television}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>TV</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="lave_Linge"
                    checked={formData.lave_Linge}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Washing Machine</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="seche_cheveux"
                    checked={formData.seche_cheveux}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Hair Dryer</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="cuisine_equipee"
                    checked={formData.cuisine_equipee}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Equipped Kitchen</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="parking_payant"
                    checked={formData.parking_payant}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Paid Parking</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="petit_dejeuner_inclus"
                    checked={formData.petit_dejeuner_inclus}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Breakfast Included</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="lit_parapluie"
                    checked={formData.lit_parapluie}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Baby Crib</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="menage_disponible"
                    checked={formData.menage_disponible}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Cleaning Service</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handlePrevStep} className="btn btn-secondary">
                Previous Step
              </button>
              <button type="button" onClick={handleNextStep} className="btn btn-primary">
                Next Step
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3 className="step-title">Step 3: Rules and Photos</h3>

            <div className="form-group">
              <label className="form-label">House Rules</label>
              <textarea
                name="regles_maison"
                value={formData.regles_maison}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Departure Instructions</label>
              <textarea
                name="depart_instructions"
                value={formData.depart_instructions}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Cancellation Policy</label>
              <textarea
                name="politique_annulation"
                value={formData.politique_annulation}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <h4>Photos</h4>
            {formData.photos.map((photo, index) => (
              <div key={index} className="photo-input-group">
                <input
                  type="text"
                  value={photo.photo_url}
                  onChange={(e) => handlePhotoChange(index, e.target.value)}
                  placeholder="Photo URL"
                  className="form-input"
                />

                <button
                  type="button"
                  onClick={() => handleRemovePhotoField(index)}
                  className="btn btn-danger btn-icon"
                  disabled={formData.photos.length === 1}
                >
                  <svg className="mr-1" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={handleAddPhotoField} className="btn btn-primary btn-icon">
              <svg className="mr-1" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Photo
            </button>

            <div className="form-actions mt-6">
              <button type="button" onClick={handlePrevStep} className="btn btn-secondary">
                Previous Step
              </button>
              <button type="submit" className="btn btn-success btn-icon" disabled={loading}>
                {loading ? (
                  <>
                    <svg
                      className="spinner mr-2"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="mr-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Create Apartment
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h1>Apartment Administration</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success">
          <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Add Apartment Button */}
      {!showForm && (
        <button
          type="button"
          onClick={toggleFormVisibility}
          className="btn btn-primary btn-lg btn-icon mb-6"
        >
          <svg className="mr-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New Apartment
        </button>
      )}

      {/* Multi-step Form */}
      {showForm && (
        <div className="card">
          <div className="steps-indicator">
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <div className="step-title">Basic Info</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <div className="step-title">Pricing & Amenities</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <div className="step-title">Rules & Photos</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderFormStep()}
          </form>
        </div>
      )}

      {/* List of Apartments */}
      <div className="card mt-6">
        <h2>Existing Apartments</h2>

        {loading && !showForm ? (
          <p>Loading apartments...</p>
        ) : apartments.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>City</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map((apartment) => (
                  <tr key={apartment.id}>
                    <td>{apartment.id}</td>
                    <td className="font-medium">{apartment.titre}</td>
                    <td>{apartment.ville}</td>
                    <td>€{apartment.prix}</td>
                    <td>{apartment.capacite}</td>
                    <td>
                      <button onClick={() => handleDelete(apartment.id)} className="btn btn-danger btn-icon">
                        <svg
                          className="mr-1"
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic py-4">No apartments found.</p>
        )}
      </div>
    </div>
  );
};

export default Admin;