import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiService from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [idioms, setIdioms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [error, setError] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch idioms data
  const fetchIdioms = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch paginated idioms
      const result = await apiService.getIdioms({
        page: page,
        limit: itemsPerPage,
        fields: 'id,idiom,status,by,_id' // Include MongoDB _id for navigation and by field for done status
      });

      if (result.success) {
        // Sort idioms by numeric ID
        const sortedIdioms = result.data.docs.sort((a, b) => {
          const idA = parseInt(a.id) || 0;
          const idB = parseInt(b.id) || 0;
          return idA - idB;
        });
        
        setIdioms(sortedIdioms);
        setCurrentPage(result.data.page);
        setTotalCount(result.data.total);
        setTotalPages(Math.ceil(result.data.total / itemsPerPage));
      } else {
        setError(result.error || 'Failed to fetch idioms');
      }

      // Fetch statistics (done count)
      const statsResult = await apiService.getIdioms({
        page: 1,
        limit: 1,
        fields: 'status'
      });

      if (statsResult.success) {
        // Get done count by fetching all with status filter
        const doneResult = await apiService.getIdioms({
          page: 1,
          limit: 1,
          fields: 'status',
          // Note: This is a workaround - ideally we'd have a dedicated stats endpoint
        });
        
        // For now, we'll calculate from the fetched data
        // In a production app, you'd want a dedicated statistics API
        const allResult = await apiService.getIdioms({
          page: 1,
          limit: 999999, // Large number to get all for counting
          fields: 'status'
        });
        
        if (allResult.success) {
          const done = allResult.data.docs.filter(item => item.status === 'done').length;
          setDoneCount(done);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchIdioms(1);
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchIdioms(page);
    }
  };

  // Get status display with default handling
  const getStatusDisplay = (status) => {
    return status || 'pending';
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const actualStatus = status || 'pending';
    return actualStatus === 'done' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  // Handle Quick button - navigate to random pending idiom
  const handleQuickEdit = async () => {
    setQuickLoading(true);
    try {
      const result = await apiService.getRandomPendingIdiom();
      if (result.success && result.data._id) {
        window.location.href = `/idiom/${result.data._id}`;
      } else {
        setError(result.data.message || 'No pending idioms found');
      }
    } catch (err) {
      setError('Failed to find a random idiom. Please try again.');
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}! Here's your activity overview.</p>
            </div>
            
            {/* Progress Stats and Quick Button */}
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {doneCount.toLocaleString()}/{totalCount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}% Complete
              </p>
              <button
                onClick={handleQuickEdit}
                disabled={quickLoading || totalCount === 0 || doneCount >= totalCount}
                className={`px-6 py-3 rounded-lg text-white font-medium transition duration-200 cursor-pointer ${
                  quickLoading || totalCount === 0 || doneCount >= totalCount
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {quickLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding...
                  </div>
                ) : (
                  'Quick Edit'
                )}
              </button>
            </div>
          </div>
        </div>
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-normal text-gray-800 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-600 mb-1">Full Name</label>
              <p className="text-gray-900">{user?.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-600 mb-1">Email</label>
              <p className="text-gray-900">{user?.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-600 mb-1">Designation</label>
              <p className="text-gray-900">{user?.designation || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-600 mb-1">Workplace</label>
              <p className="text-gray-900">{user?.workplace || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-600 mb-1">Highest Degree</label>
              <p className="text-gray-900">{user?.highestDegree || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-600 mb-1">University</label>
              <p className="text-gray-900">{user?.university || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Idioms Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-normal text-gray-800">Idioms Collection</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {totalCount.toLocaleString()} idioms
            </p>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading idioms...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Idiom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Done By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {idioms.map((item, index) => (
                      <tr key={item._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">
                            {item.idiom || 'No idiom text'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(item.status)}`}>
                            {getStatusDisplay(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.status === 'done' && item.by ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{item.by.name}</span>
                              <span className="text-xs text-gray-500">
                                {item.by.at ? new Date(item.by.at).toLocaleDateString() : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/idiom/${item._id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition duration-200 cursor-pointer"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 cursor-pointer"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const pageNum = Math.max(1, currentPage - 2) + index;
                      if (pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm border rounded transition duration-200 cursor-pointer ${
                              pageNum === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;