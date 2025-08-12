import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { User } from '../types';
import axiosInstance from '../service/api';



const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(()=>{
      getUsers();
  },[]);

  const getUsers = () => {
    setLoading(true);
    axiosInstance.get('/1.0/user/find-all').then((res)=>{
      setLoading(false);
      setUsers(res.data.data);
    }).catch((err)=>{
      setLoading(false);
      console.log(err);
    })
  }



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <PageHeader 
        title="Users" 
        description="Manage all users on the Baddelha platform"
        actions={
          <button className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add User
          </button>
        }
      />
      
      {/* Filters and search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className="form-input pl-10"
          />
        </div>
        <div className="sm:w-64 flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedRole}
              onChange={handleRoleFilter}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="dealer">Dealer</option>
            </select>
          </div>
          <button className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Users table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 animated-transition">
                <td className="font-medium text-gray-900">{user.firstName + ' ' + (user.lastName ? user.lastName : '')}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className="capitalize">{user.role}</span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                {/* <td className="text-right">
                  <button className="text-sm text-blue-600 hover:text-blue-900 mr-3">
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;