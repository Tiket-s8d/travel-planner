import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { getTrip, updateTrip } from '../../lib/firestore';
import DragDropList from '../../components/DragDropList';
import FileUpload from '../../components/FileUpload';
import { deleteFile } from '../../lib/storage';

export default function TripDetails() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const { currentUser } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const countries = [
    'France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Netherlands',
    'Switzerland', 'Austria', 'Portugal', 'Greece', 'Japan', 'Thailand',
    'United States', 'Canada', 'Australia', 'New Zealand', 'Brazil', 'Argentina'
  ];

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchTrip();
    }
  }, [currentUser, id, router]);

  const fetchTrip = async () => {
    try {
      const tripData = await getTrip(id);
      setTrip(tripData);
      setSelectedCountries(tripData.countries || []);
    } catch (error) {
      console.error('Error fetching trip:', error);
      router.push('/trips');
    } finally {
      setLoading(false);
    }
  };

  const saveTrip = async () => {
    if (!trip) return;
    
    setSaving(true);
    try {
      await updateTrip(id, {
        ...trip,
        countries: selectedCountries
      });
    } catch (error) {
      console.error('Error saving trip:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCountrySelect = (e) => {
    const country = e.target.value;
    if (country && !selectedCountries.find(c => c.name === country)) {
      const newCountry = {
        id: Date.now().toString(),
        name: country,
        cities: []
      };
      setSelectedCountries([...selectedCountries, newCountry]);
    }
  };

  const handleCountryDelete = (countryIndex) => {
    const newCountries = selectedCountries.filter((_, index) => index !== countryIndex);
    setSelectedCountries(newCountries);
  };

  const handleCountryReorder = (newCountries) => {
    setSelectedCountries(newCountries);
  };

  const handleAddCity = (countryIndex) => {
    const cityName = prompt('Enter city name:');
    if (cityName) {
      const newCountries = [...selectedCountries];
      newCountries[countryIndex].cities.push({
        id: Date.now().toString(),
        name: cityName,
        places: [],
        documents: []
      });
      setSelectedCountries(newCountries);
    }
  };

  const handleCityDelete = (countryIndex, cityIndex) => {
    const newCountries = [...selectedCountries];
    newCountries[countryIndex].cities.splice(cityIndex, 1);
    setSelectedCountries(newCountries);
  };

  const handleCityReorder = (countryIndex, newCities) => {
    const newCountries = [...selectedCountries];
    newCountries[countryIndex].cities = newCities;
    setSelectedCountries(newCountries);
  };

  const handleAddPlace = (countryIndex, cityIndex) => {
    const placeName = prompt('Enter place name:');
    if (placeName) {
      const newCountries = [...selectedCountries];
      newCountries[countryIndex].cities[cityIndex].places.push({
        id: Date.now().toString(),
        name: placeName,
        description: ''
      });
      setSelectedCountries(newCountries);
    }
  };

  const handlePlaceDelete = (countryIndex, cityIndex, placeIndex) => {
    const newCountries = [...selectedCountries];
    newCountries[countryIndex].cities[cityIndex].places.splice(placeIndex, 1);
    setSelectedCountries(newCountries);
  };

  const handlePlaceReorder = (countryIndex, cityIndex, newPlaces) => {
    const newCountries = [...selectedCountries];
    newCountries[countryIndex].cities[cityIndex].places = newPlaces;
    setSelectedCountries(newCountries);
  };

  const handleFileUploaded = (countryIndex, cityIndex, fileData) => {
    const newCountries = [...selectedCountries];
    newCountries[countryIndex].cities[cityIndex].documents.push(fileData);
    setSelectedCountries(newCountries);
  };

  const handleFileDelete = async (countryIndex, cityIndex, fileIndex) => {
    const file = selectedCountries[countryIndex].cities[cityIndex].documents[fileIndex];
    
    try {
      await deleteFile(file.path);
      const newCountries = [...selectedCountries];
      newCountries[countryIndex].cities[cityIndex].documents.splice(fileIndex, 1);
      setSelectedCountries(newCountries);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!trip) {
    return <div className="text-center">Trip not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
          <p className="text-gray-600">{trip.description}</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={saveTrip}
            disabled={saving}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.push('/trips')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Trips
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Countries</h2>
        <select
          value=""
          onChange={handleCountrySelect}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select a country to add...</option>
          {countries
            .filter(country => !selectedCountries.find(c => c.name === country))
            .map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
        </select>
      </div>

      {selectedCountries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Itinerary</h2>
          
          <DragDropList
            items={selectedCountries}
            onReorder={handleCountryReorder}
            onDelete={handleCountryDelete}
            renderItem={(country, countryIndex) => (
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{country.name}</h3>
                
                {country.cities.length > 0 && (
                  <div className="ml-4 mb-4">
                    <DragDropList
                      items={country.cities}
                      onReorder={(newCities) => handleCityReorder(countryIndex, newCities)}
                      onDelete={(cityIndex) => handleCityDelete(countryIndex, cityIndex)}
                      addButtonText="Add City"
                      onAdd={() => handleAddCity(countryIndex)}
                      renderItem={(city, cityIndex) => (
                        <div>
                          <h4 className="text-md font-medium text-green-600 mb-2">{city.name}</h4>
                          
                          {city.places.length > 0 && (
                            <div className="ml-4 mb-3">
                              <DragDropList
                                items={city.places}
                                onReorder={(newPlaces) => handlePlaceReorder(countryIndex, cityIndex, newPlaces)}
                                onDelete={(placeIndex) => handlePlaceDelete(countryIndex, cityIndex, placeIndex)}
                                addButtonText="Add Place"
                                onAdd={() => handleAddPlace(countryIndex, cityIndex)}
                                renderItem={(place) => (
                                  <div className="text-gray-700">{place.name}</div>
                                )}
                              />
                            </div>
                          )}
                          
                          {city.places.length === 0 && (
                            <button
                              onClick={() => handleAddPlace(countryIndex, cityIndex)}
                              className="ml-4 mb-3 text-sm text-blue-500 hover:text-blue-700"
                            >
                              + Add Place
                            </button>
                          )}

                          {city.documents && city.documents.length > 0 && (
                            <div className="ml-4 mb-2">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Documents:</h5>
                              <div className="space-y-1">
                                {city.documents.map((doc, docIndex) => (
                                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      {doc.name}
                                    </a>
                                    <button
                                      onClick={() => handleFileDelete(countryIndex, cityIndex, docIndex)}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <FileUpload
                            userId={currentUser?.uid}
                            tripId={id}
                            cityId={city.id}
                            onFileUploaded={(fileData) => handleFileUploaded(countryIndex, cityIndex, fileData)}
                          />
                        </div>
                      )}
                    />
                  </div>
                )}
                
                {country.cities.length === 0 && (
                  <button
                    onClick={() => handleAddCity(countryIndex)}
                    className="ml-4 text-sm text-blue-500 hover:text-blue-700"
                  >
                    + Add City
                  </button>
                )}
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}