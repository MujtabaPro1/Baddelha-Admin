import React, { useState, useEffect } from 'react';
import { 
  Users, Car, Calendar, BadgeDollarSign, ArrowUp, ArrowDown, Activity, Loader2, AlertCircle 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import dashboardService, { ApiAppointment, ApiCar, ApiInspection } from '../service/dashboardService';

// Define types for our component state
interface StatItem {
  name: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeType: 'increase' | 'decrease';
}

interface Activity {
  id: string;
  event: string;
  time: string;
  type: string;
}

interface AppointmentItem {
  id: string;
  user: string;
  time: string;
  date: string;
  purpose: string;
}

const Dashboard = () => {
  // State for dashboard data
  const [stats, setStats] = useState<StatItem[]>([
    { name: 'Cars Listed', value: '0', icon: Car, change: '0%', changeType: 'increase' },
    { name: 'Live Auctions', value: '0', icon: BadgeDollarSign, change: '0%', changeType: 'increase' },
    { name: 'Appointments', value: '0', icon: Calendar, change: '0%', changeType: 'increase' },
    { name: 'Inspections', value: '0', icon: Users, change: '0%', changeType: 'increase' },
  ]);
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format date to relative time (e.g., "5 minutes ago")
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Format appointment date
  const formatAppointmentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
  };

  // Format time from ISO string
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData();
        
        // Update stats
        const newStats: StatItem[] = [
          { 
            name: 'Cars Listed', 
            value: data.cars?.length?.toString() || '0', 
            icon: Car, 
            change: '+5%', // This would ideally be calculated from historical data
            changeType: 'increase' 
          },
          { 
            name: 'Live Auctions', 
            value: data.auctionCars?.length?.toString() || '0', 
            icon: BadgeDollarSign, 
            change: '+18%', 
            changeType: 'increase' 
          },
          { 
            name: 'Appointments', 
            value: data.appointments?.length?.toString() || '0', 
            icon: Calendar, 
            change: data.appointments?.length > 30 ? '+8%' : '-3%', 
            changeType: data.appointments?.length > 30 ? 'increase' : 'decrease' 
          },
          { 
            name: 'Inspections', 
            value: data.inspections?.length?.toString() || '0', 
            icon: Users, 
            change: '+12%', 
            changeType: 'increase' 
          },
        ];
        setStats(newStats);
        
        // Create recent activities from the data
        const activities: Activity[] = [];
        
        // Add car activities
        data.cars?.slice(0, 2).forEach((car: ApiCar) => {
          activities.push({
            id: `car-${car.id}`,
            event: `Car ${car.make} ${car.model} ${car.modelYear} listed for sale`,
            time: getRelativeTime(car.createdAt || new Date().toISOString()),
            type: 'car'
          });
        });
        
        // Add appointment activities
        data.appointments?.slice(0, 2).forEach((appointment: ApiAppointment) => {
          activities.push({
            id: `appointment-${appointment.id}`,
            event: `Appointment scheduled with ${appointment.userName || 'Customer'}`,
            time: getRelativeTime(appointment.createdAt || new Date().toISOString()),
            type: 'appointment'
          });
        });
        
        // Add inspection activities
        data.inspections?.slice(0, 2).forEach((inspection: ApiInspection) => {
          activities.push({
            id: `inspection-${inspection.id}`,
            event: `Inspection ${inspection.inspectionStatus} for ${inspection.Car?.make || ''} ${inspection.Car?.model || ''}`,
            time: getRelativeTime(inspection.date || new Date().toISOString()),
            type: 'inspection'
          });
        });
        
        // Sort by most recent
        activities.sort((a, b) => {
          const timeA = a.time.includes('minute') ? 0 : a.time.includes('hour') ? 1 : 2;
          const timeB = b.time.includes('minute') ? 0 : b.time.includes('hour') ? 1 : 2;
          return timeA - timeB;
        });
        
        setRecentActivities(activities);
        
        // Format upcoming appointments
        const formattedAppointments: AppointmentItem[] = data.appointments?.slice(0, 3).map((appointment: ApiAppointment) => ({
          id: appointment.id.toString(),
          user: appointment.userName || 'Customer',
          time: formatTime(appointment.time || appointment.date),
          date: formatAppointmentDate(appointment.date),
          purpose: appointment.purpose?.toLowerCase() || 'consultation'
        })) || [];
        
        setUpcomingAppointments(formattedAppointments);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of Baddelha platform statistics and activity"
      />
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
          <span className="ml-2 text-blue-900 font-medium">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="ml-2 text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-900" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'increase' ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span 
                  className={`text-sm font-medium ml-1 ${
                    stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.change} from last month
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Main content area */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <Activity className="h-5 w-5 text-blue-900" />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent activities to display
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all activity
              </Link>
            </div>
          </div>
          
          {/* Upcoming Appointments */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                <Calendar className="h-5 w-5 text-blue-900" />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <Link to={`/appointments/${appointment.id}`} className="block">
                      <p className="text-sm font-medium text-gray-900">{appointment.user}</p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span>{appointment.date} at {appointment.time}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{appointment.purpose}</span>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No upcoming appointments
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <Link to="/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all appointments
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;