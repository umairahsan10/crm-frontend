import React, { useState } from 'react';
import './EmployeeForm.css';

const initialState = {
  // Basic Information (Required)
  firstName: '',
  lastName: '',
  email: '',
  gender: '',
  passwordHash: '',
  
  // Basic Information (Optional)
  phone: '',
  cnic: '',
  address: '',
  maritalStatus: false,
  dob: '',
  emergencyContact: '',
  
  // Employment Information (Required)
  departmentId: '',
  roleId: '',
  
  // Employment Information (Optional)
  managerId: '',
  teamLeadId: '',
  status: 'active',
  startDate: '',
  endDate: '',
  employmentType: 'full_time',
  modeOfWork: 'hybrid',
  remoteDaysAllowed: 0,
  periodType: 'probation',
  dateOfConfirmation: '',
  
  // Work Schedule
  shiftStart: '09:00',
  shiftEnd: '17:00',
  
  // Compensation
  bonus: 0,
  
  // Legacy fields for compatibility
  middleName: '',
  employeeId: '',
  employeeType: '',
  employeeStatus: '',
  employeeEndDate: '',
  dateOfHire: '',
  department: '',
  jobTitle: '',
  location: 'Main Location',
  sourceOfHire: '',
  salary: '',
  mobile: '',
  otherEmail: '',
  dateOfBirth: '',
  nationality: '',
  address1: '',
  address2: '',
  city: '',
  country: '',
  province: '',
  postCode: '',
  biography: '',
  sendWelcome: true,
};

type State = typeof initialState;



