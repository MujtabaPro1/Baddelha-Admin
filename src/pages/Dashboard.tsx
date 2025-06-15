import React from 'react';
import { 
  Users, Car, Calendar, BadgeDollarSign, ArrowUp, ArrowDown, Activity 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

// Mock data for stats
const stats = [
  { name: 'Total Users', value: '524', icon: Users, change: '+12%', changeType: 'increase' },
  { name: 'Cars Listed', value: '89', icon: Car, change: '+5%', changeType: 'increase' },
  { name: 'Appointments', value: '38', icon: Calendar, change: '-3%', changeType: 'decrease' },
  { name: 'Valuations', value: '27', icon: BadgeDollarSign, change: '+18%', changeType: 'increase' },
];

// Mock data for recent activities
const recentActivities = [
  { id: '1', event: 'New user registered', time: '5 minutes ago', type: 'user' },
  { id: '2', event: 'Car #1423 listed for sale', time: '1 hour ago', type: 'car' },
  { id: '3', event: 'Appointment scheduled with John Doe', time: '3 hours ago', type: 'appointment' },
  { id: '4', event: 'Valuation request #382 approved', time: '5 hours ago', type: 'valuation' },
  { id: '5', event: 'User Sarah updated their profile', time: '1 day ago', type: 'user' },
];

// Mock data for upcoming appointments
const upcomingAppointments = [
  { id: '1', user: 'Mohammed Al-Harbi', time: '10:00 AM', date: 'Today', purpose: 'buy' },
  { id: '2', user: 'Fatima Al-Saud', time: '2:30 PM', date: 'Today', purpose: 'sell' },
  { id: '3', user: 'Ahmed Abdullah', time: '11:15 AM', date: 'Tomorrow', purpose: 'tradeIn' },
];

const Dashboard = () => {
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of Baddelha platform statistics and activity"
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-blue-800" />
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
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all activity
            </a>
          </div>
        </div>
        
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingAppointments.map((appointment) => (
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
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link to="/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all appointments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;