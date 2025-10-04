import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from '../components/ui/button'
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Search,} from 'lucide-react';
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const selectedIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

function MapCenter({ latitude, longitude }) {
    const map = useMap()
    useEffect(() => {
        map.setView([latitude, longitude], map.getZoom())
    }, [latitude, longitude, map])
    return null
}

const MLPredict = () => {
    const [date, setDate] = useState("")
    const [predictions, setPredictions] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 }) // Default to Pune, India
    const [selectedDonation, setSelectedDonation] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setPredictions([])
        setLoading(true)
        try {
            const response = await fetch(`http://localhost:5004/predict?date=${date}`)

            if (!response.ok) {
                throw new Error("Failed to fetch predictions. Check backend and CORS settings.")
            }

            const data = await response.json()
            setPredictions(data)
            if (data.length > 0) {
                setMapCenter({ lat: data[0].latitude, lng: data[0].longitude })
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-20 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold">Donations Predictions</h1>

                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl mb-8"
            >
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Select Date:
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="mt-1 block w-full p-2 border rounded-md"
                                required
                            />
                        </label>
                    </div>
                </div>
                <div className="flex gap-3 mt-4">
                    <Button
                        onClick={handleSubmit}
                        className="flex items-center"
                        disabled={loading}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        {loading ? 'Searching...' : 'Search Donations'}
                    </Button>
                </div>
                {error && (
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                )}
            </motion.div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Searching for donations...</p>
                </div>
            ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">{error ? error : "Use the date picker above to search for donations"}</p>
                </div>
            ) : (
                <>
                    <h3 className="text-lg font-bold mt-8 mb-4">Prediction Results:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                        {predictions.map((pred, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out relative"
                            >
                                <div className="gradient" />
                                <p className="font-bold mb-2 text-lg">{pred.neighborhood}</p>
                                <p>
                                    <strong>Probability:</strong> {(pred.probability * 100).toFixed(2)}%
                                </p>
                                <p>
                                    <strong>Coordinates:</strong> {pred.latitude.toFixed(4)}, {pred.longitude.toFixed(4)}
                                </p>
                                <p className="mt-2 font-semibold">Reasons:</p>
                                <ul className="list-disc pl-5 text-sm text-gray-600">
                                    {pred.reasons.map((reason, idx) => (
                                        <li key={idx}>{reason}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    <div className="w-full max-w-6xl h-96 mt-8 rounded-lg overflow-hidden shadow-lg">
                        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={13} className="h-full w-full">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapCenter latitude={mapCenter.lat} longitude={mapCenter.lng} />

                            {predictions.map((rec, index) => (
                                <Marker
                                    key={index}
                                    position={[rec.latitude, rec.longitude]}
                                    icon={selectedIcon}
                                    eventHandlers={{
                                        click: () => setSelectedDonation(rec),
                                    }}
                                >
                                    <Popup>
                                        <div>
                                            <h3 className="font-semibold">{rec.neighborhood}</h3>
                                            <p>Probability: {(rec.probability * 100).toFixed(2)}%</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </>
            )}
        </div>
    )
}

export default MLPredict





