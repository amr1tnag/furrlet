'use client'
import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  walkerName: string
}

export default function LiveTrackingMap({ lat, lng, walkerName }: Props) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then(L => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView([lat, lng], 16)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const walkerIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:44px;height:44px;border-radius:50%;
          background:linear-gradient(135deg,#f59e0b,#ef4444);
          display:flex;align-items:center;justify-content:center;
          font-size:22px;box-shadow:0 4px 12px rgba(245,158,11,0.5);
          border:3px solid white;
        ">🐾</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })

      const marker = L.marker([lat, lng], { icon: walkerIcon })
        .addTo(map)
        .bindPopup(`<b>${walkerName}</b><br/>Live location`)
        .openPopup()

      mapRef.current = map
      markerRef.current = marker
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, []) // eslint-disable-line

  // Update marker position when lat/lng changes
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return
    import('leaflet').then(L => {
      const latlng = L.latLng(lat, lng)
      markerRef.current.setLatLng(latlng)
      mapRef.current.panTo(latlng)
    })
  }, [lat, lng])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} className="w-full h-64 rounded-2xl overflow-hidden z-0" />
    </>
  )
}
