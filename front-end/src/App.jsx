import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { UserAuthProvider } from './contexts/UserAuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Home from './components/common/Home';
import Shop from './components/common/Shop';
import CarDetails from './components/common/CarDetails';
import Booking from './components/common/Booking';
import Checkout from './components/common/Checkout';
import AdminLogin from './components/admin/AdminLogin';
import Dashboard from './components/admin/Dashboard';
import CarsDashboard from './components/admin/CarsDashboard';
import CategoryEdit from './components/admin/category/Edit';
import BrandEdit from './components/admin/brand/Edit';
import CarEdit from './components/admin/car/Edit';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import Navbar from './components/common/Navbar';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import AdminBookings from './components/admin/AdminBookings';
import BookingDetail from './components/admin/BookingDetail';

function App() {
  return (
    <AdminAuthProvider>
      <UserAuthProvider>
        <Router>
          <ScrollToTop />
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            {/* Public routes with navbar */}
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
              </>
            } />
            <Route path="/shop" element={
              <>
                <Navbar />
                <Shop />
              </>
            } />
            <Route path="/car/:id" element={
              <>
                <Navbar />
                <CarDetails />
              </>
            } />
            
            {/* Semi-Protected Routes (redirect if not authenticated) */}
            <Route path="/booking/:id" element={
              <>
                <Navbar />
                <Booking />
              </>
            } />
            <Route path="/checkout/:id" element={
              <>
                <Navbar />
                <Checkout />
              </>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            } />
            
            <Route path="/admin/cars" element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <CarsDashboard />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            } />
            
            {/* Category routes */}
            <Route path="/admin/categories/edit/:id" element={
              <ProtectedAdminRoute>
                <CategoryEdit />
              </ProtectedAdminRoute>
            } />
            
            {/* Brand routes */}
            <Route path="/admin/brands/edit/:id" element={
              <ProtectedAdminRoute>
                <BrandEdit />
              </ProtectedAdminRoute>
            } />
            
            {/* Car management routes */}
            <Route path="/admin/cars/edit/:id" element={
              <ProtectedAdminRoute>
                <CarEdit />
              </ProtectedAdminRoute>
            } />
            
            {/* Booking management routes */}
            <Route path="/admin/bookings" element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <AdminBookings />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            } />
            
            <Route path="/admin/bookings/:id" element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <BookingDetail />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            } />
            
            {/* Catch all other admin routes */}
            <Route path="/admin/*" element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            } />
          </Routes>
        </Router>
      </UserAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
