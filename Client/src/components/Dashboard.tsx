import { useState, useEffect } from 'react';
import api from '../lib/api';
import { FaUser, FaRegCheckSquare, FaListUl, FaRegClock, FaRegWindowClose, FaArrowLeft, FaCamera, FaRegMoon, FaRegSun } from 'react-icons/fa';
import { IoSettingsOutline, IoLogOutOutline } from 'react-icons/io5';
const acmLogo = "https://bvcoe.acm.org/static/media/ACM-BVP-logo.6425d80f.png";

interface DashboardProps {
  onLogout: () => void;
  userRole: 'member' | 'core-member' | 'head-of-dept';
  userEmail: string;
}

type DashboardSection = 'total-tasks' | 'available-tasks' | 'current-tasks' | 'profile' | 'settings';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'ongoing' | 'completed' | 'rejected' | 'available';
  rejectionReason?: string;
}

// removed unused UserProfile interface

export default function Dashboard({ onLogout, userRole, userEmail }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>('total-tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'completed' | 'ongoing' | 'rejected'>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [taskToReject, setTaskToReject] = useState<Task | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: userEmail,
    branch: '',
    year: '',
    section: '',
    department: '',
    profilePicture: '' as string | null,
  });

  useEffect(() => {
    api.get('/users/me')
      .then((res) => {
        const u = res.data?.data;
        if (u) {
          setProfileData({
            fullName: u.name || '',
            email: u.email || userEmail,
            branch: u.branch || '',
            year: (u as any).year || '',
            section: u.section || '',
            department: u.department || '',
            profilePicture: '',
          });
        }
      })
      .catch(() => {});
  }, [userEmail]);

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [availRes, ongoingRes] = await Promise.all([
          api.get('/tasks/available'),
          api.get('/tasks/ongoing'),
        ]);

        const available = (availRes.data?.tasks || availRes.data || []).map((t: any) => ({
          id: t._id || t.title,
          title: t.title,
          description: t.description,
          deadline: t.deadline,
          status: 'available' as const,
        }));

        const ongoing = (ongoingRes.data || []).map((t: any) => ({
          id: t._id || t.title,
          title: t.title,
          description: t.description,
          deadline: t.deadline,
          status: 'ongoing' as const,
        }));

        setTasks([...available, ...ongoing]);
      } catch (e) {
        // keep empty on failure
      }
    };
    load();
  }, []);

  const sidebarItems = [
    
    { id: 'total-tasks' as DashboardSection, label: 'Total Tasks', icon: FaRegCheckSquare },
    { id: 'available-tasks' as DashboardSection, label: 'Available Tasks', icon: FaListUl },
    { id: 'current-tasks' as DashboardSection, label: 'Current Tasks', icon: FaRegClock },
    { id: 'profile' as DashboardSection, label: 'My Profile', icon: FaUser },
    { id: 'settings' as DashboardSection, label: 'Settings', icon: IoSettingsOutline },
    
  ];

  const departments = [
    'Technical',
    'Design',
    'Content and Documentation',
    'Social Media',
    'Event and Management',
    'Outreach'
  ];

  const branches = [
    'CSE',
    'IT',
    'ECE',
    'EEE',
    'MAE',
    'ICE'
  ];

  const years = ['1st', '2nd', '3rd', '4th'];

  const sections = [1, 2, 3, 4];

  const getInitials = () => (profileData.fullName || 'User').split(' ').map(s => s[0]).slice(0,2).join('');

  const showConfirmationMessage = (message: string) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const handleAcceptTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      await api.put('/tasks/accept', { title: task.title });
      setTasks(tasks.map(t => (t.id === taskId ? { ...t, status: 'ongoing' as const } : t)));
      showConfirmationMessage(`Task "${task?.title}" has been accepted!`);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to accept task');
    }
  };

  const handleRejectTask = (task: Task) => {
    setTaskToReject(task);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const confirmRejectTask = async () => {
    if (!taskToReject || !rejectionReason.trim()) return;
    try {
      await api.put('/tasks/reject', { title: taskToReject.title, status: 'rejected', rejectionReason });
      setTasks(tasks.map(task =>
        task.id === taskToReject.id
          ? { ...task, status: 'rejected' as const, rejectionReason }
          : task
      ));
      showConfirmationMessage(`Task "${taskToReject.title}" has been rejected.`);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to reject task');
    } finally {
      setShowRejectModal(false);
      setTaskToReject(null);
      setRejectionReason('');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed' as const } : task
    ));
    const task = tasks.find(t => t.id === taskId);
    showConfirmationMessage(`Task "${task?.title}" has been completed!`);
  };

  const handleChangePassword = async () => {
    try {
      if (!newPassword || !confirmNewPassword) {
        alert('New password and confirmation are required');
        return;
      }
      await api.put('/users/change-password', { newPassword, confirmNewPassword });
      showConfirmationMessage('Password updated successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update password');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileData.fullName,
        email: profileData.email,
        branch: profileData.branch,
        section: profileData.section,
        department: profileData.department,
      };
      await api.put('/users/me', payload);
      showConfirmationMessage('Profile updated successfully!');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profilePicture: reader.result as string });
        showConfirmationMessage('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    setActiveSection('profile');
  };

  const bgClass = isDarkMode ? 'bg-[#0a1128]' : 'bg-gray-50';
  const cardBgClass = isDarkMode ? 'bg-[#0f1941]' : 'bg-white';
  const borderClass = isDarkMode ? 'border-blue-900/20' : 'border-gray-200';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDarkMode ? 'text-white' : 'text-gray-600';
  const inputBgClass = isDarkMode ? 'bg-[#0a1128]' : 'bg-gray-50';

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-sm`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>
              My Profile
            </h2>
            
            {/* Profile Picture Section */}
            <div className="flex items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6 shadow-lg shadow-cyan-500/25 overflow-hidden">
                  {profileData.profilePicture ? (
                    <img 
                      src={profileData.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <label className="absolute bottom-0 right-4 bg-cyan-500 hover:bg-cyan-600 text-white p-1 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-110 shadow-lg">
                  <FaCamera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${textClass}`}>{profileData.fullName}</h3>
                <p className={`${mutedTextClass}`}>{profileData.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                  {userRole === 'head-of-dept' ? 'Head of Department' : 'Core Member'} - {profileData.department}
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>Branch</label>
                  <select
                    value={profileData.branch}
                    onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                    className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch} className={`${inputBgClass}`}>{branch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>Year</label>
                  <select
                    value={profileData.year}
                    onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                    className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  >
                    {years.map(year => (
                      <option key={year} value={year} className={`${inputBgClass}`}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>Section</label>
                  <select
                    value={profileData.section}
                    onChange={(e) => setProfileData({ ...profileData, section: e.target.value })}
                    className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  >
                    {sections.map(section => (
                      <option key={section} value={String(section)} className={`${inputBgClass}`}>{section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>ACM Department</label>
                <select
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept} className={`${inputBgClass}`}>{dept}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/25"
              >
                Update Profile
              </button>
            </form>
          </div>
        );

      case 'total-tasks':
        const filteredTasks = tasks.filter(task =>
          task.status !== 'available' && (taskFilter === 'all' || task.status === taskFilter)
        );
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-xl p-8 animate-fade-in`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>Total Tasks</h2>
            <div className="flex gap-4 mb-6 flex-wrap">
              {['all', 'completed', 'ongoing', 'rejected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter as typeof taskFilter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    taskFilter === filter
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : `${inputBgClass} ${mutedTextClass} hover:${cardBgClass} border ${borderClass}`
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {filteredTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`border ${borderClass} rounded-lg p-6 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-xl font-semibold ${textClass}`}>{task.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : task.status === 'ongoing'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                  <p className={`${mutedTextClass} mb-3`}>{task.description}</p>
                  <div className={`flex items-center text-sm ${mutedTextClass}`}>
                    <FaRegClock size={16} className="mr-2" />
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  {task.status === 'rejected' && task.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
                      <p className="text-lg text-red-400">
                        <strong>Rejection Reason:</strong> {task.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="py-24 text-center text-gray-400">No tasks</div>
              )}
            </div>
          </div>
        );

      case 'available-tasks':
        const availableTasks = tasks.filter(task => task.status === 'available');
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-xl p-8 animate-fade-in`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>Available Tasks</h2>
            <div className="space-y-4">
              {availableTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`border ${borderClass} ${cardBgClass} rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <h3 className={`text-2xl font-semibold ${textClass} mb-3`}>{task.title}</h3>
                  <p className={`${mutedTextClass} text-lg mb-3`}>{task.description}</p>
                  <div className={`flex items-center text-sm ${mutedTextClass} mb-4`}>
                    <FaRegClock size={16} className="mr-2" />
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptTask(task.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                    >
                      Accept Task
                    </button>
                    <button
                      onClick={() => handleRejectTask(task)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
                    >
                      Reject Task
                    </button>
                  </div>
                </div>
              ))}
              {availableTasks.length === 0 && (
                <div className="py-24 text-center text-gray-400">No available tasks</div>
              )}
            </div>
          </div>
        );

      case 'current-tasks':
        const currentTasks = tasks.filter(task => task.status === 'ongoing');
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-xl p-8 animate-fade-in`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>Current Tasks</h2>
            <div className="space-y-4">
              {currentTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`border ${borderClass} rounded-lg p-6 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <h3 className={`text-xl font-semibold ${textClass} mb-3`}>{task.title}</h3>
                  <p className={`${mutedTextClass} mb-3`}>{task.description}</p>
                  <div className={`flex items-center text-sm ${mutedTextClass} mb-4`}>
                    <FaRegClock size={16} className="mr-2" />
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                  >
                    Mark as Complete
                  </button>
                </div>
              ))}
              {currentTasks.length === 0 && (
                <div className="py-24 text-center text-gray-400">No current tasks</div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-sm`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>
              Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Account Settings</h3>
                <div className="space-y-4">
                  <div className={`flex items-center p-4 ${inputBgClass}/50 rounded-lg border ${borderClass} transition-colors duration-300`}>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <div className="w-10 h-6 bg-gray-600 rounded-full"></div>
                        <div className="dot absolute left-1 top-1 w-4 h-4 rounded-full transition transform translate-x-4 bg-cyan-400"></div>
                      </div>
                      <span className={`ml-3 ${mutedTextClass}`}>Receive email notifications for task updates</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-blue-900/20">
                <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>New Password</label>
                    <input
                      type="password"
                      className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${mutedTextClass} mb-2`}>Confirm New Password</label>
                    <input
                      type="password"
                      className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>
                  <button onClick={handleChangePassword} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} flex`}>
      <aside className={`w-64 ${cardBgClass} border-r ${borderClass} p-6 animate-slide-in flex flex-col`}>
        <div className="mb-8">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-3 mb-2 hover:opacity-80 transition-opacity"
          >
            <img src={acmLogo} alt="ACM BVCOE Logo" className="h-10 w-auto -mr-1" />
            <span className={`text-3xl font-bold ${textClass}`}>ACM</span>
          </button>
          <p className={`pt-4 text-xl font-semibold ${mutedTextClass}`}>Member Dashboard</p>
        </div>

        <nav className="space-y-2 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  activeSection === item.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : `${mutedTextClass} hover:${cardBgClass} hover:${textClass}`
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`pt-6 border-t ${borderClass} space-y-3`}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center px-4 py-3 ${mutedTextClass} hover:${textClass} rounded-lg transition-all duration-300 transform hover:scale-105`}
          >
            {isDarkMode ? <FaRegSun size={20} className="mr-3" /> : <FaRegMoon size={20} className="mr-3" />}
            <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <IoLogOutOutline size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      {showRejectModal && taskToReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-8 w-full max-w-2xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-scale-in m-4`}>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className={`mr-4 p-2 hover:${inputBgClass} rounded-lg transition-all duration-200 group`}
              >
                <FaArrowLeft size={24} className={mutedTextClass} />
              </button>
              <div className="flex items-center">
                <div className="bg-red-500/20 p-3 rounded-xl mr-4">
                  <FaRegWindowClose size={32} className="text-red-400" />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${textClass}`}>Reject Task</h2>
                  <p className={mutedTextClass}>Please provide a reason for rejection</p>
                </div>
              </div>
            </div>

            <div className={`mb-6 p-4 ${inputBgClass} border ${borderClass} rounded-lg animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-2`}>{taskToReject.title}</h3>
              <p className={`${mutedTextClass} text-sm`}>{taskToReject.description}</p>
            </div>

            <div className="mb-6">
              <label className={`block text-lg font-medium ${textClass} mb-3`}>
                Reason for Rejection <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-blue-500/50`}
                rows={6}
                placeholder="Enter your reason for rejecting this task..."
                autoFocus
              />
              <p className={`mt-2 text-sm ${mutedTextClass}`}>
                {rejectionReason.length} / 500 characters
              </p>
            </div>

            <div className={`${inputBgClass} border ${borderClass} rounded-lg p-4 mb-6 animate-fade-in`}>
              <h4 className={`text-sm font-semibold ${textClass} mb-2`}>Common Rejection Reasons:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Insufficient time',
                  'Lack of resources',
                  'Outside expertise',
                  'Conflicting priorities',
                  'Unclear requirements',
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setRejectionReason(reason)}
                    className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm hover:bg-blue-500/20 transition-all duration-200 transform hover:scale-105 border border-blue-500/30"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmRejectTask}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-red-500/50"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className={`flex-1 px-6 py-3 ${inputBgClass} ${textClass} rounded-lg font-semibold hover:${cardBgClass} transition-all duration-300 transform hover:scale-105 border ${borderClass} hover:border-blue-500/50`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3">
            <FaRegCheckSquare size={24} />
            <span className="font-medium">{confirmationMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
