import React, { useState } from 'react';
import './EmployeeForm.css';

const initialState = {
  firstName: '',
  middleName: '',
  lastName: '',
  employeeId: '',
  email: '',
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
  phone: '',
  otherEmail: '',
  dateOfBirth: '',
  nationality: '',
  gender: '',
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
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onClose, onSave, employee: _employee }) => {
  const validateRequiredFields = (formData: Record<string, unknown>, requiredFields: string[]) => {
    const errors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = 'This field is required';
      }
    });
    return errors;
  };

  const [form, setForm] = useState<State>(initialState);
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

  // Check if all required fields in the main section are filled
  const mainSectionRequiredFields: (keyof State)[] = ['firstName', 'email', 'employeeType', 'employeeStatus', 'dateOfHire'];



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

    const requiredFields = ['firstName', 'email', 'employeeType', 'employeeStatus', 'dateOfHire'];
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
        await onSave(form);
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
              <label>Middle Name</label>
              <input name="middleName" value={form.middleName} onChange={handleChange} />
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
            <div className="employee-form-field">
              <label>Employee ID</label>
              <input name="employeeId" value={form.employeeId} onChange={handleChange} />
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
              <label>Employee Type<span className="required">*</span></label>
              <select 
                name="employeeType" 
                value={form.employeeType} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.employeeType && errors.employeeType ? 'error' : ''}
              >
                <option value="">- Select -</option>
                <option value="fulltime">Full Time</option>
                <option value="parttime">Part Time</option>
                <option value="contract">Contract</option>
              </select>
              {touched.employeeType && errors.employeeType && (
                <span className="error-message">{errors.employeeType}</span>
              )}
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Employee Status<span className="required">*</span></label>
              <select 
                name="employeeStatus" 
                value={form.employeeStatus} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.employeeStatus && errors.employeeStatus ? 'error' : ''}
              >
                <option value="">- Select -</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
              {touched.employeeStatus && errors.employeeStatus && (
                <span className="error-message">{errors.employeeStatus}</span>
              )}
            </div>
            <div className="employee-form-field">
              <label>Employee End Date</label>
              <input name="employeeEndDate" type="date" value={form.employeeEndDate} onChange={handleChange} />
            </div>
          </div>
          <div className="employee-form-row">
            <div className="employee-form-field">
              <label>Date of Hire<span className="required">*</span></label>
              <input 
                name="dateOfHire" 
                type="date" 
                value={form.dateOfHire} 
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
                className={touched.dateOfHire && errors.dateOfHire ? 'error' : ''}
              />
              {touched.dateOfHire && errors.dateOfHire && (
                <span className="error-message">{errors.dateOfHire}</span>
              )}
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