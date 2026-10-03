import React, { useState } from "react";
import { X, Calendar, Send } from "lucide-react";
import API from "../services/api";

const LeaveModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: "Sick",
    startDate: "",
    endDate: "",
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
      await API.post("/leaves", formData);
      setFormData({ type: "Sick", startDate: "", endDate: "", reason: "" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={20} className="text-primary" /> Apply for Leave
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Type</label>
            <select name="type" className="form-control" value={formData.type} onChange={handleChange} required>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Paid">Paid Leave</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                className="form-control"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Leave</label>
            <textarea
              name="reason"
              rows={3}
              className="form-control"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Provide reason for requesting leave..."
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Send size={16} />
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveModal;
