import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Travel Planner
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Plan your perfect trip with friends. Organize countries, cities, places, and documents all in one place.
        </p>
        
        <div className="flex justify-center space-x-4 mb-12">
          {currentUser ? (
            <div className="space-x-4">
              <Link
                href="/trips"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                My Trips
              </Link>
              <Link
                href="/trip/new"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                Create New Trip
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                href="/register"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-500 text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">Multi-Country Planning</h3>
            <p className="text-gray-600">Select multiple countries and organize your trip across different destinations.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-500 text-4xl mb-4">🏙️</div>
            <h3 className="text-xl font-semibold mb-2">City & Place Management</h3>
            <p className="text-gray-600">Add cities and places to visit with drag-and-drop ordering for easy planning.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-500 text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">Document Storage</h3>
            <p className="text-gray-600">Upload and organize tickets, hotel bookings, and other travel documents.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
