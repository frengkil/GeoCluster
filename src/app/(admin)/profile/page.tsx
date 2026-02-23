'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User as UserIcon, Mail, Save, Lock, AlertCircle, CheckCircle, Camera, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAuth();
  
  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [profileMsg, setProfileMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Initialize state when user loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Password Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setProfileMsg({ type: 'error', text: 'Image size should be less than 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    
    if (!name.trim() || !email.trim()) {
      setProfileMsg({ type: 'error', text: 'Name and Email are required.' });
      return;
    }

    updateProfile({ name, email, avatar });
    setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    
    // Clear message after 3 seconds
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const success = await updatePassword(currentPass, newPass);
    if (success) {
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassMsg({ type: 'error', text: 'Current password is incorrect.' });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Navigation/Quick Info (Optional or kept simple) */}
        <div className="lg:col-span-1 space-y-6">
             {/* Profile Summary Card */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full mb-4 overflow-hidden border-4 border-white shadow-md relative">
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <UserIcon size={48} />
                        </div>
                    )}
                </div>
                <h2 className="font-bold text-lg text-slate-800">{name || 'User'}</h2>
                <p className="text-sm text-slate-500">{email || 'No email'}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        {user?.role || 'Admin'}
                    </span>
                </div>
             </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-8">
            {/* Profile Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <UserIcon size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800">Profile Information</h2>
                    <p className="text-xs text-slate-500">Update your account details and public profile.</p>
                </div>
            </div>
            
            <div className="p-6">
                {profileMsg && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                    profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {profileMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {profileMsg.text}
                </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-50">
                    <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-full border-2 border-slate-100 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center">
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={32} className="text-slate-300" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md group-hover:scale-105 border-2 border-white">
                            <Camera size={14} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        {avatar && (
                            <button 
                                type="button"
                                onClick={() => setAvatar('')}
                                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm border border-white"
                                title="Remove photo"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h3 className="font-medium text-slate-900">Profile Photo</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            This will be displayed on your profile and in the sidebar. <br/>
                            Max size 2MB. Supported formats: JPG, PNG.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                        <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm shadow-blue-200"
                    >
                    <Save size={18} /> Save Changes
                    </button>
                </div>
                </form>
            </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Lock size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800">Security</h2>
                    <p className="text-xs text-slate-500">Change your password and security settings.</p>
                </div>
            </div>
            
            <div className="p-6">
                {passMsg && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                    passMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {passMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {passMsg.text}
                </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                    <input 
                    type="password" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <input 
                    type="password" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Minimum 6 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                    <input 
                    type="password" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    />
                </div>

                <div className="pt-2 flex justify-end">
                    <button 
                    type="submit" 
                    className="bg-slate-800 text-white px-6 py-2.5 rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm"
                    >
                    <Lock size={18} /> Update Password
                    </button>
                </div>
                </form>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}