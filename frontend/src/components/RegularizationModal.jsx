import React, { useState } from "react";
import { X, Clock, CheckSquare } from "lucide-react";
import API from "../services/api";

const RegularizationModal = ({ isOpen, onClose, onSuccess, attendanceRecord }) => {
  const [formData, setFormData] = useState({
    requestedPunchIn: "",
    requestedPunchOut: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await API.post("/regularization", {
        attendanceId: attendanceRecord?._id || null,
        requestedPunchIn: formData.requestedPunchIn ? new Date(formData.requestedPunchIn).toISOString() : null,
        requestedPunchOut: formData.requestedPunchOut ? new Date(formData.requestedPunchOut).toISOString() : null,
        reason: formData.reason,
      });

      setFormData({ requestedPunchIn: "", requestedPunchOut: "", reason: "" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit regularization request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={20} className="text-primary" /> Request Attendance Regularization
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Corrected Punch-In Time</label>
              <input
                type="datetime-local"
                name="requestedPunchIn"
                className="form-control"
                value={formData.requestedPunchIn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Corrected Punch-Out Time</label>
              <input
                type="datetime-local"
                name="requestedPunchOut"
                className="form-control"
                value={formData.requestedPunchOut}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Correction</label>
            <textarea
              name="reason"
              rows={3}
              className="form-control"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explain why punch in/out was missed or incorrect..."
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <CheckSquare size={16} />
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegularizationModal;
