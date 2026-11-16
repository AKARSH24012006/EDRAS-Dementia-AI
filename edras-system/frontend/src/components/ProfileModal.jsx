import React, { useState, useRef, useEffect } from 'react';
import { X, User, Mail, Phone, Building, ShieldCheck, Camera, Check, RefreshCw } from 'lucide-react';
import { http, isNetworkError, serverMessage } from '../lib/backend';

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser, theme }) {
  const [fullName, setFullName] = useState(user?.full_name || 'Clinical User');
  const [email, setEmail] = useState(user?.email || 'user@edras-clinical.org');
  const [role, setRole] = useState(user?.role || 'Senior Neurologist');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [department, setDepartment] = useState(user?.department || 'Department of Neurology & Cognitive Sciences');
  const [profilePic, setProfilePic] = useState(user?.profile_pic || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef(null);
  const isPatient = user?.role === 'patient';

  // Re-sync the form every time the modal opens (it used to keep stale values).
  useEffect(() => {
    if (!isOpen) return;
    setFullName(user?.full_name || 'Clinical User');
    setEmail(user?.email || '');
    setRole(user?.role || 'Senior Neurologist');
    setPhone(user?.phone || '');
    setDepartment(user?.department || '');
    setProfilePic(user?.profile_pic || '');
    setSaveError(''); setSavedSuccess(false);
  }, [isOpen, user]);

  // Close with Escape, like the other dialogs
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setSaveError('');

    const updatedData = {
      username: user?.username || 'user',
      full_name: fullName,
      email: email,
      phone: phone,
      department: department,
      profile_pic: profilePic,
      // Patients can never change their own role (it would unlock clinician pages).
      ...(isPatient ? {} : { role }),
    };
    const keepRole = (u) => ({ ...u, role: isPatient ? 'patient' : (u.role || role) });

    try {
      const response = await http.put('/api/auth/profile', updatedData);
      onUpdateUser(keepRole(response.data?.user || updatedData));
    } catch (err) {
      if (!isNetworkError(err)) {
        setSaving(false);
        setSaveError(serverMessage(err, 'Profile could not be saved. Please try again.'));
        return;
      }
      onUpdateUser(keepRole(updatedData)); // offline demo: save locally
    }
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => { setSavedSuccess(false); onClose(); }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg med-panel p-6 rounded-3xl border border-sky-200/80 dark:border-slate-800 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-sky-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Edit Clinician Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Update institutional information and profile image</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Profile Picture Upload Section */}
          <div className="flex items-center space-x-4 p-3.5 bg-sky-50/70 dark:bg-slate-900/80 rounded-2xl border border-sky-200/60 dark:border-slate-800">
            <div className="relative">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-md" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
                  {fullName ? fullName.charAt(0) : 'U'}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-cyan-600 text-white shadow-md hover:bg-cyan-700 transition-all cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">Clinician Avatar Photo</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Upload JPG/PNG profile picture</p>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline mt-1 cursor-pointer"
              >
                Choose Image File
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Full Name & Credentials</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">{isPatient ? 'Account Type' : 'Medical Specialization'}</label>
              <select
                value={isPatient ? 'patient' : role}
                disabled={isPatient}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {isPatient && <option value="patient">Patient</option>}
                {!isPatient && (role === 'doctor' || ![ 'Senior Neurologist','Neuro-Radiologist','Cognitive Scientist','Chief Neurologist','General Practitioner'].includes(role)) && <option value={role}>{role === 'doctor' ? 'Clinician' : role}</option>}
                <option value="Senior Neurologist">Senior Neurologist</option>
                <option value="Neuro-Radiologist">Neuro-Radiologist</option>
                <option value="Cognitive Scientist">Cognitive Scientist</option>
                <option value="Chief Neurologist">Chief Neurologist</option>
                <option value="General Practitioner">General Practitioner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl btn-soft-secondary font-extrabold text-xs cursor-pointer"
            >
              Cancel
            </button>

            {saveError && <p role="alert" className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">{saveError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl btn-soft-primary font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
