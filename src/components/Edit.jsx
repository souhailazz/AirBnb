
import { useState, useEffect } from "react"
import axios from "axios"
import './Edit.css';

const Edit = () => {
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingApartment, setEditingApartment] = useState(null)
  const [formData, setFormData] = useState(null)
  const [photoUrls, setPhotoUrls] = useState([""])

  // Fetch all apartments
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoading(true)

        // Make sure to set the correct Accept header to receive JSON
        const response = await axios.get("http://localhost:5276/api/Apartments", {
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
      const response = await axios.get(`http://localhost:5276/api/Apartments/${id}`, {
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

      // Setup photo URLs
      const urls = photos.map((p) => p.photo_url || "")
      setPhotoUrls(urls.length > 0 ? urls : [""])

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

  // Handle photo URL changes
  const handlePhotoChange = (index, value) => {
    const newPhotoUrls = [...photoUrls]
    newPhotoUrls[index] = value
    setPhotoUrls(newPhotoUrls)
  }

  // Add new photo URL field
  const addPhotoField = () => {
    setPhotoUrls([...photoUrls, ""])
  }

  // Remove photo URL field
  const removePhotoField = (index) => {
    const newPhotoUrls = photoUrls.filter((_, i) => i !== index)
    setPhotoUrls(newPhotoUrls.length > 0 ? newPhotoUrls : [""])
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Format photos for API
      const formattedPhotos = photoUrls.filter((url) => url.trim() !== "").map((url) => ({ photo_url: url }))

      // Create data object for API
      const apartmentData = {
        ...formData,
        photos: formattedPhotos,
      }

      // Send update request
      await axios.put(`http://localhost:5276/api/Apartments/${editingApartment}`, apartmentData, {
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
      <>
        
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Edit Apartment</h1>

          {loading && <div className="text-center p-2">Saving changes...</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Title</label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">City</label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1">Address</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded h-32"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Capacity Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Pricing & Capacity</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Price per Night (€)</label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix || 0}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Total Capacity</label>
                  <input
                    type="number"
                    name="capacite"
                    value={formData.capacite || 0}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Minimum Nights</label>
                  <input
                    type="number"
                    name="nombre_min_nuits"
                    value={formData.nombre_min_nuits || 1}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Adults</label>
                  <input
                    type="number"
                    name="nbrAdultes"
                    value={formData.nbrAdultes || 0}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Children</label>
                  <input
                    type="number"
                    name="nbrEnfants"
                    value={formData.nbrEnfants || 0}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-1">Cleaning Fee (€)</label>
                  <input
                    type="number"
                    name="frais_menage"
                    value={formData.frais_menage || 0}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="accepteAnimaux"
                    checked={formData.accepteAnimaux || false}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5"
                  />
                  <label>Accepts Pets</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="chauffage"
                    checked={formData.chauffage || false}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5"
                  />
                  <label>Heating</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={formData.wifi || false}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5"
                  />
                  <label>WiFi</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="television"
                    checked={formData.television || false}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5"
                  />
                  <label>Television</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="lave_Linge"
                    checked={formData.lave_Linge || false}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5"
                  />
                  <label>Washing Machine</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="cuisine_equipee"
                    checked={formData.cuisine_equipee || false}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5"
                  />
                  <label>Equipped Kitchen</label>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Photos</h2>

              {photoUrls.map((url, index) => (
                <div key={index} className="flex items-center mb-2 gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                    placeholder="Photo URL"
                    className="flex-grow p-2 border rounded"
                  />

                  <button
                    type="button"
                    onClick={() => removePhotoField(index)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" onClick={addPhotoField} className="bg-blue-500 text-white p-2 rounded mt-2">
                Add Photo URL
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between">
              <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white p-3 rounded">
                Cancel
              </button>

              <button type="submit" className="bg-green-600 text-white p-3 rounded" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </>
    )
  }

  // Render apartments list with better error handling
  return (
    <>
      
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Manage Apartments</h1>

        {/* Check App state debugging */}
        {apartments.length === 0 && !loading && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
            <p className="font-semibold">No apartments found.</p>
            <p className="text-sm">This could be because:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>The API endpoint is not returning JSON data</li>
              <li>There are no apartments in the database</li>
              <li>The apartments are stored in a different property in the response</li>
            </ul>
            <button onClick={() => window.location.reload()} className="mt-2 bg-blue-500 text-white py-1 px-3 rounded">
              Refresh Page
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">ID</th>
                <th className="py-2 px-4 border text-left">Title</th>
                <th className="py-2 px-4 border text-left">City</th>
                <th className="py-2 px-4 border text-left">Price</th>
                <th className="py-2 px-4 border text-left">Capacity</th>
                <th className="py-2 px-4 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(apartments) || apartments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 px-4 border text-center">
                    No apartments found
                  </td>
                </tr>
              ) : (
                apartments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{apt.id}</td>
                    <td className="py-2 px-4 border">{apt.titre || "N/A"}</td>
                    <td className="py-2 px-4 border">{apt.ville || "N/A"}</td>
                    <td className="py-2 px-4 border">{apt.prix ? `${apt.prix} €` : "N/A"}</td>
                    <td className="py-2 px-4 border">{apt.capacite || "N/A"}</td>
                    <td className="py-2 px-4 border text-center">
                      <button
                        onClick={() => fetchApartmentDetails(apt.id)}
                        className="bg-blue-500 text-white py-1 px-3 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(apt.id)} className="bg-red-500 text-white py-1 px-3 rounded">
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
    </>
  )
}

export default Edit

