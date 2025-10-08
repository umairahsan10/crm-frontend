import React, { useState, useEffect } from 'react';
import { getEmployeesApi, type Department, type Role } from '../../../../apis/hr-employees';

interface Page1Props {
  formData: any;
  updateFormData: (data: any) => void;
  departments: Department[];
  roles: Role[];
  onNext: () => void;
}

const Page1EmployeeDetails: React.FC<Page1Props> = ({
  formData,
  updateFormData,
  departments,
  roles,
  onNext
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [managers, setManagers] = useState<any[]>([]);
  const [teamLeads, setTeamLeads] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Load managers and team leads when department changes
  useEffect(() => {
    const loadEmployees = async () => {
      if (!formData.departmentId) return;

      setLoadingEmployees(true);
      try {
        const response = await getEmployeesApi({
          departmentId: formData.departmentId,
          status: 'active',
          limit: 100
        });

        const managerList = response.employees.filter(emp => 
          ['manager', 'unit head', 'unit_head'].includes(emp.role.name.toLowerCase())
        );
        const teamLeadList = response.employees.filter(emp => 
          ['team lead', 'team_lead'].includes(emp.role.name.toLowerCase())
        );

        setManagers(managerList);
        setTeamLeads(teamLeadList);
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [formData.departmentId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Personal Information
    if (!formData.firstName?.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.gender) newErrors.gender = 'Required';
    if (!formData.cnic?.trim()) newErrors.cnic = 'Required';
    if (!formData.address?.trim()) newErrors.address = 'Required';
    if (!formData.dob) newErrors.dob = 'Required';
    if (!formData.emergencyContact?.trim()) newErrors.emergencyContact = 'Required';

    // Employment Information
    if (!formData.departmentId) newErrors.departmentId = 'Required';
    if (!formData.roleId) newErrors.roleId = 'Required';
    if (!formData.managerId) newErrors.managerId = 'Required';
    if (!formData.teamLeadId) newErrors.teamLeadId = 'Required';
    if (!formData.startDate) newErrors.startDate = 'Required';
    if (!formData.modeOfWork) newErrors.modeOfWork = 'Required';
    if (formData.remoteDaysAllowed === undefined || formData.remoteDaysAllowed === '') {
      newErrors.remoteDaysAllowed = 'Required';
    }
    if (!formData.employmentType) newErrors.employmentType = 'Required';
    if (!formData.periodType) newErrors.periodType = 'Required';
    if (!formData.dateOfConfirmation) newErrors.dateOfConfirmation = 'Required';
    if (!formData.shiftStart) newErrors.shiftStart = 'Required';
    if (!formData.shiftEnd) newErrors.shiftEnd = 'Required';
    if (formData.shiftStart && formData.shiftEnd && formData.shiftStart >= formData.shiftEnd) {
      newErrors.shiftEnd = 'Must be after start time';
    }
    if (formData.bonus === undefined || formData.bonus === '') newErrors.bonus = 'Required';
    if (!formData.passwordHash?.trim()) newErrors.passwordHash = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="wizard-form">
      <h2 className="form-section-title">Step 1 of 3: Employee Details</h2>

      {/* Personal Information */}
      <div className="form-section">
        <h3 className="form-section-title">Personal Information</h3>
        
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label form-label-required">First Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.firstName || ''}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
            />
            {errors.firstName && <span className="form-error">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Last Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.lastName || ''}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
            />
            {errors.lastName && <span className="form-error">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email || ''}
              onChange={(e) => updateFormData({ email: e.target.value })}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Gender</label>
            <select
              className="form-select"
              value={formData.gender || ''}
              onChange={(e) => updateFormData({ gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            {errors.gender && <span className="form-error">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">CNIC</label>
            <input
              type="text"
              className="form-input"
              value={formData.cnic || ''}
              onChange={(e) => updateFormData({ cnic: e.target.value })}
              placeholder="12345-1234567-1"
            />
            {errors.cnic && <span className="form-error">{errors.cnic}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone (Optional)</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone || ''}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+923001234567"
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={formData.dob || ''}
              onChange={(e) => updateFormData({ dob: e.target.value })}
            />
            {errors.dob && <span className="form-error">{errors.dob}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Marital Status</label>
            <div className="form-radio-group">
              <label className="form-radio-option">
                <input
                  type="radio"
                  checked={!formData.maritalStatus}
                  onChange={() => updateFormData({ maritalStatus: false })}
                />
                Single
              </label>
              <label className="form-radio-option">
                <input
                  type="radio"
                  checked={formData.maritalStatus}
                  onChange={() => updateFormData({ maritalStatus: true })}
                />
                Married
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Emergency Contact</label>
            <input
              type="tel"
              className="form-input"
              value={formData.emergencyContact || ''}
              onChange={(e) => updateFormData({ emergencyContact: e.target.value })}
            />
            {errors.emergencyContact && <span className="form-error">{errors.emergencyContact}</span>}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label form-label-required">Address</label>
          <textarea
            className="form-textarea"
            value={formData.address || ''}
            onChange={(e) => updateFormData({ address: e.target.value })}
          />
          {errors.address && <span className="form-error">{errors.address}</span>}
        </div>
      </div>

      {/* Employment Information */}
      <div className="form-section">
        <h3 className="form-section-title">Employment Information</h3>
        
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label form-label-required">Department</label>
            <select
              className="form-select"
              value={formData.departmentId || ''}
              onChange={(e) => updateFormData({ departmentId: e.target.value ? parseInt(e.target.value) : '' })}
            >
              <option value="">Select</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.departmentId && <span className="form-error">{errors.departmentId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Role</label>
            <select
              className="form-select"
              value={formData.roleId || ''}
              onChange={(e) => updateFormData({ roleId: e.target.value ? parseInt(e.target.value) : '' })}
            >
              <option value="">Select</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.roleId && <span className="form-error">{errors.roleId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Manager</label>
            <select
              className="form-select"
              value={formData.managerId || ''}
              onChange={(e) => updateFormData({ managerId: e.target.value ? parseInt(e.target.value) : '' })}
              disabled={!formData.departmentId || loadingEmployees}
            >
              <option value="">{loadingEmployees ? 'Loading...' : 'Select'}</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
            {errors.managerId && <span className="form-error">{errors.managerId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Team Lead</label>
            <select
              className="form-select"
              value={formData.teamLeadId || ''}
              onChange={(e) => updateFormData({ teamLeadId: e.target.value ? parseInt(e.target.value) : '' })}
              disabled={!formData.departmentId || loadingEmployees}
            >
              <option value="">{loadingEmployees ? 'Loading...' : 'Select'}</option>
              {teamLeads.map(t => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
            {errors.teamLeadId && <span className="form-error">{errors.teamLeadId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.startDate || ''}
              onChange={(e) => updateFormData({ startDate: e.target.value })}
            />
            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Mode of Work</label>
            <select
              className="form-select"
              value={formData.modeOfWork || ''}
              onChange={(e) => updateFormData({ modeOfWork: e.target.value })}
            >
              <option value="">Select</option>
              <option value="on_site">On Site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
            {errors.modeOfWork && <span className="form-error">{errors.modeOfWork}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Remote Days Allowed</label>
            <input
              type="number"
              className="form-input"
              value={formData.remoteDaysAllowed !== undefined ? formData.remoteDaysAllowed : ''}
              onChange={(e) => updateFormData({ remoteDaysAllowed: parseInt(e.target.value) || 0 })}
              min="0"
              max="7"
            />
            {errors.remoteDaysAllowed && <span className="form-error">{errors.remoteDaysAllowed}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Employment Type</label>
            <div className="form-radio-group">
              <label className="form-radio-option">
                <input
                  type="radio"
                  checked={formData.employmentType === 'full_time'}
                  onChange={() => updateFormData({ employmentType: 'full_time' })}
                />
                Full Time
              </label>
              <label className="form-radio-option">
                <input
                  type="radio"
                  checked={formData.employmentType === 'part_time'}
                  onChange={() => updateFormData({ employmentType: 'part_time' })}
                />
                Part Time
              </label>
            </div>
            {errors.employmentType && <span className="form-error">{errors.employmentType}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Period Type</label>
            <select
              className="form-select"
              value={formData.periodType || ''}
              onChange={(e) => updateFormData({ periodType: e.target.value })}
            >
              <option value="">Select</option>
              <option value="probation">Probation</option>
              <option value="permanent">Permanent</option>
              <option value="notice">Notice</option>
            </select>
            {errors.periodType && <span className="form-error">{errors.periodType}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Date of Confirmation</label>
            <input
              type="date"
              className="form-input"
              value={formData.dateOfConfirmation || ''}
              onChange={(e) => updateFormData({ dateOfConfirmation: e.target.value })}
            />
            {errors.dateOfConfirmation && <span className="form-error">{errors.dateOfConfirmation}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Shift Start</label>
            <input
              type="time"
              className="form-input"
              value={formData.shiftStart || ''}
              onChange={(e) => updateFormData({ shiftStart: e.target.value })}
            />
            {errors.shiftStart && <span className="form-error">{errors.shiftStart}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Shift End</label>
            <input
              type="time"
              className="form-input"
              value={formData.shiftEnd || ''}
              onChange={(e) => updateFormData({ shiftEnd: e.target.value })}
            />
            {errors.shiftEnd && <span className="form-error">{errors.shiftEnd}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Bonus</label>
            <input
              type="number"
              className="form-input"
              value={formData.bonus !== undefined ? formData.bonus : ''}
              onChange={(e) => updateFormData({ bonus: parseFloat(e.target.value) || 0 })}
              min="0"
            />
            {errors.bonus && <span className="form-error">{errors.bonus}</span>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.passwordHash || ''}
              onChange={(e) => updateFormData({ passwordHash: e.target.value })}
            />
            {errors.passwordHash && <span className="form-error">{errors.passwordHash}</span>}
          </div>
        </div>
      </div>

      <div className="wizard-actions">
        <div></div>
        <button className="btn btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Page1EmployeeDetails;

