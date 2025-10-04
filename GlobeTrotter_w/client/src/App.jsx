import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
} from 'react-router-dom';
import { useAtomValue } from 'jotai';
import Login from '@/components/Auth/Login';
import ForgotPassword from '@/components/Auth/ForgotPassword';
import Signup from '@/components/Auth/Signup';
import { authUserAtom } from '@/lib/auth.atoms';
import TripsList from '@/components/Trips/TripsList';
import TripCreate from '@/components/Trips/TripCreate';
import TripDetail from '@/components/Trips/TripDetail';
import TripEdit from '@/components/Trips/TripEdit';
import Home from '@/components/Home';

import Navbar from './components/Navbar';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import './App.css';
import MyCalendar from './components/Calendar';
import TripPlanner from '@/components/Planner/TripPlanner';
import CommunityChat from '@/components/Community/CommunityChat';
import UserProfile from '@/components/Profile/UserProfile';

const TripRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/trips/${id}/planner`} replace />;
};

// Protected route wrapper for admin-only routes
const AdminRoute = ({ children }) => {
  const user = useAtomValue(authUserAtom);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <Link to="/" className="text-blue-600 hover:underline">
          Go back to homepage
        </Link>
      </div>
    );
  }

  return children;
};

function App() {
  const user = useAtomValue(authUserAtom);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <TripsList /> : <Home />} />
        <Route path="/explore" element={<TripsList />} />
        <Route
          path="/trips/new"
          element={user ? <TripCreate /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/trips/:id"
          element={user ? <TripRedirect /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/trips/:id/planner"
          element={user ? <TripPlanner /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/trips/:id/detail"
          element={user ? <TripDetail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/trips/:id/edit"
          element={user ? <TripEdit /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/calendar"
          element={user ? <MyCalendar /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <UserProfile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/community"
          element={user ? <CommunityChat /> : <Navigate to="/login" replace />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
