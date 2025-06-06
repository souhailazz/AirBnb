import { useState, useEffect } from "react"
import axios from "axios"
import './Edit.css';

const Edit = () => {
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingApartment, setEditingApartment] = useState(null)
  const [formData, setFormData] = useState(null)
  const [photoUrlsText, setPhotoUrlsText] = useState("") // Changed to store all URLs as one text string

  // Fetch all apartments
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoading(true)

        // Make sure to set the correct Accept header to receive JSON
        const response = await axios.get("https://backend-production-886a.up.railway.app/api/Apartments", {
          headers: {
            Accept: "application/json",
          },
        })

        console.log("API Response:", response)

        // Check if we have data
        if (!response.data) {
          console.warn("No data received from API")
          setApartments([])
          setLoading(false)
          return
        }

        // Handle different response structures
        let apartmentData = response.data

        // If response is an object with apartments inside
        if (apartmentData && typeof apartmentData === "object" && !Array.isArray(apartmentData)) {
          // Check common properties where the array might be
          const possibleArrays = ["apartments", "data", "items", "results"]
          for (const key of possibleArrays) {
            if (Array.isArray(apartmentData[key])) {
              apartmentData = apartmentData[key]
              break
            }
          }
        }

        // Check and log what we found
        console.log("Processed data type:", typeof apartmentData, Array.isArray(apartmentData))

        // Ensure we're setting an array to state
        const apartmentsArray = Array.isArray(apartmentData) ? apartmentData : []

        // Handle empty array with better messaging
        if (apartmentsArray.length === 0) {
          console.log("No apartments found in the response")
        } else {
          console.log("Found apartments:", apartmentsArray.length)
        }

        console.log("Setting apartments state with:", apartmentsArray)
        setApartments(apartmentsArray)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching apartments:", err)
        setError(`Error loading apartments: ${err.message}`)
        setLoading(false)
      }
    }

    // Temporarily add retry logic for development
    const attemptFetch = () => {
      fetchApartments().catch((err) => {
        console.error("Initial fetch failed, retrying in 2 seconds...", err)
        setTimeout(attemptFetch, 2000)
      })
    }

    attemptFetch()
  }, [])

  // Fetch single apartment for editing
  const fetchApartmentDetails = async (id) => {
    try {
      setLoading(true)
      const response = await axios.get(`https://backend-production-886a.up.railway.app/api/Apartments/${id}`, {
        headers: {
          Accept: "application/json",
        },
      })
      console.log("Apartment details response:", response.data)

      // Check if we have valid data
      if (!response.data) {
        setError("Received empty response for apartment details")
        setLoading(false)
        return
      }

      // Handle the case where photos might be undefined
      const photos = response.data.photos || []

      // Initialize form data with response
      setFormData({
        ...response.data,
        checkin_heure: response.data.checkin_heure?.substring(0, 5) || "14:00",
        checkout_heure: response.data.checkout_heure?.substring(0, 5) || "11:00",
      })

      // Setup photo URLs as a single text with each URL on a new line
      const urls = photos.map((p) => p.photo_url || "")
      setPhotoUrlsText(urls.join('\n'))

      setEditingApartment(id)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching apartment details:", err)
      setError(`Error loading apartment details: ${err.message}`)
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Handle photo URLs text change
  const handlePhotoTextChange = (e) => {
    setPhotoUrlsText(e.target.value)
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Convert the text area content to an array of photo URLs
      // Split by newline and filter out empty lines
      const photoUrlsArray = photoUrlsText
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== "")

      // Format photos for API
      const formattedPhotos = photoUrlsArray.map((url) => ({ photo_url: url }))

      // Create data object for API
      const apartmentData = {
        ...formData,
        photos: formattedPhotos,
      }

      // Send update request
      await axios.put(`https://backend-production-886a.up.railway.app/api/Apartments/${editingApartment}`, apartmentData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      // Update local state and exit edit mode
      const updatedApartments = apartments.map((apt) =>
        apt.id === editingApartment ? { ...apartmentData, id: editingApartment } : apt,
      )

      setApartments(updatedApartments)
      setEditingApartment(null)
      setFormData(null)
      setLoading(false)
      alert("Apartment updated successfully!")
    } catch (err) {
      console.error("Error updating apartment:", err)
      setError(`Error updating apartment: ${err.message}`)
      setLoading(false)
      alert("Failed to update apartment: " + err.message)
    }
  }

  // Delete apartment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this apartment?")) {
      return
    }

    try {
      setLoading(true)
      await axios.delete(`/api/Apartments/${id}`, {
        headers: {
          Accept: "application/json",
        },
      })

      // Update local state
      setApartments(apartments.filter((apt) => apt.id !== id))
      setLoading(false)
      alert("Apartment deleted successfully!")
    } catch (err) {
      console.error("Error deleting apartment:", err)
      setError(`Error deleting apartment: ${err.message}`)
      setLoading(false)
      alert("Failed to delete apartment: " + err.message)
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingApartment(null)
    setFormData(null)
  }

  // Debug log
  console.log("Current apartments state:", apartments)

  // Added a direct check for empty array after loading
  if (loading && !editingApartment) return <div className="text-center p-5">Loading apartments...</div>
  if (error && !editingApartment) return <div className="text-center p-5 text-red-500">{error}</div>

  // Render apartment edit form
  if (editingApartment && formData) {
    return (
      <div className="container">
        <h1>Edit Apartment</h1>

        {loading && <div className="loading-state">Saving changes...</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Basic Information Section */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div>
                <label>Title</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>City</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label>Address</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity Section */}
          <div className="form-section">
            <h2>Pricing & Capacity</h2>
            <div className="form-grid">
              <div>
                <label>Price per Night (€)</label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label>Total Capacity</label>
                <input
                  type="number"
                  name="capacite"
                  value={formData.capacite || 0}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label>Minimum Nights</label>
                <input
                  type="number"
                  name="nombre_min_nuits"
                  value={formData.nombre_min_nuits || 1}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label>Adults</label>
                <input
                  type="number"
                  name="nbrAdultes"
                  value={formData.nbrAdultes || 0}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label>Children</label>
                <input
                  type="number"
                  name="nbrEnfants"
                  value={formData.nbrEnfants || 0}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div>
                <label>Cleaning Fee (€)</label>
                <input
                  type="number"
                  name="frais_menage"
                  value={formData.frais_menage || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="form-section">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="accepteAnimaux"
                  checked={formData.accepteAnimaux || false}
                  onChange={handleChange}
                />
                <label>Accepts Pets</label>
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="chauffage"
                  checked={formData.chauffage || false}
                  onChange={handleChange}
                />
                <label>Heating</label>
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="wifi"
                  checked={formData.wifi || false}
                  onChange={handleChange}
                />
                <label>WiFi</label>
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="television"
                  checked={formData.television || false}
                  onChange={handleChange}
                />
                <label>Television</label>
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="lave_Linge"
                  checked={formData.lave_Linge || false}
                  onChange={handleChange}
                />
                <label>Washing Machine</label>
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="cuisine_equipee"
                  checked={formData.cuisine_equipee || false}
                  onChange={handleChange}
                />
                <label>Equipped Kitchen</label>
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="form-section">
            <h2>Photos</h2>
            <div className="photo-urls-container">
              <label>Photo URLs (one per line)</label>
              <p className="text-sm text-gray-600 mb-2">Each URL will be displayed as a separate photo</p>
              <textarea
                value={photoUrlsText}
                onChange={handlePhotoTextChange}
                placeholder="Enter photo URLs, one per line"
                className="photo-urls-textarea"
                rows={8}
              />
              <div className="photo-count">
                {photoUrlsText.split('\n').filter(url => url.trim() !== "").length} photo(s)
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="action-buttons">
            <button type="button" onClick={cancelEdit} className="button button-secondary">
              Cancel
            </button>
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Render apartments list
  return (
    <div className="container">
      <h1>Manage Apartments</h1>

      {apartments.length === 0 && !loading && (
        <div className="error-state">
          <p className="font-semibold">No apartments found.</p>
          <p className="text-sm">This could be because:</p>
          <ul className="list-disc pl-5 text-sm">
            <li>The API endpoint is not returning JSON data</li>
            <li>There are no apartments in the database</li>
            <li>The apartments are stored in a different property in the response</li>
          </ul>
          <button onClick={() => window.location.reload()} className="button button-primary mt-2">
            Refresh Page
          </button>
        </div>
      )}

      <div className="table-container">
        <table>
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
            {!Array.isArray(apartments) || apartments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No apartments found
                </td>
              </tr>
            ) : (
              apartments.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.id}</td>
                  <td>{apt.titre || "N/A"}</td>
                  <td>{apt.ville || "N/A"}</td>
                  <td>{apt.prix ? `${apt.prix} €` : "N/A"}</td>
                  <td>{apt.capacite || "N/A"}</td>
                  <td className="text-center">
                    <button
                      onClick={() => fetchApartmentDetails(apt.id)}
                      className="button button-primary mr-2"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(apt.id)} className="button button-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Edit