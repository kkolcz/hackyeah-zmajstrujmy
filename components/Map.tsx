'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix missing marker icons in leaflet with Next.js
const customIcon = new L.Icon({
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
})

// A small randomizer so markers don't overlap completely if they are in the same city
const getJitter = () => (Math.random() - 0.5) * 0.05

const cityCoords: Record<string, [number, number]> = {
	Kraków: [50.0647, 19.945],
	Warszawa: [52.2297, 21.0122],
	Kielce: [50.8703, 20.6275],
	Wrocław: [51.1079, 17.0385],
	Gdańsk: [54.352, 18.6466],
}

export default function Map({ initiatives }: { initiatives: any[] }) {
	// Center roughly on Poland
	const defaultCenter: [number, number] = [51.9194, 19.1451]

	return (
		<MapContainer
			center={defaultCenter}
			zoom={6}
			style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
			className='z-0'>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			{initiatives
				.filter(i => i.status !== 'draft')
				.map(init => {
					let pos: [number, number];
					if (init.lat && init.lng) {
						pos = [init.lat, init.lng]
					} else {
						const baseCoord = cityCoords[init.city] || defaultCenter
						pos = [baseCoord[0] + getJitter(), baseCoord[1] + getJitter()]
					}

					return (
						<Marker key={init.id} position={pos} icon={customIcon}>
							<Popup>
								<div className='p-1'>
									<strong className='text-gray-900 block mb-1'>{init.title}</strong>
									<span className='text-gray-600 text-xs block'>{init.city}</span>
								</div>
							</Popup>
						</Marker>
					)
				})}
		</MapContainer>
	)
}
