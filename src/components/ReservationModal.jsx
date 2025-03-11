import { useState } from "react"
import "./ReservationModal.css"

const ReservationModal = ({ onConfirm, onClose }) => {
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [pets, setPets] = useState(0)

  const handleConfirm = () => {
    onConfirm({ adults, children, pets })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <h2>Reservation Details</h2>
          <div className="form-group">
            <label htmlFor="adults">
              Adults:
              <input
                id="adults"
                type="number"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                min="1"
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="children">
              Children:
              <input
                id="children"
                type="number"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                min="0"
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="pets">
              Pets:
              <input id="pets" type="number" value={pets} onChange={(e) => setPets(Number(e.target.value))} min="0" />
            </label>
          </div>
          <div className="button-group">
            <button className="btn-confirm" onClick={handleConfirm}>
              Confirm
            </button>
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationModal
