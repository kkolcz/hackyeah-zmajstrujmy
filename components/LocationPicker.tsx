'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultCenter: [number, number] = [51.9194, 19.1451] // Poland

export default function LocationPicker({ 
  position, 
  onChange 
}: { 
  position: [number, number] | null, 
  onChange: (pos: [number, number]) => void 
}) {
  const markerRef = useRef<L.Marker>(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const latLng = marker.getLatLng()
          onChange([latLng.lat, latLng.lng])
        }
      },
    }),
    [onChange]
  )

  const MapClick = () => {
    useMapEvents({
      click(e) {
        onChange([e.latlng.lat, e.latlng.lng])
      },
    })
    return null
  }

  const center = position || defaultCenter

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 z-0 shadow-inner">
      <MapContainer center={center} zoom={position ? 12 : 5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <MapClick />
        {position && (
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={customIcon}
          />
        )}
      </MapContainer>
      <div className="bg-gray-100 border-t border-gray-200 text-xs font-medium text-center p-2 text-gray-600">
        Kliknij na mapę lub przeciągnij pinezkę, aby ustawić dokładną lokalizację projektu.
      </div>
    </div>
  )
}
