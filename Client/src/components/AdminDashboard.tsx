import { useEffect, useState } from 'react';
import api from '../lib/api';
import { User, Plus, ListTodo, Settings, LogOut, Calendar, RefreshCw, Camera, Users, Check, X as XIcon, Phone, Moon, Sun } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  userRole: 'core-member' | 'head-of-dept';
}

type AdminSection = 'create-task' | 'manage-tasks' | 'total-tasks' | 'available-tasks' | 'current-tasks' | 'profile' | 'settings' | 'member-requests';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  deadline: string;
  status: 'available' | 'ongoing' | 'completed' | 'rejected';
  rejectionReason?: string;
}

interface MemberRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: 'member' | 'core-member' | 'head-of-dept';
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard({ onLogout, userRole }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('create-task');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Update the ACM BVCOE website with new design',
      assignedTo: 'John Doe',
      deadline: '2025-03-20',
      status: 'ongoing',
    },
    {
      id: '2',
      title: 'Event Planning',
      description: 'Organize the upcoming hackathon event',
      assignedTo: 'Jane Smith',
      deadline: '2025-03-25',
      status: 'completed',
    },
    {
      id: '3',
      title: 'Social Media Campaign',
      description: 'Create and manage social media posts for the upcoming workshop',
      assignedTo: 'Mike Johnson',
      deadline: '2025-03-18',
      status: 'rejected',
      rejectionReason: 'Currently overloaded with academic assignments and cannot take on additional tasks this week.'
    },
  ]);

  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [myTasks, setMyTasks] = useState<Array<{ id: string; title: string; description: string; deadline: string; status: 'available' | 'ongoing' | 'completed' | 'rejected'; rejectionReason?: string }>>([]);
  const [availableTasksAdmin, setAvailableTasksAdmin] = useState<Array<{ id: string; title: string; description: string; deadline: string; assignedTo?: string }>>([]);
  const [ongoingTasksAdmin, setOngoingTasksAdmin] = useState<Array<{ id: string; title: string; description: string; deadline: string; assignedTo?: string }>>([]);
  const [manageTasksAdmin, setManageTasksAdmin] = useState<Array<{ id: string; title: string; description: string; deadline: string; status: 'available' | 'ongoing' | 'completed' | 'rejected'; assignedTo?: string }>>([]);
  const [taskFilterAdmin, setTaskFilterAdmin] = useState<'all' | 'completed' | 'ongoing' | 'rejected'>('all');

  useEffect(() => {
    // Load profile from API
    api.get('/users/me')
      .then((res) => {
        const u = res.data?.data;
        if (u) {
          setProfileData({
            fullName: u.name || profileData.fullName,
            email: u.email || profileData.email,
            branch: u.branch || profileData.branch,
            year: u.year || profileData.year,
            section: u.section || profileData.section,
            department: u.department || profileData.department,
            profilePicture: profileData.profilePicture,
          });
        }
      })
      .catch((e) => console.error('Failed to load profile', e));

    if (activeSection === 'member-requests') {
      api.get('/member-requests?status=pending')
        .then((res) => {
          const data = res.data?.data || [];
          const mapped: MemberRequest[] = data.map((r: any) => ({
            id: r._id,
            fullName: r.fullName,
            phoneNumber: r.phoneNumber,
            email: r.email,
            role: r.role,
            submittedAt: r.submittedAt,
            status: r.status,
          }));
          setMemberRequests(mapped);
        })
        .catch((e) => {
          console.error('Failed to fetch member requests', e);
          setMemberRequests([]);
        });
    }

    if (activeSection === 'create-task' || activeSection === 'manage-tasks') {
      api.get('/users/assignees')
        .then((res) => {
          const list = (res.data?.data || []).map((u: any) => ({ id: u._id, name: u.name, email: u.email }));
          setAssignees(list);
        })
        .catch((e) => {
          console.error('Failed to load assignees', e);
          setAssignees([]);
        });
    }

    if (activeSection === 'available-tasks' || activeSection === 'manage-tasks') {
      api.get('/tasks/available')
        .then((res) => {
          const list = (res.data?.tasks || res.data || []).map((t: any) => ({ id: t._id || t.title, title: t.title, description: t.description, deadline: t.deadline, assignedTo: t.assignedTo || t.assignee || t.assignedToEmail || t.assignedToUser || '' }));
          setAvailableTasksAdmin(list);
        })
        .catch(() => setAvailableTasksAdmin([]));
    }

    if (activeSection === 'current-tasks' || activeSection === 'manage-tasks') {
      api.get('/tasks/ongoing')
        .then((res) => {
          const list = (res.data || []).map((t: any) => ({ id: t._id || t.title, title: t.title, description: t.description, deadline: t.deadline, assignedTo: t.assignedTo || t.assignee || t.assignedToEmail || t.assignedToUser || '' }));
          setOngoingTasksAdmin(list);
        })
        .catch(() => setOngoingTasksAdmin([]));
    }

    if (activeSection === 'manage-tasks') {
      api.get('/tasks/admin/all')
        .then((res) => {
          const list = (res.data?.tasks || []).map((t: any) => ({
            id: t.id || t._id || t.title,
            title: t.title,
            description: t.description,
            deadline: t.deadline,
            status: t.status as 'available' | 'ongoing' | 'completed' | 'rejected',
            assignedTo: t.assignedToUser?.name || t.assignedTo?.name || t.assignedTo || '',
          }));
          setManageTasksAdmin(list);
        })
        .catch(() => setManageTasksAdmin([]));
    }

    if (activeSection === 'total-tasks') {
      api.get('/tasks/my')
        .then((res) => {
          const tasks = (res.data?.tasks || res.data?.data || []).map((t: any) => ({
            id: t._id,
            title: t.title,
            description: t.description,
            deadline: t.deadline,
            status: t.status as 'available' | 'ongoing' | 'completed' | 'rejected',
            rejectionReason: t.rejectionReason,
          }));
          setMyTasks(tasks);
        })
        .catch(() => setMyTasks([]));
    }
  }, [activeSection]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
  });

  const [profileData, setProfileData] = useState({
    fullName: 'Admin User',
    email: 'admin@bvcoe.edu',
    branch: 'CSE',
    year: '2',
    section: '1',
    department: 'Technical',
    profilePicture: '',
  });

  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);
  const [newAssignee, setNewAssignee] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showRejectModalAdmin, setShowRejectModalAdmin] = useState(false);
  const [taskToRejectAdmin, setTaskToRejectAdmin] = useState<{ id: string; title: string; description: string; deadline: string } | null>(null);
  const [rejectionReasonAdmin, setRejectionReasonAdmin] = useState('');

  // Theme helper classes (align with member dashboard)
  const cardBgClass = isDarkMode ? 'bg-gradient-to-br from-[#0f1941] to-[#1a2b5f]' : 'bg-white';
  const borderClass = isDarkMode ? 'border-blue-500/30' : 'border-gray-200';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputBgClass = isDarkMode ? 'bg-[#0a1128]' : 'bg-gray-50';

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title.trim()) {
        alert('Please enter a title');
        return;
      }
      if (formData.title.trim().length < 3) {
        alert('Title must be at least 3 characters');
        return;
      }
      if (!formData.description.trim() || formData.description.trim().length < 10) {
        alert('Description must be at least 10 characters');
        return;
      }
      if (!formData.assignedTo) {
        alert('Please select a user to assign');
        return;
      }
      if (!formData.deadline) {
        alert('Please choose a deadline');
        return;
      }
      const deadlineDate = new Date(formData.deadline);
      if (!(deadlineDate instanceof Date) || isNaN(deadlineDate.getTime())) {
        alert('Please choose a valid deadline date');
        return;
      }
      if (deadlineDate <= new Date()) {
        alert('Deadline must be in the future');
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        deadline: deadlineDate.toISOString(),
      };
      const res = await api.post('/tasks/create', payload);
      const created = res.data?.task;
      if (created) {
        setTasks([
          ...tasks,
          {
            id: created._id,
            title: created.title,
            description: created.description,
            assignedTo: created.assignedTo,
            deadline: created.deadline,
            status: created.status,
          } as Task,
        ]);
      }
      setFormData({ title: '', description: '', assignedTo: '', deadline: '' });
      setShowCreateModal(false);
      alert('Task created successfully');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create task';
      alert(msg);
    }
  };

  const handleReassign = (taskId: string) => {
    if (!newAssignee.trim()) return;
    
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            assignedTo: newAssignee, 
            status: 'ongoing',
            rejectionReason: undefined
          }
        : task
    ));
    setReassignTaskId(null);
    setNewAssignee('');
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          profilePicture: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileData.fullName,
        email: profileData.email,
        branch: profileData.branch,
        year: profileData.year,
        section: profileData.section,
        department: profileData.department,
      };
      const res = await api.put('/users/me', payload);
      const u = res.data?.data;
      if (u) {
        setProfileData({
          fullName: u.name || profileData.fullName,
          email: u.email || profileData.email,
          branch: u.branch || profileData.branch,
          year: u.year || profileData.year,
          section: u.section || profileData.section,
          department: u.department || profileData.department,
          profilePicture: profileData.profilePicture,
        });
      }
      alert('Profile updated successfully');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update profile';
      alert(msg);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!newPassword || !confirmNewPassword) {
        alert('Please fill both password fields');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match');
        return;
      }
      const res = await api.put('/users/change-password', {
        newPassword,
        confirmNewPassword,
      });
      alert(res.data?.message || 'Password updated successfully');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update password';
      alert(msg);
    }
  };

  const handleMemberRequest = (requestId: string, action: 'approve' | 'reject') => {
    api.put(`/member-requests/${requestId}`, { action })
      .then(() => {
        // Remove processed request from list so rejected/approved don't reappear
        setMemberRequests((reqs) => reqs.filter((r) => r.id !== requestId));
      })
      .catch((e) => {
        console.error('Failed to update member request', e);
      });
  };

  const handleAcceptAvailableTask = async (taskId: string) => {
    const task = availableTasksAdmin.find(t => t.id === taskId);
    if (!task) return;
    try {
      await api.put('/tasks/accept', { title: task.title });
      setAvailableTasksAdmin(list => list.filter(t => t.id !== taskId));
      setOngoingTasksAdmin(list => ([...list, { id: task.id, title: task.title, description: task.description, deadline: task.deadline }]));
      alert(`Task "${task.title}" accepted`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to accept task';
      alert(msg);
    }
  };

  const openRejectAvailableTask = (taskId: string) => {
    const task = availableTasksAdmin.find(t => t.id === taskId);
    if (!task) return;
    setTaskToRejectAdmin(task);
    setRejectionReasonAdmin('');
    setShowRejectModalAdmin(true);
  };

  const confirmRejectAvailableTask = async () => {
    if (!taskToRejectAdmin || !rejectionReasonAdmin.trim()) return;
    try {
      await api.put('/tasks/reject', { title: taskToRejectAdmin.title, status: 'rejected', rejectionReason: rejectionReasonAdmin });
      setAvailableTasksAdmin(list => list.filter(t => t.id !== taskToRejectAdmin.id));
      alert(`Task "${taskToRejectAdmin.title}" rejected`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to reject task';
      alert(msg);
    } finally {
      setShowRejectModalAdmin(false);
      setTaskToRejectAdmin(null);
      setRejectionReasonAdmin('');
    }
  };

  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'ICE'];
  const years = ['1', '2', '3', '4'];
  const sections = ['1', '2', '3', '4'];
  const departments = [
    'Technical',
    'Social Media',
    'Content & Documentation',
    'Design',
    'Marketing',
    'Event Management'
  ];

  const sidebarItems = [
    { id: 'create-task' as AdminSection, label: 'Create Task', icon: Plus },
    { id: 'manage-tasks' as AdminSection, label: 'Manage Tasks', icon: ListTodo },
    { id: 'total-tasks' as AdminSection, label: 'Total Tasks', icon: Check },
    { id: 'available-tasks' as AdminSection, label: 'Available Tasks', icon: ListTodo },
    { id: 'current-tasks' as AdminSection, label: 'Current Tasks', icon: Calendar },
    { id: 'member-requests' as AdminSection, label: 'Member Requests', icon: Users },
    { id: 'profile' as AdminSection, label: 'My Profile', icon: User },
    { id: 'settings' as AdminSection, label: 'Settings', icon: Settings },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'head-of-dept':
        return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30';
      case 'core-member':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30';
      case 'member':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30';
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'head-of-dept':
        return 'Head of Department';
      case 'core-member':
        return 'Core Member';
      case 'member':
        return 'Member';
      default:
        return role;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'create-task':
        return (
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#0f1941] to-[#1a2b5f]' : 'bg-white'} border ${isDarkMode ? 'border-blue-500/30' : 'border-gray-200'} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a1128] text-white border-blue-900/50' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a1128] text-white border-blue-900/50' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 h-32 resize-none`}
                  placeholder="Enter task description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a1128] text-white border-blue-900/50' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  required
                >
                  <option value="">Select a user</option>
                  {assignees.map((u) => (
                    <option key={u.id} value={u.email} className="bg-[#0a1128]">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a1128] text-white border-blue-900/50' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Create Task
              </button>
            </form>
          </div>
        );

      case 'manage-tasks':
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-3xl font-bold ${textClass}`}>
                Manage Tasks
              </h2>
            </div>

            {/* Show all tasks created by head/core with future deadlines */}
            <div className="space-y-4">
              {manageTasksAdmin.filter(t => {
                const d = new Date(t.deadline);
                return d instanceof Date && !isNaN(d.getTime()) && d > new Date();
              }).map((task) => (
                <div 
                  key={task.id} 
                  className={`border ${isDarkMode ? 'border-blue-900/30 bg-[#0a1128]/50' : 'border-gray-200 bg-white'} rounded-xl p-6 backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.01] group`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-xl font-semibold ${textClass} transition-colors`}>
                      {task.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                        task.status === 'completed'
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                          : task.status === 'ongoing'
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30'
                          : task.status === 'rejected'
                          ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                  <p className={`${mutedTextClass} mb-3`}>
                    {task.description}
                  </p>
                  <div className={`flex items-center justify-between text-sm ${mutedTextClass}`}>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="ml-4 truncate">
                      <span className="opacity-80">Assigned to:</span> {task.assignedTo || '—'}
                    </div>
                  </div>
                  
                </div>
              ))}
              {manageTasksAdmin.filter(t => {
                const d = new Date(t.deadline);
                return d instanceof Date && !isNaN(d.getTime()) && d > new Date();
              }).length === 0 && (
                <div className={`text-center py-12 ${mutedTextClass}`}>No upcoming tasks</div>
              )}
            </div>
          </div>
        );

      case 'total-tasks': {
        const filtered = myTasks.filter((t) => t.status !== 'available' && (taskFilterAdmin === 'all' || t.status === taskFilterAdmin));
        return (
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#0f1941] to-[#1a2b5f]' : 'bg-white'} border ${isDarkMode ? 'border-blue-500/30' : 'border-gray-200'} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>Total Tasks</h2>
            <div className="flex gap-4 mb-6 flex-wrap">
              {['all','completed','ongoing','rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilterAdmin(f as typeof taskFilterAdmin)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${taskFilterAdmin === f ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' : `${inputBgClass} ${mutedTextClass} border ${borderClass}`}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {filtered.map((task) => (
                <div key={task.id} className={`border ${isDarkMode ? 'border-blue-900/30 bg-[#0a1128]/50' : 'border-gray-200 bg-white'} rounded-xl p-6`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-xl font-semibold ${textClass}`}>{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.status === 'completed'
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                        : task.status === 'ongoing'
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                  <p className={`${mutedTextClass} mb-3`}>{task.description}</p>
                  <div className={`flex items-center text-sm ${mutedTextClass}`}>
                    <Calendar size={16} className="mr-2" />
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  {task.status === 'rejected' && task.rejectionReason && (
                    <div className={`mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg`}>
                      <p className="text-sm text-red-500">
                        <strong>Rejection Reason:</strong> {task.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">No tasks yet.</div>
              )}
            </div>
          </div>
        );
      }

      case 'available-tasks':
        return (
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#0f1941] to-[#1a2b5f]' : 'bg-white'} border ${isDarkMode ? 'border-blue-500/30' : 'border-gray-200'} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>Available Tasks</h2>
            <div className="space-y-4">
              {availableTasksAdmin.map((task) => (
                <div key={task.id} className={`border ${isDarkMode ? 'border-blue-900/30 bg-[#0a1128]/50' : 'border-gray-200 bg-white'} rounded-xl p-6`}>
                  <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{task.title}</h3>
                  <p className={`${mutedTextClass} mb-3`}>{task.description}</p>
                  <div className={`flex items-center text-sm ${mutedTextClass}`}>
                    <Calendar size={16} className="mr-2" />
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAcceptAvailableTask(task.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-300"
                    >
                      Accept Task
                    </button>
                    <button
                      onClick={() => openRejectAvailableTask(task.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-300"
                    >
                      Reject Task
                    </button>
                  </div>
                </div>
              ))}
              {availableTasksAdmin.length === 0 && (
                <div className="text-center py-12 text-gray-400">No available tasks.</div>
              )}
            </div>
          </div>
        );

      case 'current-tasks':
        return (
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#0f1941] to-[#1a2b5f]' : 'bg-white'} border ${isDarkMode ? 'border-blue-500/30' : 'border-gray-200'} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
            <h2 className={`text-3xl font-bold ${textClass} mb-6`}>Current Tasks</h2>
            <div className="space-y-4">
              {ongoingTasksAdmin.map((task) => (
                <div key={task.id} className={`border ${isDarkMode ? 'border-blue-900/30 bg-[#0a1128]/50' : 'border-gray-200 bg-white'} rounded-xl p-6`}>
                  <h3 className={`text-xl font-semibold ${textClass} mb-2`}>{task.title}</h3>
                  <p className={`${mutedTextClass} mb-3`}>{task.description}</p>
                  <div className={`flex items-center text-sm ${mutedTextClass}`}>
                    <Calendar size={16} className="mr-2" />
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {ongoingTasksAdmin.length === 0 && (
                <div className="text-center py-12 text-gray-400">No ongoing tasks.</div>
              )}
            </div>
          </div>
        );
        
      case 'member-requests':
        return (
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#0f1941] to-[#1a2b5f]' : 'bg-white'} border ${isDarkMode ? 'border-blue-500/30' : 'border-gray-200'} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-3xl font-bold ${textClass}`}>
                Member Requests
              </h2>
              <div className="text-sm text-gray-400">
                {memberRequests.filter(r => r.status === 'pending').length} pending requests
              </div>
            </div>

            <div className="grid gap-6">
              {memberRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="border border-blue-900/30 rounded-xl p-6 bg-[#0a1128]/50 backdrop-blur-sm hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 transform hover:scale-[1.01] group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-cyan-200 transition-colors">
                        {request.fullName}
                      </h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {request.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                          request.status === 'approved'
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                            : request.status === 'rejected'
                            ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(request.role)}`}>
                        {getRoleDisplayName(request.role)}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400 group-hover:text-cyan-300 transition-colors">
                        <Phone size={16} className="mr-3 text-cyan-400" />
                        <span>{request.phoneNumber}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 group-hover:text-cyan-300 transition-colors">
                        <User size={16} className="mr-3 text-blue-400" />
                        <span>Applied as: {getRoleDisplayName(request.role)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400 group-hover:text-cyan-300 transition-colors">
                        <Calendar size={16} className="mr-3 text-purple-400" />
                        <span>Applied: {new Date(request.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 group-hover:text-cyan-300 transition-colors">
                        <span className="w-6 mr-3 text-center">⏰</span>
                        <span>{new Date(request.submittedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-3 mt-6 pt-4 border-t border-amber-500/20">
                      <button
                        onClick={() => handleMemberRequest(request.id, 'approve')}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                      >
                        <Check size={16} className="mr-2" />
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleMemberRequest(request.id, 'reject')}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
                      >
                        <XIcon size={16} className="mr-2" />
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {memberRequests.length === 0 && (
              <div className="text-center py-12">
                <Users size={64} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Member Requests</h3>
                <p className="text-gray-500">All member requests have been processed.</p>
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
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
                    'AD'
                  )}
                </div>
                <label className="absolute bottom-0 right-4 bg-cyan-500 hover:bg-cyan-600 text-white p-1 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-110 shadow-lg">
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
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
                      <option key={section} value={section} className={`${inputBgClass}`}>{section}</option>
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

      case 'settings':
        return (
          <div className={`${cardBgClass} border ${borderClass} rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'shadow-blue-500/10' : 'shadow-gray-200/40'} backdrop-blur-sm`}>
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-[#0a1128] via-[#0f1941] to-[#1a2b5f]' : 'bg-gray-50'} flex`}>
      <aside className={`w-64 ${isDarkMode ? 'bg-[#0f1941]/80 border-blue-900/30 shadow-blue-500/10' : 'bg-white border-gray-200 shadow-gray-200/40'} backdrop-blur-sm border-r p-6 shadow-2xl`}>
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ACM BVCOE
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {userRole === 'head-of-dept' ? 'Head Dashboard' : 'Core Member Dashboard'}
          </p>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                    : isDarkMode
                    ? 'text-gray-300 hover:bg-blue-500/20 hover:text-cyan-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`mr-3 transition-all duration-300 ${
                    activeSection === item.id ? 'scale-110' : 'group-hover:scale-110'
                  }`} 
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-full flex items-center px-4 py-3 mt-6 rounded-xl transition-all duration-300 ${isDarkMode ? 'text-gray-300 hover:bg-blue-500/20 hover:text-cyan-200' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          {isDarkMode ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 mt-8 text-red-400 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:text-red-300 rounded-xl transition-all duration-300 transform hover:scale-[1.02] group"
        >
          <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
      {showRejectModalAdmin && taskToRejectAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#0f1941] to-[#1a2b5f]' : 'bg-white'} border ${isDarkMode ? 'border-blue-500/30' : 'border-gray-200'} rounded-2xl p-8 w-full max-w-2xl shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textClass}`}>Reject Task</h2>
              <button onClick={() => { setShowRejectModalAdmin(false); setTaskToRejectAdmin(null); setRejectionReasonAdmin(''); }} className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <XIcon size={20} />
              </button>
            </div>

            <div className={`mb-6 p-4 ${inputBgClass} border ${borderClass} rounded-lg`}>
              <h3 className={`text-lg font-semibold ${textClass} mb-2`}>{taskToRejectAdmin.title}</h3>
              <p className={`${mutedTextClass} text-sm`}>{taskToRejectAdmin.description}</p>
            </div>

            <div className="mb-6">
              <label className={`block text-lg font-medium ${textClass} mb-3`}>
                Reason for Rejection <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReasonAdmin}
                onChange={(e) => setRejectionReasonAdmin(e.target.value)}
                className={`w-full px-4 py-3 ${inputBgClass} border ${borderClass} rounded-lg ${textClass} resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300`}
                rows={6}
                placeholder="Enter your reason for rejecting this task..."
                autoFocus
              />
              <p className={`mt-2 text-sm ${mutedTextClass}`}>{rejectionReasonAdmin.length} / 500 characters</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmRejectAvailableTask}
                disabled={!rejectionReasonAdmin.trim()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => { setShowRejectModalAdmin(false); setTaskToRejectAdmin(null); setRejectionReasonAdmin(''); }}
                className={`flex-1 px-6 py-3 ${inputBgClass} ${textClass} rounded-lg font-semibold hover:${isDarkMode ? 'bg-[#0f1941]' : 'bg-gray-100'} transition-all duration-300 border ${borderClass}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}