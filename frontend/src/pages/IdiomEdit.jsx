import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

// Move DynamicArrayInput outside the component to prevent re-creation
const DynamicArrayInput = ({ label, fieldName, placeholder, items, updateArrayItem, removeArrayItem, addArrayItem, isFormReadOnly }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${fieldName}-${index}`} className="flex items-center space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateArrayItem(fieldName, index, e.target.value)}
              disabled={isFormReadOnly}
              className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder={isFormReadOnly ? '' : placeholder}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(fieldName, index)}
              disabled={isFormReadOnly}
              className={`px-2 py-2 text-red-600 hover:bg-red-50 rounded transition duration-200 cursor-pointer ${
                isFormReadOnly ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {!isFormReadOnly && (
          <button
            type="button"
            onClick={() => addArrayItem(fieldName)}
            className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add {label.replace(/s$/, '')}
          </button>
        )}
      </div>
    </div>
  );
};

const IdiomEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id: '',
    idiom: '',
    alternative_idioms: [],
    literal_meaning: '',
    figurative_meaning_bn: '',
    figurative_meaning_en: '',
    similar_in_english: [],
    example_sentences_in_bangla: [],
    example_sentences_in_english: [],
    usage_domain: [],
    tags: [],
    frequency: '',
    sentiment: '',
    historical_significance: false,
    religious_significance: false,
    cultural_significance: false,
    scape: '',
    history: [],
    note: ''
  });

  const [currentStatus, setCurrentStatus] = useState('pending');
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Computed property for form readOnly state
  const isFormReadOnly = currentStatus === 'done';

  // Fetch idiom data
  useEffect(() => {
    const fetchIdiom = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiService.getIdiom(id);
        
        if (result.success) {
          const data = result.data;
          setFormData({
            id: data.id || '',
            idiom: data.idiom || '',
            alternative_idioms: data.alternative_idioms || [],
            literal_meaning: data.literal_meaning || '',
            figurative_meaning_bn: data.figurative_meaning_bn || '',
            figurative_meaning_en: data.figurative_meaning_en || '',
            similar_in_english: data.similar_in_english || [],
            example_sentences_in_bangla: data.example_sentences_in_bangla || [],
            example_sentences_in_english: data.example_sentences_in_english || [],
            usage_domain: data.usage_domain || [],
            tags: data.tags || [],
            frequency: data.frequency || '',
            sentiment: data.sentiment || '',
            historical_significance: data.historical_significance || false,
            religious_significance: data.religious_significance || false,
            cultural_significance: data.cultural_significance || false,
            scape: data.scape || '',
            history: data.history || [],
            note: data.note || ''
          });
          setCurrentStatus(data.status || 'pending');
          setLastUpdatedBy(data.by || null);
        } else {
          setError(result.error || 'Failed to load idiom');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIdiom();
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle array operations with useCallback to prevent re-renders
  const addArrayItem = useCallback((fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  }, []);

  const updateArrayItem = useCallback((fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  }, []);

  const removeArrayItem = useCallback((fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  }, []);

  // Update status and save
  const handleStatusUpdate = async (newStatus) => {
    setSaving(true);
    setSaveMessage('');
    setError(null);
    
    try {
      const updateData = {
        ...formData,
        status: newStatus
      };
      
      const result = await apiService.updateIdiom(id, updateData);
      
      if (result.success) {
        setCurrentStatus(newStatus);
        setLastUpdatedBy(result.data.by || null);
        
        if (newStatus === 'done') {
          // Navigate to next idiom after marking as done
          try {
            const nextResult = await apiService.getNextIdiomId(formData.id);
            if (nextResult.success && nextResult.data.nextId) {
              setSaveMessage('Marked as done! Redirecting to next idiom...');
              setTimeout(() => {
                navigate(`/idiom/${nextResult.data.nextId}`, { replace: true });
              }, 1500);
            } else {
              setSaveMessage('Marked as done! No more idioms to review.');
              setTimeout(() => {
                navigate('/dashboard');
              }, 2000);
            }
          } catch (navErr) {
            setSaveMessage('Marked as done! Unable to navigate to next idiom.');
            setTimeout(() => setSaveMessage(''), 3000);
          }
        } else {
          setSaveMessage(`Status updated to ${newStatus} successfully!`);
          setTimeout(() => setSaveMessage(''), 3000);
        }
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel - go back to dashboard
  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading idiom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 flex items-center cursor-pointer"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-serif text-gray-900">Edit Idiom</h1>
            <p className="text-gray-600 mt-1">
              ID: {formData.id || 'N/A'} | Status: 
              <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${
                currentStatus === 'done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentStatus}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            {currentStatus === 'pending' ? (
              <>
                <button
                  onClick={() => handleStatusUpdate('done')}
                  disabled={saving}
                  className={`px-6 py-2 rounded text-sm font-medium transition duration-200 ${
                    saving
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  }`}
                >
                  {saving ? 'Updating...' : 'Mark as Done'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={saving}
                  className={`px-6 py-2 rounded text-sm font-medium transition duration-200 ${
                    saving
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer'
                  }`}
                >
                  {saving ? 'Updating...' : 'Mark as Pending'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {saveMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">{saveMessage}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Basic Information
              </h3>

              {/* Idiom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idiom *
                </label>
                <input
                  type="text"
                  name="idiom"
                  value={formData.idiom}
                  onChange={handleChange}
                  disabled={isFormReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={isFormReadOnly ? '' : 'Enter the idiom'}
                />
              </div>

              {/* Alternative Idioms */}
              <DynamicArrayInput 
                label="Alternative Idioms"
                fieldName="alternative_idioms"
                placeholder="Enter alternative idiom"
                items={formData.alternative_idioms || []}
                updateArrayItem={updateArrayItem}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                isFormReadOnly={isFormReadOnly}
              />

              {/* Literal Meaning */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Literal Meaning
                </label>
                <textarea
                  name="literal_meaning"
                  value={formData.literal_meaning}
                  onChange={handleChange}
                  disabled={isFormReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={isFormReadOnly ? '' : 'Enter the literal meaning'}
                />
              </div>

              {/* Figurative Meaning (Bengali) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Figurative Meaning (Bengali)
                </label>
                <textarea
                  name="figurative_meaning_bn"
                  value={formData.figurative_meaning_bn}
                  onChange={handleChange}
                  disabled={isFormReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={isFormReadOnly ? '' : 'বাঙালি ভাষায় রূপক অর্থ'}
                />
              </div>

              {/* Figurative Meaning (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Figurative Meaning (English)
                </label>
                <textarea
                  name="figurative_meaning_en"
                  value={formData.figurative_meaning_en}
                  onChange={handleChange}
                  disabled={isFormReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={isFormReadOnly ? '' : 'Enter the figurative meaning in English'}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Additional Details
              </h3>

              {/* Similar in English */}
              <DynamicArrayInput 
                label="Similar in English"
                fieldName="similar_in_english"
                placeholder="Enter similar English idiom"
                items={formData.similar_in_english || []}
                updateArrayItem={updateArrayItem}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                isFormReadOnly={isFormReadOnly}
              />

              {/* Example Sentences (Bengali) */}
              <DynamicArrayInput 
                label="Example Sentences (Bengali)"
                fieldName="example_sentences_in_bangla"
                placeholder="বাঙালি ভাষায় উদাহরণ বাক্য"
                items={formData.example_sentences_in_bangla || []}
                updateArrayItem={updateArrayItem}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                isFormReadOnly={isFormReadOnly}
              />

              {/* Example Sentences (English) */}
              <DynamicArrayInput 
                label="Example Sentences (English)"
                fieldName="example_sentences_in_english"
                placeholder="Enter example sentence in English"
                items={formData.example_sentences_in_english || []}
                updateArrayItem={updateArrayItem}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                isFormReadOnly={isFormReadOnly}
              />

              {/* Usage Domain */}
              <DynamicArrayInput 
                label="Usage Domains"
                fieldName="usage_domain"
                placeholder="Enter usage domain"
                items={formData.usage_domain || []}
                updateArrayItem={updateArrayItem}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                isFormReadOnly={isFormReadOnly}
              />

              {/* Tags */}
              <DynamicArrayInput 
                label="Tags"
                fieldName="tags"
                placeholder="Enter tag"
                items={formData.tags || []}
                updateArrayItem={updateArrayItem}
                removeArrayItem={removeArrayItem}
                addArrayItem={addArrayItem}
                isFormReadOnly={isFormReadOnly}
              />

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  disabled={isFormReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select frequency</option>
                  <option value="Very common">Very common</option>
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="very rare">Very rare</option>
                  <option value="very common">very common</option>
                  <option value="common">common</option>
                  <option value="rare">rare</option>
                </select>
              </div>

              {/* Sentiment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sentiment
                </label>
                <select
                  name="sentiment"
                  value={formData.sentiment}
                  onChange={handleChange}
                  disabled={isFormReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select sentiment</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              {/* Significance Checkboxes */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Significance
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center ${
                    isFormReadOnly ? 'cursor-not-allowed opacity-50' : ''
                  }`}>
                    <input
                      type="checkbox"
                      name="historical_significance"
                      checked={formData.historical_significance}
                      onChange={handleChange}
                      disabled={isFormReadOnly}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Historical Significance</span>
                  </label>
                  <label className={`flex items-center ${
                    isFormReadOnly ? 'cursor-not-allowed opacity-50' : ''
                  }`}>
                    <input
                      type="checkbox"
                      name="religious_significance"
                      checked={formData.religious_significance}
                      onChange={handleChange}
                      disabled={isFormReadOnly}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Religious Significance</span>
                  </label>
                  <label className={`flex items-center ${
                    isFormReadOnly ? 'cursor-not-allowed opacity-50' : ''
                  }`}>
                    <input
                      type="checkbox"
                      name="cultural_significance"
                      checked={formData.cultural_significance}
                      onChange={handleChange}
                      disabled={isFormReadOnly}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cultural Significance</span>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  disabled={isFormReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isFormReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={isFormReadOnly ? '' : 'Enter any additional notes'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated By */}
        {lastUpdatedBy && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Last Updated By:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Name:</strong> {lastUpdatedBy.name}</p>
              <p><strong>Email:</strong> {lastUpdatedBy.email}</p>
              {lastUpdatedBy.designation && <p><strong>Designation:</strong> {lastUpdatedBy.designation}</p>}
              {lastUpdatedBy.workplace && <p><strong>Workplace:</strong> {lastUpdatedBy.workplace}</p>}
              {lastUpdatedBy.highestDegree && <p><strong>Degree:</strong> {lastUpdatedBy.highestDegree}</p>}
              {lastUpdatedBy.university && <p><strong>University:</strong> {lastUpdatedBy.university}</p>}
              {lastUpdatedBy.at && (
                <p><strong>Updated At:</strong> {new Date(lastUpdatedBy.at).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {/* Currently Editing As */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Editing as:</h4>
          <p className="text-sm text-gray-600">
            {user?.name} ({user?.email}) - {user?.designation || 'No designation'} at {user?.workplace || 'No workplace'}
          </p>
        </div>
      </main>
    </div>
  );
};

export default IdiomEdit;