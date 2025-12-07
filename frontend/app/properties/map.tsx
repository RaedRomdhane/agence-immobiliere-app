
"use client";

import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Helper to calculate distance between two lat/lng points in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
interface PropertiesMapProps {
  adminMode?: boolean;
  selectLocationMode?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;
  selectedPropertyId?: string | null;
  properties?: any[];
}

function PropertiesMap({
  adminMode = false,
  selectLocationMode = false,
  onSelectLocation,
  selectedPropertyId = null,
  properties: externalProperties
}: PropertiesMapProps = {}) {
  // ...geolocation logic removed...
  // ...existing code...

  // ...existing code...
  // Load showServices from localStorage if available
  const [showServices, setShowServices] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showServices');
      if (stored !== null) return stored === 'true';
    }
    return true;
  });
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);

  // Fetch services from Overpass API for the visible map bounds
  useEffect(() => {
    if (!bounds || !showServices) {
      setServices([]);
      return;
    }
    setServicesLoading(true);
    setServicesError('');
    // Calculate bounding box for Overpass API: south,west,north,east
    const [[south, west], [north, east]] = bounds;
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["highway"="bus_stop"](${south},${west},${north},${east});
        node["railway"="station"](${south},${west},${north},${east});
        node["amenity"="school"](${south},${west},${north},${east});
        node["amenity"="hospital"](${south},${west},${north},${east});
        node["shop"](${south},${west},${north},${east});
      );
      out body;
    `;
    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'text/plain' },
    })
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setServices(data.elements || []);
        } catch {
          setServicesError('Erreur chargement services: réponse non valide (Overpass API peut être saturée)');
        }
      })
      .catch(err => {
        setServicesError('Erreur chargement services: ' + (err.message || 'inconnue'));
      })
      .finally(() => setServicesLoading(false));
  }, [bounds, showServices]);
  // Ensure onMap is always boolean for all properties
  function normalizeProperties(props: any[]): any[] {
    return props.map(p => ({ ...p, onMap: !!p.onMap }));
  }
  const [properties, setProperties] = useState<any[]>(externalProperties ? normalizeProperties(externalProperties) : []);
  const [loading, setLoading] = useState(!externalProperties);
  const [error, setError] = useState('');
  // Removed radius and radiusCenter state (no more circle)
  // Service type filters
  const [serviceFilters, setServiceFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('serviceFilters');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return {
      bus_stop: true,
      station: true,
      school: true,
      hospital: true,
      shop: true,
    };
  });
  // Persist showServices and serviceFilters to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showServices', String(showServices));
    }
  }, [showServices]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('serviceFilters', JSON.stringify(serviceFilters));
    }
  }, [serviceFilters]);

  // Helper to check if all service filters are checked
  const allServicesChecked = Object.values(serviceFilters).every(Boolean);
  const someServicesChecked = Object.values(serviceFilters).some(Boolean);
  const mainCheckboxRef = useRef<HTMLInputElement>(null);

  // Set indeterminate state for main checkbox
  useEffect(() => {
    if (mainCheckboxRef.current) {
      mainCheckboxRef.current.indeterminate = showServices && !allServicesChecked && someServicesChecked;
    }
  }, [showServices, allServicesChecked, someServicesChecked]);
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const mapRef = useRef<any>(null);



  // Overpass API query for nearby services/transport (radius logic removed)
  // Removed effect for fetching services by radius
  // Icon definitions for services
  const icons = {
    bus_stop: new L.Icon({
      iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
      iconSize: [20, 32],
      iconAnchor: [10, 32],
      popupAnchor: [0, -32],
      className: 'bus-stop-icon',
    }),
    station: new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61088.png',
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -20],
      className: 'station-icon',
    }),
    school: new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/167/167707.png',
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -20],
      className: 'school-icon',
    }),
    hospital: new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -20],
      className: 'hospital-icon',
    }),
    shop: new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png',
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -20],
      className: 'shop-icon',
    }),
  };

  // If properties are provided as a prop, always use them
  useEffect(() => {
    if (externalProperties) {
      setProperties(normalizeProperties(externalProperties));
      setLoading(false);
    } else {
      // fallback: fetch properties if not provided
      async function fetchProperties() {
        setLoading(true);
        setError('');
        try {
          let fetchOptions = {};
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
              fetchOptions = {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              };
            }
          }
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${apiUrl}/properties`, fetchOptions);
          if (!res.ok) throw new Error('Erreur lors du chargement des biens');
          const data = await res.json();
          console.log('[MAP DEBUG] Full response:', data);
          setProperties(normalizeProperties(data.data || []));
        } catch (err: any) {
          setError(err.message || 'Erreur inconnue');
        } finally {
          setLoading(false);
        }
      }
      fetchProperties();
    }
  }, [externalProperties]);

  // Set initial bounds when map is ready

  useEffect(() => {
    if (mapRef.current && !bounds) {
      const b = mapRef.current.getBounds();
      setBounds([
        [b.getSouth(), b.getWest()],
        [b.getNorth(), b.getEast()]
      ]);
    }
  }, [mapRef.current, bounds]);

  // Component to handle map moveend and click events
  function MapEventHandler() {
    useMapEvent('moveend', () => {
      if (mapRef.current) {
        const b = mapRef.current.getBounds();
        setBounds([
          [b.getSouth(), b.getWest()],
          [b.getNorth(), b.getEast()]
        ]);
      }
    });
    useMapEvent('click', (e: { latlng: { lat: number; lng: number } }) => {
      if (adminMode && selectLocationMode && onSelectLocation && selectedPropertyId) {
        // Admin is selecting a property location
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  }

  // Default center: Tunis
  const center = [36.8065, 10.1815];

  // Helper to check if a point is within bounds
  function isInBounds(lat: number, lng: number, bounds: [[number, number], [number, number]]) {
    const [[south, west], [north, east]] = bounds;
    return lat >= south && lat <= north && lng >= west && lng <= east;
  }

  // Show all properties with onMap=true and valid coordinates, regardless of bounds
  console.log('All properties:', properties);
  const visibleProperties = properties.filter((property: any) => {
    // Support both legacy and new coordinate storage
    const lat = property.location?.coordinates?.latitude ?? property.location?.latitude;
    const lng = property.location?.coordinates?.longitude ?? property.location?.longitude;
    const result = property.onMap && typeof lat === 'number' && typeof lng === 'number';
    if (!result) {
      console.log('Filtered out property:', property, 'lat:', lat, 'lng:', lng, 'onMap:', property.onMap);
    }
    return result;
  });
  console.log('Visible properties:', visibleProperties);

  // Adjust this value to match your header height (e.g., 64px or 80px)
  const headerHeight = 72;
  return (
    <div style={{ height: '80vh', width: '100%', position: 'relative', marginTop: headerHeight, zIndex: '1' }}>
      {/* Geolocation status UI removed */}
      {/* Controls UI */}
      <div style={{
        position: 'absolute',
        zIndex: 2000,
        background: '#fff',
        color: '#222',
        padding: 12,
        borderRadius: 12,
        right: 16,
        top: 16,
        minWidth: 240,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        opacity: 1,
        fontWeight: 500
      }}>
        {adminMode && selectLocationMode ? (
          <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 10 }}>
            Cliquez sur la carte pour choisir l'emplacement du bien.
          </div>
        ) : null}
        {/* Removed radius input UI */}
        <div style={{ marginBottom: 8 }}>
          <label>
            <input
              ref={mainCheckboxRef}
              type="checkbox"
              checked={showServices && allServicesChecked}
              onChange={e => {
                const checked = e.target.checked;
                setShowServices(checked);
                setServiceFilters({
                  bus_stop: checked,
                  station: checked,
                  school: checked,
                  hospital: checked,
                  shop: checked,
                });
              }}
            />
            &nbsp;Afficher transports/services à proximité
          </label>
        </div>
        {/* Legend with checkboxes */}
        <div style={{ fontSize: 14, marginTop: 10, color: '#222' }}>
          <strong style={{ fontSize: 15, color: '#111' }}>Légende :</strong><br />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
            <input type="checkbox" checked={serviceFilters.bus_stop} onChange={e => setServiceFilters((f: typeof serviceFilters) => ({ ...f, bus_stop: e.target.checked }))} />
            <img src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png" width="18" style={{ verticalAlign: 'middle' }} alt="Arrêt de bus" /> Arrêt de bus
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
            <input type="checkbox" checked={serviceFilters.station} onChange={e => setServiceFilters((f: typeof serviceFilters) => ({ ...f, station: e.target.checked }))} />
            <img src="https://cdn-icons-png.flaticon.com/512/61/61088.png" width="18" style={{ verticalAlign: 'middle' }} alt="Gare/Station" /> Gare/Station
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
            <input type="checkbox" checked={serviceFilters.school} onChange={e => setServiceFilters((f: typeof serviceFilters) => ({ ...f, school: e.target.checked }))} />
            <img src="https://cdn-icons-png.flaticon.com/512/167/167707.png" width="18" style={{ verticalAlign: 'middle' }} alt="École" /> École
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
            <input type="checkbox" checked={serviceFilters.hospital} onChange={e => setServiceFilters((f: typeof serviceFilters) => ({ ...f, hospital: e.target.checked }))} />
            <img src="https://cdn-icons-png.flaticon.com/512/2965/2965567.png" width="18" style={{ verticalAlign: 'middle' }} alt="Hôpital" /> Hôpital
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
            <input type="checkbox" checked={serviceFilters.shop} onChange={e => setServiceFilters((f: typeof serviceFilters) => ({ ...f, shop: e.target.checked }))} />
            <img src="https://cdn-icons-png.flaticon.com/512/1076/1076928.png" width="18" style={{ verticalAlign: 'middle' }} alt="Commerce" /> Commerce
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/69/69524.png" width="22" style={{ verticalAlign: 'middle' }} alt="Bien immobilier" /> Bien immobilier
          </span>
        </div>
      </div>
      {loading && <div>Chargement...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {servicesLoading && showServices && <div style={{ position: 'absolute', top: 60, right: 10, zIndex: 1000, background: 'white', padding: 4, borderRadius: 4 }}>Chargement services...</div>}
      {/* Hide Overpass API error from UI */}
      {/* Only render the map on the client side */}
      {typeof window !== 'undefined' && (
        <MapContainer
          center={center as [number, number]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          {/* Always render MapEventHandler to handle map clicks */}
          <MapEventHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Removed radius circle from map */}
          {/* Property markers */}
          <MarkerClusterGroup key={
            properties.length + '-' +
            (properties[0]?._id || '') + '-' +
            (properties[properties.length-1]?._id || '')
          }>
            {visibleProperties.map((property: any) => {
              const lat = property.location?.coordinates?.latitude ?? property.location?.latitude;
              const lng = property.location?.coordinates?.longitude ?? property.location?.longitude;
              console.log('Rendering marker for property:', property._id, 'lat:', lat, 'lng:', lng, 'onMap:', property.onMap);
              // Already filtered for onMap and valid coordinates
              const houseIcon = new L.Icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/69/69524.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              });
              return (
                <Marker key={property._id} position={[lat, lng]} icon={houseIcon}>
                  <Popup>
                    <strong>{property.title}</strong><br />
                    {property.city}<br />
                    Prix: {property.price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}<br />
                    <a href={`/properties/${property._id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>
                      Voir ce bien
                    </a>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
          {/* Services/transport markers: show all, filter by type */}
          {showServices && services.filter((el: any) => {
            if (el.tags?.highway === 'bus_stop') return serviceFilters.bus_stop;
            if (el.tags?.railway === 'station') return serviceFilters.station;
            if (el.tags?.amenity === 'school') return serviceFilters.school;
            if (el.tags?.amenity === 'hospital') return serviceFilters.hospital;
            if (el.tags?.shop) return serviceFilters.shop;
            return false;
          }).map((el: any, idx: number) => {
            const lat = el.lat;
            const lng = el.lon;
            let icon = icons.bus_stop;
            let label = 'Arrêt de bus';
            if (el.tags) {
              if (el.tags.highway === 'bus_stop') {
                icon = icons.bus_stop;
                label = 'Arrêt de bus';
              } else if (el.tags.railway === 'station') {
                icon = icons.station;
                label = 'Gare/Station';
              } else if (el.tags.amenity === 'school') {
                icon = icons.school;
                label = 'École';
              } else if (el.tags.amenity === 'hospital') {
                icon = icons.hospital;
                label = 'Hôpital';
              } else if (el.tags.shop) {
                icon = icons.shop;
                label = 'Commerce';
              }
            }
            return (
              <Marker key={el.id || idx} position={[lat, lng]} icon={icon}>
                <Popup>
                  <strong>{label}</strong><br />
                  {el.tags?.name && <span>{el.tags.name}<br /></span>}
                  {el.tags?.shop && <span>Type: {el.tags.shop}<br /></span>}
                  {el.tags?.amenity && <span>Type: {el.tags.amenity}<br /></span>}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
}

export default PropertiesMap;
