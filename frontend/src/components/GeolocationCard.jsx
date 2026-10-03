import React, { useState, useEffect } from "react";
import API from "../services/api";
import { MapPin, Navigation, Clock, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

// Haversine formula calculation on client-side for live UI distance display
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371000;
  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const GeolocationCard = ({ user, todayAttendance, onAttendanceUpdated }) => {
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const officeLat = user?.officeLocation?.lat ?? 18.5204;
  const officeLng = user?.officeLocation?.lng ?? 73.8567;
  const allowedRadius = user?.geofenceRadiusMeters ?? 100;

  const getCoordinates = () => {
    setLoadingLocation(true);
    setGeoError(null);
    setApiError(null);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setGeoError(`Unable to retrieve location: ${err.message}`);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getCoordinates();
  }, []);

  const distance = coords ? calculateDistanceMeters(coords.lat, coords.lng, officeLat, officeLng) : null;
  const isInRange = distance !== null && distance <= allowedRadius;

  const handlePunchIn = async () => {
    if (!coords) {
      setApiError("Please fetch your current GPS coordinates first.");
      return;
    }
    setSubmitting(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      const res = await API.post("/attendance/punch-in", {
        lat: coords.lat,
        lng: coords.lng,
      });
      setSuccessMsg(`Punched In successfully at ${new Date().toLocaleTimeString()}!`);
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || "Punch-In failed";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePunchOut = async () => {
    if (!coords) {
      setApiError("Please fetch your current GPS coordinates first.");
      return;
    }
    setSubmitting(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      const res = await API.post("/attendance/punch-out", {
        lat: coords.lat,
        lng: coords.lng,
      });
      setSuccessMsg(`Punched Out successfully at ${new Date().toLocaleTimeString()}!`);
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || "Punch-Out failed";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const punchedIn = !!todayAttendance?.punchIn?.timestamp;
  const punchedOut = !!todayAttendance?.punchOut?.timestamp;

  return (
    <div className="geofence-box">
      <div className="geo-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", fontWeight: 800 }}>
            <Navigation size={22} style={{ color: "#60a5fa" }} />
            <span>Location-Based Attendance</span>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginTop: "0.25rem" }}>
            Geofence Range: {allowedRadius} meters around Office Premises
          </div>
        </div>

        {coords && (
          <span className={`geo-status-badge ${isInRange ? "geo-in-range" : "geo-out-range"}`}>
            {isInRange ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
            {isInRange ? `Within Geofence (${distance}m)` : `Outside Geofence (${distance}m)`}
          </span>
        )}
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.9rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <MapPin size={16} /> Current GPS Coordinates:
          </span>
          <button
            onClick={getCoordinates}
            disabled={loadingLocation}
            style={{
              background: "none",
              border: "none",
              color: "#60a5fa",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <RefreshCw size={14} className={loadingLocation ? "spin" : ""} />
            {loadingLocation ? "Locating..." : "Refresh Location"}
          </button>
        </div>

        {coords ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", fontSize: "0.9rem" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Latitude: </span>
              <strong>{coords.lat.toFixed(5)}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Longitude: </span>
              <strong>{coords.lng.toFixed(5)}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Distance to Office: </span>
              <strong style={{ color: isInRange ? "#34d399" : "#f87171" }}>
                {distance !== null ? `${distance} meters` : "Calculating..."}
              </strong>
            </div>
          </div>
        ) : (
          <div style={{ color: "#f87171", fontSize: "0.9rem" }}>
            {geoError || "Fetching your current location..."}
          </div>
        )}
      </div>

      {apiError && (
        <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {apiError}
        </div>
      )}

      {successMsg && (
        <div style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", color: "#6ee7b7", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {successMsg}
        </div>
      )}

      {/* Attendance Punch Timestamps Display */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "10px" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase" }}>Today Punch-In</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem", color: punchedIn ? "#34d399" : "#94a3b8" }}>
            {punchedIn ? new Date(todayAttendance.punchIn.timestamp).toLocaleTimeString() : "-- : --"}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "10px" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase" }}>Today Punch-Out</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem", color: punchedOut ? "#f87171" : "#94a3b8" }}>
            {punchedOut ? new Date(todayAttendance.punchOut.timestamp).toLocaleTimeString() : "-- : --"}
          </div>
        </div>
      </div>

      <div className="geo-actions">
        <button
          className="btn-punch btn-punch-in"
          onClick={handlePunchIn}
          disabled={punchedIn || submitting || !isInRange}
          title={!isInRange ? "You must be within 100m of office to Punch In" : ""}
        >
          <Clock size={18} />
          {punchedIn ? "Punched In" : submitting ? "Processing..." : "Punch In"}
        </button>

        <button
          className="btn-punch btn-punch-out"
          onClick={handlePunchOut}
          disabled={!punchedIn || punchedOut || submitting || !isInRange}
          title={!isInRange ? "You must be within 100m of office to Punch Out" : ""}
        >
          <Clock size={18} />
          {punchedOut ? "Punched Out" : submitting ? "Processing..." : "Punch Out"}
        </button>
      </div>
    </div>
  );
};

export default GeolocationCard;
