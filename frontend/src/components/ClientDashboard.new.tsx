import React, { useState } from 'react';
import {
  MapPin,
  AlertCircle,
  Star,
  Users,
  Plus,
  Search,
  X,
  Eye,
} from 'lucide-react';
import { useFormValidation } from '../hooks';
import { LoadingSpinner, CardSkeleton } from './Loading';

interface ClientDashboardProps {
  userProfile: {
    name: string;
    email: string;
    avatar: string;
  };
  notifications: Array<any>;
  categories: Array<{ id: string; name: string; icon: string }>;
  workers: Array<any>;
  myRequests?: Array<any>;
  switchRole: (role: 'client' | 'worker' | 'business' | 'admin') => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  userProfile,
  categories,
  workers,
  myRequests = [],
}) => {
  // Local state
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);

  // Form validation for new request
  const requestForm = useFormValidation(
    {
      category: '',
      description: '',
      location: '',
      isUrgent: false,
    },
    {
      category: (value) =>
        !value ? 'Veuillez sélectionner une catégorie' : null,
      description: (value) =>
        !value
          ? 'Veuillez décrire votre demande'
          : value.length < 20
            ? 'Description trop courte (minimum 20 caractères)'
            : null,
      location: (value) =>
        !value ? "Veuillez indiquer le lieu de l'intervention" : null,
      isUrgent: () => null,
    }
  );

  const handleFilterChange = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestForm.validate()) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowRequestForm(false);
      requestForm.reset();
      // Show success notification
    }
  };

  const handleSearchWorkers = async () => {
    setIsLoadingWorkers(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoadingWorkers(false);
  };

  const filteredWorkers = workers.filter((worker) => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.some((filter) =>
      worker.specialty.toLowerCase().includes(filter.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, {userProfile.name} !
            </h1>
            <p className="text-primary-100 text-lg">
              Trouvez le professionnel qu'il vous faut
            </p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-white text-primary-600 hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nouvelle demande
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-6">
          {/* Search Location */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Où recherchez-vous ?"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <button
              onClick={handleSearchWorkers}
              disabled={isLoadingWorkers}
              className="btn btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoadingWorkers ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Rechercher
            </button>
          </div>

          {/* Category Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Catégories de services
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    selectedFilters.includes(category.id)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Professionnels disponibles
          </h2>
          <span className="text-sm text-gray-500">
            {filteredWorkers.length} professionnel
            {filteredWorkers.length > 1 ? 's' : ''} trouvé
            {filteredWorkers.length > 1 ? 's' : ''}
          </span>
        </div>

        {isLoadingWorkers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center font-bold">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {worker.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {worker.rating}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({worker.jobs} jobs)
                        </span>
                      </div>
                    </div>
                  </div>
                  {worker.urgent && (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{worker.specialty}</p>

                <div className="flex gap-2">
                  <button className="flex-1 btn btn-primary text-sm py-2">
                    Contacter
                  </button>
                  <button className="btn btn-outline text-sm py-2 px-3">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Requests */}
      {myRequests && myRequests.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mes demandes récentes
          </h2>
          <div className="space-y-4">
            {myRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {request.title}
                    </h3>
                    <p className="text-sm text-gray-600">{request.category}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'En cours'
                          ? 'bg-blue-100 text-blue-700'
                          : request.status === 'Terminé'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {request.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.offers} offre{request.offers > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Nouvelle demande de service
              </h2>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie de service *
                </label>
                <select
                  value={requestForm.values.category}
                  onChange={(e) =>
                    requestForm.handleChange('category', e.target.value)
                  }
                  onBlur={() => requestForm.handleBlur('category')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    requestForm.errors.category && requestForm.touched.category
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {requestForm.errors.category &&
                  requestForm.touched.category && (
                    <p className="text-red-600 text-sm mt-1">
                      {requestForm.errors.category}
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  value={requestForm.values.description}
                  onChange={(e) =>
                    requestForm.handleChange('description', e.target.value)
                  }
                  onBlur={() => requestForm.handleBlur('description')}
                  placeholder="Décrivez précisément votre besoin..."
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    requestForm.errors.description &&
                    requestForm.touched.description
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                />
                {requestForm.errors.description &&
                  requestForm.touched.description && (
                    <p className="text-red-600 text-sm mt-1">
                      {requestForm.errors.description}
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu d'intervention *
                </label>
                <input
                  type="text"
                  value={requestForm.values.location}
                  onChange={(e) =>
                    requestForm.handleChange('location', e.target.value)
                  }
                  onBlur={() => requestForm.handleBlur('location')}
                  placeholder="Adresse ou ville"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    requestForm.errors.location && requestForm.touched.location
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                />
                {requestForm.errors.location &&
                  requestForm.touched.location && (
                    <p className="text-red-600 text-sm mt-1">
                      {requestForm.errors.location}
                    </p>
                  )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={requestForm.values.isUrgent}
                  onChange={(e) =>
                    requestForm.handleChange('isUrgent', e.target.checked)
                  }
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isUrgent" className="text-sm text-gray-700">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Intervention urgente (24h)
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 btn btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!requestForm.isValid}
                  className="flex-1 btn btn-primary disabled:opacity-50"
                >
                  Publier ma demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
