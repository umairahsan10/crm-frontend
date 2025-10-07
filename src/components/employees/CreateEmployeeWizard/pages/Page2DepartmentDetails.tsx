import React, { useState } from 'react';
import { type Department } from '../../../../apis/hr-employees';
import HRForm from '../department-forms/HRForm';
import SalesForm from '../department-forms/SalesForm';
import MarketingForm from '../department-forms/MarketingForm';
import ProductionForm from '../department-forms/ProductionForm';
import AccountantForm from '../department-forms/AccountantForm';

interface Page2Props {
  formData: any;
  updateFormData: (data: any) => void;
  departments: Department[];
  onNext: () => void;
  onBack: () => void;
}

const Page2DepartmentDetails: React.FC<Page2Props> = ({
  formData,
  updateFormData,
  departments,
  onNext,
  onBack
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedDepartment = departments.find(d => d.id === formData.departmentId);
  const departmentName = selectedDepartment?.name.toLowerCase() || '';

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate based on department
    if (departmentName === 'sales') {
      const salesData = formData.departmentData?.sales;
      if (!salesData) {
        newErrors.general = 'Sales data is required';
      } else {
        if (!salesData.salesUnitId) newErrors.salesUnitId = 'Required';
        if (salesData.commissionRate === undefined || salesData.commissionRate < 0 || salesData.commissionRate > 100) {
          newErrors.commissionRate = 'Must be between 0-100';
        }
        if (salesData.withholdCommission === undefined || salesData.withholdCommission < 0) {
          newErrors.withholdCommission = 'Cannot be negative';
        }
        if (salesData.withholdFlag === undefined) {
          newErrors.withholdFlag = 'Required';
        }
      }
    } else if (departmentName === 'marketing') {
      const marketingData = formData.departmentData?.marketing;
      if (!marketingData) {
        newErrors.general = 'Marketing data is required';
      } else {
        if (!marketingData.marketingUnitId) newErrors.marketingUnitId = 'Required';
        if (!marketingData.platformFocus?.trim()) newErrors.platformFocus = 'Required';
      }
    } else if (departmentName === 'production') {
      const productionData = formData.departmentData?.production;
      if (!productionData) {
        newErrors.general = 'Production data is required';
      } else {
        if (!productionData.specialization?.trim()) newErrors.specialization = 'Required';
        if (!productionData.productionUnitId) newErrors.productionUnitId = 'Required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const renderDepartmentForm = () => {
    switch (departmentName) {
      case 'hr':
        return <HRForm data={formData} updateData={updateFormData} errors={errors} />;
      case 'sales':
        return <SalesForm data={formData} updateData={updateFormData} errors={errors} />;
      case 'marketing':
        return <MarketingForm data={formData} updateData={updateFormData} errors={errors} />;
      case 'production':
        return <ProductionForm data={formData} updateData={updateFormData} errors={errors} />;
      case 'accounts':
      case 'accountant':
        return <AccountantForm data={formData} updateData={updateFormData} errors={errors} />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <p style={{ color: '#6b7280' }}>No department-specific data required for {selectedDepartment?.name}</p>
          </div>
        );
    }
  };

  return (
    <div className="wizard-form">
      <h2 className="form-section-title">
        Step 2 of 3: {selectedDepartment?.name || 'Department'} Details
      </h2>

      {errors.general && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          {errors.general}
        </div>
      )}

      <div className="form-section">
        {renderDepartmentForm()}
      </div>

      <div className="wizard-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Page2DepartmentDetails;