interface EmployeeFormProps {
  onClose: () => void;
  onSave?: (employeeData: any) => void;
  employee?: any;
  departments?: Array<{ id: number; name: string }>;
  roles?: Array<{ id: number; name: string }>;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onClose, onSave, employee, departments = [], roles = [] }) => {
  const validateRequiredFields = (formData: Record<string, unknown>, requiredFields: string[]) => {
    const errors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = 'This field is required';
      }
    });
    return errors;
  };

  // Initialize form with employee data if provided (for editing)
  const getInitialFormState = (): State => {
    if (!employee) return initialState;
    
    return {
      // Basic Information (Required)
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      gender: employee.gender || '',
      passwordHash: '', // Don't pre-fill password for security
      
      // Basic Information (Optional)
      phone: employee.phone || '',
      cnic: employee.cnic || '',
      address: employee.address || '',
      maritalStatus: employee.maritalStatus || false,
      dob: employee.dob || '',
      emergencyContact: employee.emergencyContact || '',
      
      // Employment Information (Required)
      departmentId: employee.departmentId?.toString() || '',
      roleId: employee.roleId?.toString() || '',
      
      // Employment Information (Optional)
      managerId: employee.managerId?.toString() || '',
      teamLeadId: employee.teamLeadId?.toString() || '',
      status: employee.status || 'active',
      startDate: employee.startDate || '',
      endDate: employee.endDate || '',
      employmentType: employee.employmentType || 'full_time',
      modeOfWork: employee.modeOfWork || 'hybrid',
      remoteDaysAllowed: employee.remoteDaysAllowed || 0,
      periodType: employee.periodType || 'probation',
      dateOfConfirmation: employee.dateOfConfirmation || '',
      
      // Work Schedule
      shiftStart: employee.shiftStart || '09:00',
      shiftEnd: employee.shiftEnd || '17:00',
      
      // Compensation
      bonus: employee.bonus || 0,
      
      // Legacy fields for compatibility
      middleName: '',
      employeeId: employee.id?.toString() || '',
      employeeType: employee.employmentType || '',
      employeeStatus: employee.status || '',
      employeeEndDate: employee.endDate || '',
      dateOfHire: employee.startDate || '',
      department: employee.department?.name || '',
      jobTitle: employee.role?.name || '',
      location: 'Main Location',
      sourceOfHire: '',
      salary: employee.bonus?.toString() || '',
      mobile: employee.phone || '',
      otherEmail: '',
      dateOfBirth: employee.dob || '',
      nationality: '',
      address1: employee.address || '',
      address2: '',
      city: '',
      country: '',
      province: '',
      postCode: '',
      biography: '',
      sendWelcome: false,
    };
  };

  const [form, setForm] = useState<State>(getInitialFormState());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation function
  const validateField = (name: string, value: string): string => {
    if (mainSectionRequiredFields.includes(name as keyof State) && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Check if all required fields in the main section are filled (based on Prisma schema)
  const mainSectionRequiredFields: (keyof State)[] = ['firstName', 'lastName', 'email', 'gender', 'passwordHash', 'departmentId', 'roleId'];



  // Function to create readable form data content
  const createFormDataContent = (formData: State): string => {
    const fieldLabels: Record<string, string> = {
      firstName: 'First Name',
      middleName: 'Middle Name',
      lastName: 'Last Name',
      employeeId: 'Employee ID',
      email: 'Email',
      employeeType: 'Employee Type',
      employeeStatus: 'Employee Status',
      employeeEndDate: 'Employee End Date',
      dateOfHire: 'Date of Hire',
      department: 'Department',
      jobTitle: 'Job Title',
      location: 'Location',
      sourceOfHire: 'Source of Hire',
      salary: 'Salary',
      mobile: 'Mobile',
      phone: 'Phone',
      otherEmail: 'Other Email',
      dateOfBirth: 'Date of Birth',
      nationality: 'Nationality',
      gender: 'Gender',
      address1: 'Address 1',
      address2: 'Address 2',
      city: 'City',
      country: 'Country',
      province: 'Province/State',
      postCode: 'Post Code/Zip Code',
      biography: 'Biography',
      sendWelcome: 'Send Welcome Email',
    };

    let content = 'EMPLOYEE FORM SUBMISSION\n';
    content += '========================\n\n';

    // Add all form fields with their values
    Object.entries(formData).forEach(([key, value]) => {
      const label = fieldLabels[key] || key;
      
      if (typeof value === 'boolean') {
        content += `${label}: ${value ? 'Yes' : 'No'}\n`;
      } else if (value && value.toString().trim() !== '') {
        content += `${label}: ${value}\n`;
      }
    });

    content += '\nSubmitted on: ' + new Date().toLocaleString();
    
    return content;
  };



  // Function to append to form-submission.txt file
  const appendToExistingFile = async () => {
    // Check if File System Access API is available
    if (!('showSaveFilePicker' in window)) {
      // Fallback to localStorage approach
      const submission = {
        data: form,
        timestamp: new Date().toISOString(),
        readableContent: createFormDataContent(form)
      };
      
      // Get existing submissions from localStorage
      const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      existingSubmissions.push(submission);
      
      // Save updated submissions back to localStorage
      localStorage.setItem('formSubmissions', JSON.stringify(existingSubmissions));
      
      // Create combined file content with all submissions
      let content = 'EMPLOYEE FORM SUBMISSIONS\n==========================\n\n';
      existingSubmissions.forEach((sub: { data: State; timestamp: string; readableContent: string }, index: number) => {
        content += `SUBMISSION #${index + 1}\n`;
        content += `Submitted: ${new Date(sub.timestamp).toLocaleString()}\n`;
        content += '─'.repeat(50) + '\n';
        content += sub.readableContent.replace('EMPLOYEE FORM SUBMISSION\n========================\n\n', '');
        content += '\n\n';
      });
      
      // Create and download .txt file with all submissions
      const fileName = `form-submission.txt`;
      const blob = new Blob([content], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const newSubmissionContent = createFormDataContent(form);
    let submissionEntry = `\n\nSUBMISSION #${Date.now()}\n`;
    submissionEntry += `Submitted: ${new Date().toLocaleString()}\n`;
    submissionEntry += '─'.repeat(50) + '\n';
    submissionEntry += newSubmissionContent.replace('EMPLOYEE FORM SUBMISSION\n========================\n\n', '');

    try {
      // Try to open existing form-submission.txt file
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileHandle = await (window as any).showOpenFilePicker({
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt'] }
        }],
        multiple: false
      });

      const file = await fileHandle[0].getFile();
      const existingContent = await file.text();
      
      // Append new submission to existing content
      const updatedContent = existingContent + submissionEntry;
      
      // Write back to the same file
      const writable = await fileHandle[0].createWritable();
      await writable.write(updatedContent);
      await writable.close();
      
    } catch {
      // If form-submission.txt doesn't exist, create it with header
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: 'form-submission.txt',
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt'] }
        }]
      });

      const content = 'EMPLOYEE FORM SUBMISSIONS\n==========================\n\n' + submissionEntry;
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    }
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Mark field as touched immediately
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate field immediately
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    
    // Mark field as touched on key up
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on key up for immediate feedback
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For editing, password is not required (it's already set)
    // For creating, password is required
    const requiredFields = employee 
      ? ['firstName', 'lastName', 'email', 'gender', 'departmentId', 'roleId']
      : ['firstName', 'lastName', 'email', 'gender', 'passwordHash', 'departmentId', 'roleId'];
    
    const newErrors = validateRequiredFields(form, requiredFields);

    setErrors(newErrors);
    setTouched((prev) => {
      const allTouched = { ...prev };
      requiredFields.forEach(field => allTouched[field] = true);
      return allTouched;
    });

    if (Object.keys(newErrors).length > 0) return;

    // Continue submission logic...
    try {
      if (onSave) {
        // Create API-compatible data structure
        const apiData = {
          // Required fields (based on Prisma schema)
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          gender: form.gender,
          departmentId: parseInt(form.departmentId),
          roleId: parseInt(form.roleId),
          
          // Password only required for create operations
          ...(form.passwordHash && { passwordHash: form.passwordHash }),
          
          // Optional fields (only include if they have values)
          phone: form.phone || undefined,
          cnic: form.cnic || undefined,
          address: form.address || undefined,
          maritalStatus: form.maritalStatus || undefined,
          dob: form.dob || undefined,
          emergencyContact: form.emergencyContact || undefined,
          managerId: form.managerId ? parseInt(form.managerId) : undefined,
          teamLeadId: form.teamLeadId ? parseInt(form.teamLeadId) : undefined,
          status: form.status || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          employmentType: form.employmentType || undefined,
          modeOfWork: form.modeOfWork || undefined,
          remoteDaysAllowed: form.remoteDaysAllowed || undefined,
          periodType: form.periodType || undefined,
          dateOfConfirmation: form.dateOfConfirmation || undefined,
          shiftStart: form.shiftStart || undefined,
          shiftEnd: form.shiftEnd || undefined,
          bonus: form.bonus || undefined,
          
          // Metadata for form handling
          isEdit: !!employee,
          employeeId: employee?.id
        };
        
        await onSave(apiData);
      } else {
        await appendToExistingFile();
      }
      // Reset form and close modal on successful submission
      setForm(initialState);
      setErrors({});
      setTouched({});
      setShowAdvanced(false);
      onClose();
    } catch {
      // Silently handle error - form will still reset
    }
  };

  return (
    <div className="employee-form-modal">
      <form id="employee-form" className="employee-form" onSubmit={handleSubmit}>
        <div className="employee-form-section">
          {/* Basic Information */}
          <h4>Basic Information</h4>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>First Name<span className="required">*</span></label>
              <input 
                name="firstName" 
                value={form.firstName} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.firstName && errors.firstName ? 'error' : ''}
              />
              {touched.firstName && errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>Last Name<span className="required">*</span></label>
              <input 
                name="lastName" 
                value={form.lastName} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.lastName && errors.lastName ? 'error' : ''}
              />
              {touched.lastName && errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Email<span className="required">*</span></label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.email && errors.email ? 'error' : ''}
              />
              {touched.email && errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>Gender<span className="required">*</span></label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.gender && errors.gender ? 'error' : ''}
              >
                <option value="">- Select Gender -</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {touched.gender && errors.gender && (
                <span className="error-message">{errors.gender}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>CNIC</label>
              <input name="cnic" value={form.cnic} onChange={handleChange} placeholder="12345-1234567-1" />
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>
                {employee ? 'New Password (leave blank to keep current)' : 'Password'}
                {!employee && <span className="required">*</span>}
              </label>
              <input 
                name="passwordHash" 
                type="password" 
                value={form.passwordHash} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.passwordHash && errors.passwordHash ? 'error' : ''}
                placeholder={employee ? "Enter new password (optional)" : "Enter password"}
              />
              {touched.passwordHash && errors.passwordHash && (
                <span className="error-message">{errors.passwordHash}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>Phone</label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Date of Birth</label>
              <input name="dob" type="date" value={form.dob} onChange={handleChange} />
            </div>
            <div className="employee-form-field">
              <label>Emergency Contact</label>
              <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field" style={{ flex: 1 }}>
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>
            <div className="employee-form-field">
              <label>
                <input type="checkbox" name="maritalStatus" checked={form.maritalStatus} onChange={handleChange} />
                Married
              </label>
            </div>
          </div>

          {/* Employment Information */}
          <h4>Employment Information</h4>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Department<span className="required">*</span></label>
              <select 
                name="departmentId" 
                value={form.departmentId} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.departmentId && errors.departmentId ? 'error' : ''}
              >
                <option value="">- Select Department -</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {touched.departmentId && errors.departmentId && (
                <span className="error-message">{errors.departmentId}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>Role<span className="required">*</span></label>
              <select 
                name="roleId" 
                value={form.roleId} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.roleId && errors.roleId ? 'error' : ''}
              >
                <option value="">- Select Role -</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id.toString()}>
                    {role.name}
                  </option>
                ))}
              </select>
              {touched.roleId && errors.roleId && (
                <span className="error-message">{errors.roleId}</span>
              )}
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Status<span className="required">*</span></label>
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.status && errors.status ? 'error' : ''}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
              {touched.status && errors.status && (
                <span className="error-message">{errors.status}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>Employment Type<span className="required">*</span></label>
              <select 
                name="employmentType" 
                value={form.employmentType} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.employmentType && errors.employmentType ? 'error' : ''}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
              </select>
              {touched.employmentType && errors.employmentType && (
                <span className="error-message">{errors.employmentType}</span>
              )}
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Start Date<span className="required">*</span></label>
              <input 
                name="startDate" 
                type="date" 
                value={form.startDate} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.startDate && errors.startDate ? 'error' : ''}
              />
              {touched.startDate && errors.startDate && (
                <span className="error-message">{errors.startDate}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>End Date</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} />
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Mode of Work</label>
              <select name="modeOfWork" value={form.modeOfWork} onChange={handleChange}>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On Site</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="employee-form-field">
              <label>Remote Days Allowed</label>
              <input 
                name="remoteDaysAllowed" 
                type="number" 
                value={form.remoteDaysAllowed} 
                onChange={handleChange}
                min="0"
                max="5"
              />
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Period Type</label>
              <select name="periodType" value={form.periodType} onChange={handleChange}>
                <option value="probation">Probation</option>
                <option value="confirmed">Confirmed</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div className="employee-form-field">
              <label>Date of Confirmation</label>
              <input name="dateOfConfirmation" type="date" value={form.dateOfConfirmation} onChange={handleChange} />
            </div>
          </div>

          {/* Work Schedule */}
          <h4>Work Schedule</h4>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Shift Start</label>
              <input name="shiftStart" type="time" value={form.shiftStart} onChange={handleChange} />
            </div>
            <div className="employee-form-field">
              <label>Shift End</label>
              <input name="shiftEnd" type="time" value={form.shiftEnd} onChange={handleChange} />
            </div>
          </div>

          {/* Compensation */}
          <h4>Compensation</h4>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Bonus</label>
              <input 
                name="bonus" 
                type="number" 
                value={form.bonus} 
                onChange={handleChange}
                min="0"
                step="1"
              />
            </div>
            <div className="employee-form-field">
              <label>
                <input type="checkbox" checked={showAdvanced} onChange={() => setShowAdvanced((v) => !v)} /> Show Advanced Fields
              </label>
            </div>
          </div>
          {Object.values(errors).some(Boolean) && (
            <div className="global-error-message">
              Please fill in all required fields
            </div>
          )}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {employee ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
        </div>
        {showAdvanced && (
          <div className="employee-form-advanced">
            <h4>Work</h4>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Department</label>
                <select name="department" value={form.department} onChange={handleChange}>
                  <option value="">- Select Department -</option>
                  <option value="hr">HR</option>
                  <option value="development">Development</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
              <div className="employee-form-field">
                <label>Job Title</label>
                <select name="jobTitle" value={form.jobTitle} onChange={handleChange}>
                  <option value="">- Select Designation -</option>
                  <option value="manager">Manager</option>
                  <option value="developer">Developer</option>
                  <option value="salesrep">Sales Rep</option>
                </select>
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} />
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Source of Hire</label>
                <select name="sourceOfHire" value={form.sourceOfHire} onChange={handleChange}>
                  <option value="">- Select -</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <div className="employee-form-field">
                <label>Salary</label>
                <input name="salary" value={form.salary} onChange={handleChange} placeholder="Enter Salary" />
              </div>
            </div>
            <h4>Personal Details</h4>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Mobile</label>
                <input name="mobile" value={form.mobile} onChange={handleChange} />
              </div>
              <div className="employee-form-field">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Other Email</label>
                <input name="otherEmail" value={form.otherEmail} onChange={handleChange} />
              </div>
              <div className="employee-form-field">
                <label>Date of Birth</label>
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Nationality</label>
                <select name="nationality" value={form.nationality} onChange={handleChange}>
                  <option value="">- Select -</option>
                  <option value="pakistani">Pakistani</option>
                  <option value="american">American</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="employee-form-field">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <h4>Address</h4>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Address 1</label>
                <input name="address1" value={form.address1} onChange={handleChange} />
              </div>
              <div className="employee-form-field">
                <label>Address 2</label>
                <input name="address2" value={form.address2} onChange={handleChange} />
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} />
              </div>
              <div className="employee-form-field">
                <label>Country</label>
                <select name="country" value={form.country} onChange={handleChange}>
                  <option value="">- Select -</option>
                  <option value="pakistan">Pakistan</option>
                  <option value="usa">USA</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field">
                <label>Province / State</label>
                <select name="province" value={form.province} onChange={handleChange}>
                  <option value="">- Select -</option>
                  <option value="punjab">Punjab</option>
                  <option value="sindh">Sindh</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="employee-form-field">
                <label>Post Code/Zip Code</label>
                <input name="postCode" value={form.postCode} onChange={handleChange} />
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field" style={{ flex: 1 }}>
                <label>Biography</label>
                <textarea name="biography" value={form.biography} onChange={handleChange} />
              </div>
            </div>
            <div className="employee-form-row">
              <div className="employee-form-field notification-field">
                <label>
                  <input type="checkbox" name="sendWelcome" checked={form.sendWelcome} onChange={handleChange} />
                  Send the employee a welcome email.
                </label>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EmployeeForm; 