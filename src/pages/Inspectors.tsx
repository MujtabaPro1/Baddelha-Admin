import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Plus, RefreshCw, Users, Clock } from 'lucide-react';
import { User } from '../types';
import axiosInstance from '../service/api';



const Inspectors = () => {
  const [users,setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(()=>{
    getInspectors();
  },[])

  const getInspectors = async () => {
    const branchId = JSON.parse(localStorage.getItem('baddelha_user') || '{}')?.branchId;
    const res = await axiosInstance.get(`/1.0/inspector/branch/${branchId}`);
    console.log(res);
    setUsers(res?.data)
    
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const Loader = () => {
    return   <div className="w-full py-12 text-center bg-white rounded-lg shadow-sm">
    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">No inspector found.</p>
  </div>
  }

  return (
    <div>
      <PageHeader 
        title="Inspectors" 
        description="Manage all inspectors on the Baddelha platform"
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
              <th>Performance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.length > 0 ?  users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 animated-transition">
                <td className="font-medium text-gray-900">{user.name}</td>
                <td>{user.email || 'seedinspector@gmail.com'}</td>
                <td>{user.phone || '966588248733'}</td>
                <td>{user.performance}</td>
                <td>
                  <StatusBadge status={'active'} />
                </td>
                <td>
                  <button className="text-sm text-blue-600 hover:text-blue-900 mr-3">
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            )) : <></>}
          </tbody>
        </table>

        {users?.length == 0 && <Loader/>}
        
      </div>
    </div>
  );
};

export default Inspectors;