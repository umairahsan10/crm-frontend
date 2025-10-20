import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, Globe, MapPin, Flag } from 'lucide-react';
import { useNavbar } from '../../context/NavbarContext';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: any) => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSave }) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    country: '',
    status: 'active',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const companyData = {
        ...formData,
        id: Date.now().toString(), // Generate unique ID
        location: formData.address, // Map address to location
        revenue: '$0', // Default values
        employees: 0,
        founded: new Date().getFullYear().toString(),
        assignedTo: 'Unassigned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onSave(companyData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      country: '',
      status: 'active',
      description: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-600 bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out flex flex-col"
           style={{
             marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
             width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
             maxWidth: isMobile ? '100vw' : '1200px',
             marginRight: isMobile ? '0' : '50px',
             marginTop: isMobile ? '0' : '20px',
             marginBottom: isMobile ? '0' : '20px',
             height: isMobile ? '100vh' : 'calc(100vh - 40px)'
           }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Company</h2>
              <p className="text-sm text-gray-500">Create a new company record</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

         {/* Form */}
         <div className="flex-1 overflow-y-auto">
           <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
             <div className="space-y-4">
               <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                   <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                   </svg>
                   Add New Company
                 </h3>
                 
                 <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Company Name <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="text"
                         name="name"
                         value={formData.name}
                         onChange={handleInputChange}
                         className={`block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                           errors.name ? 'border-red-300' : ''
                         }`}
                         placeholder="Enter company name"
                       />
                       {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Email Address <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="email"
                         name="email"
                         value={formData.email}
                         onChange={handleInputChange}
                         className={`block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                           errors.email ? 'border-red-300' : ''
                         }`}
                         placeholder="company@example.com"
                       />
                       {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                       <input
                         type="tel"
                         name="phone"
                         value={formData.phone}
                         onChange={handleInputChange}
                         className={`block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                           errors.phone ? 'border-red-300' : ''
                         }`}
                         placeholder="+1 (555) 123-4567"
                       />
                       {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                       <input
                         type="url"
                         name="website"
                         value={formData.website}
                         onChange={handleInputChange}
                         className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="https://www.example.com"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                       <input
                         type="text"
                         name="address"
                         value={formData.address}
                         onChange={handleInputChange}
                         className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="123 Business St, City, State 12345"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
                       <select
                         name="country"
                         value={formData.country}
                         onChange={handleInputChange}
                         className={`block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                           errors.country ? 'border-red-300' : ''
                         }`}
                       >
                         <option value="">Select Country</option>
                         <option value="United States">United States</option>
                         <option value="Canada">Canada</option>
                         <option value="United Kingdom">United Kingdom</option>
                         <option value="Germany">Germany</option>
                         <option value="France">France</option>
                         <option value="Australia">Australia</option>
                         <option value="Japan">Japan</option>
                         <option value="Other">Other</option>
                       </select>
                       {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
                       <select
                         name="status"
                         value={formData.status}
                         onChange={handleInputChange}
                         className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       >
                         <option value="active">Active</option>
                         <option value="inactive">Inactive</option>
                       </select>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                     <textarea
                       name="description"
                       value={formData.description}
                       onChange={handleInputChange}
                       rows={4}
                       className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Brief description of the company..."
                     />
                   </div>

                   <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                     <button
                       type="button"
                       onClick={handleClose}
                       className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                       Cancel
                     </button>
                     <button
                       type="submit"
                       className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                       Add Company
                     </button>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default AddCompanyModal;
