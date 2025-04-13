import React, { useState } from 'react';
import './ReservationModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faUser, faChild, faPaw, faCalendarAlt, faTimes, faCheck, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const ReservationModal = ({ onConfirm, onClose, loading, error, success }) => {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ adults, children, pets });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content reservation-modal">
        <div className="modal-header">
          <h2><FontAwesomeIcon icon={faCalendarAlt} /> Reservation Details</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={loading || success}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {success && (
          <div className="reservation-success">
            <FontAwesomeIcon icon={faCheckCircle} size="2x" />
            <div>
              <h3>Reservation Created Successfully!</h3>
              <p>Redirecting you to payment page...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="reservation-error">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="adults">
                <FontAwesomeIcon icon={faUser} /> Adults:
              </label>
              <div className="input-counter">
                <button 
                  type="button" 
                  onClick={() => adults > 1 && setAdults(adults - 1)}
                  disabled={loading || adults <= 1}
                  className="counter-button"
                >
                  -
                </button>
                <input
                  type="number"
                  id="adults"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setAdults(adults + 1)}
                  disabled={loading}
                  className="counter-button"
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="children">
                <FontAwesomeIcon icon={faChild} /> Children:
              </label>
              <div className="input-counter">
                <button 
                  type="button" 
                  onClick={() => children > 0 && setChildren(children - 1)}
                  disabled={loading || children <= 0}
                  className="counter-button"
                >
                  -
                </button>
                <input
                  type="number"
                  id="children"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setChildren(children + 1)}
                  disabled={loading}
                  className="counter-button"
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pets">
                <FontAwesomeIcon icon={faPaw} /> Pets:
              </label>
              <div className="input-counter">
                <button 
                  type="button" 
                  onClick={() => pets > 0 && setPets(pets - 1)}
                  disabled={loading || pets <= 0}
                  className="counter-button"
                >
                  -
                </button>
                <input
                  type="number"
                  id="pets"
                  min="0"
                  value={pets}
                  onChange={(e) => setPets(Math.max(0, Number(e.target.value)))}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setPets(pets + 1)}
                  disabled={loading}
                  className="counter-button"
                >
                  +
                </button>
              </div>
            </div>

            <div className="button-group">
              <button 
                type="button" 
                onClick={onClose} 
                className="cancel-button"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
              <button 
                type="submit" 
                className="confirm-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span> Processing...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} /> Confirm Reservation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservationModal;