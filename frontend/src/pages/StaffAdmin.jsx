import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, BatteryFull, BatteryMedium, BatteryLow, Smartphone, Car, Bike, PersonStanding, Edit, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { createWebSocket, API } from '../api/client';

const ROLE_MAP = {
  1: 'Administrador',
  2: 'Supervisor',
  3: 'Reponedor'
};

export function StaffAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [staffList, setStaffList] = useState([]);
  const [wsUsers, setWsUsers] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    id_rol: 3,
    id_ciudad: 1,
    telefono: '',
    id_supervisor: 2,
    activo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await API.getUsuarios();
      setStaffList(users);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Conectar WebSocket para estado en vivo de reponedores
    const ws = createWebSocket('/ws/supervisor/2');
    
    ws.onopen = () => console.log('StaffAdmin WS Connected');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.reponedores) {
        const wsData = {};
        data.reponedores.forEach(rep => {
          wsData[rep.id] = {
            region: rep.pdv_actual ? `PDV: ${rep.pdv_actual}` : 'En Tránsito',
            status: rep.estado === 'activo' ? 'Online' : rep.estado === 'sin_señal' ? 'Break' : 'Offline',
            battery: rep.estado === 'activo' ? Math.floor(Math.random() * 40) + 60 : null,
            vehicle: 'pie',
            lastSeen: rep.ultimo_update || 'Desconocido'
          };
        });
        setWsUsers(wsData);
      }
    };
    
    return () => ws.close();
  }, []);

  // Combinar usuarios de DB con estado de WS
  const getMergedStaff = () => {
    return staffList.map(user => {
      const wsInfo = wsUsers[user.id_usuario] || {
        region: `Ciudad ${user.id_ciudad}`,
        status: user.activo ? 'Online' : 'Offline',
        battery: user.activo ? 100 : null,
        vehicle: user.id_rol === 3 ? 'pie' : 'auto',
        lastSeen: 'Desconocido'
      };

      return {
        ...user,
        roleName: ROLE_MAP[user.id_rol] || 'Desconocido',
        ...wsInfo
      };
    });
  };

  const mergedStaff = getMergedStaff();

  const filteredStaff = mergedStaff.filter(staff => {
    const matchesSearch = staff.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || staff.roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'auto': return <Car size={16} className="text-slate-500" />;
      case 'moto': return <Bike size={16} className="text-slate-500" />;
      case 'pie': return <PersonStanding size={16} className="text-slate-500" />;
      default: return null;
    }
  };

  const getBatteryIcon = (level) => {
    if (level === null) return null;
    if (level > 60) return <BatteryFull size={16} className="text-brand-blue" />;
    if (level > 20) return <BatteryMedium size={16} className="text-yellow-500" />;
    return <BatteryLow size={16} className="text-brand-red" />;
  };

  // --- CRUD Handlers ---

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '', // No cargar password en edición
        id_rol: user.id_rol,
        id_ciudad: user.id_ciudad || 1,
        telefono: user.telefono || '',
        id_supervisor: user.id_supervisor || 2,
        activo: user.activo
      });
    } else {
      setSelectedUser(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        id_rol: 3,
        id_ciudad: 1,
        telefono: '',
        id_supervisor: 2,
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (modalMode === 'edit' && !payload.password) {
        delete payload.password; // Evitar enviar password vacío si no se cambia
      }

      if (modalMode === 'create') {
        await API.crearUsuario(payload);
      } else {
        await API.actualizarUsuario(selectedUser.id_usuario, payload);
      }
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      alert("Error al guardar usuario: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await API.eliminarUsuario(id);
        await fetchUsers();
      } catch (err) {
        alert("Error al eliminar usuario: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full animate-fade-in-up relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Gestión de Personal</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Supervisa y administra al equipo de campo y oficina.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenModal('create')}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Nuevo Miembro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 hover-lift cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-blue font-black text-2xl group-hover:scale-110 transition-transform">
            {mergedStaff.filter(s => s.status === 'Online').length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Activos en Campo</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">Conectados ahora mismo</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 hover-lift cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-brand-red/10 dark:bg-brand-red/20 flex items-center justify-center text-brand-red font-black text-2xl group-hover:scale-110 transition-transform">
            {mergedStaff.filter(s => s.battery !== null && s.battery < 20).length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Batería Crítica</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">Equipos que requieren atención</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 hover-lift cursor-pointer group">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-black text-2xl group-hover:scale-110 transition-transform">
            {mergedStaff.length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Personal</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">Plantilla completa</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-card rounded-3xl flex flex-col flex-1 min-h-0 overflow-hidden relative">
        
        {/* Filters */}
        <div className="p-6 border-b border-slate-200/50 dark:border-white/5 flex flex-wrap gap-4 items-end bg-white/40 dark:bg-dark-bg/20">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del trabajador..." 
                className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Rol</label>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full glass-panel rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer appearance-none"
            >
              <option value="Todos" className="text-slate-800">Todos los roles</option>
              <option value="Reponedor" className="text-slate-800">Reponedores</option>
              <option value="Supervisor" className="text-slate-800">Supervisores</option>
              <option value="Administrador" className="text-slate-800">Administradores</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 p-2">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Cargando personal...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/50 dark:border-white/5">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol y Región</th>
                  <th className="px-6 py-4 text-center">Estado de Red</th>
                  <th className="px-6 py-4 text-center">Dispositivo</th>
                  <th className="px-6 py-4 text-center">Movilidad</th>
                  <th className="px-6 py-4 text-right">Opciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id_usuario} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-dark-card/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-black text-slate-700 dark:text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {staff.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{staff.nombre}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{staff.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{staff.roleName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{staff.region}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span className={clsx(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm",
                          staff.status === 'Online' ? "bg-brand-blue/10 text-brand-blue" : 
                          staff.status === 'Break' ? "bg-amber-500/10 text-amber-500" : 
                          "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                        )}>
                          <span className={clsx("w-2 h-2 rounded-full", 
                            staff.status === 'Online' ? "bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.8)]" : 
                            staff.status === 'Break' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" : 
                            "bg-slate-400"
                          )}></span>
                          {staff.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">{staff.lastSeen}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {staff.battery !== null ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5">
                            {getBatteryIcon(staff.battery)}
                            <span className={clsx(
                              "font-bold",
                              staff.battery < 20 ? "text-brand-red" : "text-slate-700 dark:text-slate-200"
                            )}>{staff.battery}%</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">App v3.0.1</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs flex justify-center">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {staff.vehicle ? (
                           <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center transform group-hover:scale-110 transition-transform">
                              {getVehicleIcon(staff.vehicle)}
                           </div>
                        ) : <span className="text-slate-400 dark:text-slate-600">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal('edit', staff)}
                          className="text-slate-400 hover:text-brand-blue p-2 rounded-xl hover:bg-brand-blue/10 transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(staff.id_usuario)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {modalMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                  <input type="text" name="nombre" required value={formData.nombre} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-sm outline-none focus:ring-2 focus:ring-brand-blue/50 dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-sm outline-none focus:ring-2 focus:ring-brand-blue/50 dark:text-white" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Contraseña {modalMode === 'edit' && <span className="text-[10px] text-slate-400">(Dejar en blanco para no cambiar)</span>}
                  </label>
                  <input type="password" name="password" required={modalMode === 'create'} value={formData.password} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-sm outline-none focus:ring-2 focus:ring-brand-blue/50 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Rol</label>
                    <select name="id_rol" value={formData.id_rol} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-sm outline-none focus:ring-2 focus:ring-brand-blue/50 dark:text-white">
                      <option value={1}>Administrador</option>
                      <option value={2}>Supervisor</option>
                      <option value={3}>Reponedor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                    <input type="text" name="telefono" value={formData.telefono} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-sm outline-none focus:ring-2 focus:ring-brand-blue/50 dark:text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2">
                    <input type="checkbox" name="activo" checked={formData.activo} onChange={handleFormChange} className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue/50" />
                    Usuario Activo
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-lg shadow-brand-blue/30 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
