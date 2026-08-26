const API_URL = '/api';

export const request = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);
    let data;
    try {
      data = await res.json();
    } catch (e) {
      // HANDLE NON-JSON OR CRASH RESPONSES
      if (!res.ok) throw new Error(`Gateway Error (${res.status}). Syncing cloud... Please refresh.`);
      throw new Error('Connection unstable. Please check your internet.');
    }
    
    if (!res.ok) {
      if (res.status === 401) {
        // TOKEN EXPIRED: SILENTLY CLEAR FOR BETTER USER FLOW
        localStorage.removeItem('token');
      }
      throw new Error(data.error || 'Server is busy. Re-syncing...');
    }
    return data;
  } catch (err) {
    // PROTECT AGAINST COMPLETE NETWORK FAILURES
    if (err.name === 'TypeError') {
      throw new Error('Neural bridge disconnected. Please check your connection.');
    }
    throw err;
  }
};

export const register = (data) => request('/auth/register', 'POST', data);
export const login = (identifier, password) => request('/auth/login', 'POST', { identifier, password });
export const getProfile = () => request('/auth/profile');
export const updateProfile = (data) => request('/auth/profile', 'PUT', data);

export const getHospitalsForPatients = () => request('/patient/hospitals');
export const searchDoctors = (specialization = '', hospitalId = '') => 
  request(`/patient/doctors?specialization=${specialization}&hospitalId=${hospitalId}`);
export const getSlots = (id, date) => request(`/patient/doctors/${id}/slots?date=${date}`);
export const bookAppointment = (slotId) => request('/patient/appointments', 'POST', { slotId });
export const myAppointments = () => request('/patient/my-appointments');

export const getPendingDoctors = () => request('/admin/doctors/pending');
export const updateDoctorStatus = (id, status) => request(`/admin/doctors/${id}/status`, 'PUT', { status });
export const getAllApprovedDoctors = () => request('/admin/doctors/approved');
export const getHospitalDetailedDocs = (id) => request(`/admin/hospitals/${id}/doctors`);
export const getHospitalDetailedStaff = (id) => request(`/admin/hospitals/${id}/staff`);
export const adminCreateUser = (data) => request('/admin/users', 'POST', data);

export const addDoctor = (data) => request('/manager/doctors', 'POST', data);
export const editDoctor = (id, data) => request(`/manager/doctors/${id}`, 'PUT', data);
export const deleteDoctor = (id) => request(`/manager/doctors/${id}`, 'DELETE');
export const getHospitalDoctors = () => request('/manager/doctors');
export const getHospitalTeam = () => request('/manager/users');
export const addTeamMember = (data) => request('/manager/users', 'POST', data);
export const getManagerHospital = () => request('/manager/hospital');

export const generateSlots = (id, date) => request(`/staff/doctors/${id}/generate-slots`, 'POST', { date });
export const getAppointments = () => request('/staff/appointments');
export const updateAppointment = (id, status) => request(`/staff/appointments/${id}`, 'PUT', { status });

export const getAdminStats = () => request('/admin/stats');
export const addHospital = (data) => request('/admin/hospitals', 'POST', data);
export const getHospitals = () => request('/admin/hospitals');
export const updateHospital = (id, data) => request(`/admin/hospitals/${id}`, 'PUT', data);
