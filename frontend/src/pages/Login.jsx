import React, { useState } from 'react';
import './LoginScreen.css';

// Usamos una URL temporal para el logo ya que ../assets/logo.jpg no existia
const logo = "https://placehold.co/130x90?text=Venado";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        // alert('¡Inicio de sesión exitoso!');
        window.location.href = '/'; // Redirigir al inicio después del login exitoso
      }, 1500);
    }
  };

  return (
    <div className="login-container scaleUp-animation">
      <div className="login-card">
        {/* Panel Izquierdo: Marca y Radar/Red GPS */}
        <div className="brand-side">
          <div className="brand-overlay"></div>
          
          {/* Gráfico SVG del Radar y Red de Nodos de GPS */}
          <div className="gps-mesh-container">
            <svg className="gps-mesh-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" stroke="rgba(194, 163, 120, 0.08)" strokeWidth="1.5" fill="none" />
              <circle cx="100" cy="100" r="50" stroke="rgba(194, 163, 120, 0.12)" strokeWidth="1.5" fill="none" />
              <circle cx="100" cy="100" r="20" stroke="rgba(194, 163, 120, 0.18)" strokeWidth="1.5" fill="none" />
              
              <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              <line x1="43.4" y1="43.4" x2="156.6" y2="156.6" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              <line x1="43.4" y1="156.6" x2="156.6" y2="43.4" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

              {/* Nodos interactivos de GPS */}
              <g className="gps-nodes">
                <circle cx="50" cy="70" r="4.5" fill="#c2a378" className="gps-node-pulse" />
                <circle cx="50" cy="70" r="8" stroke="#c2a378" strokeWidth="1" fill="none" opacity="0.4" />
                
                <circle cx="150" cy="115" r="5.5" fill="#c2a378" />
                <circle cx="150" cy="115" r="10" stroke="#c2a378" strokeWidth="1" fill="none" opacity="0.3" />
                
                <circle cx="110" cy="50" r="4" fill="#ffffff" />
                
                <circle cx="85" cy="140" r="5" fill="#ffffff" />
                <circle cx="85" cy="140" r="9" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.3" />
              </g>

              {/* Líneas de conexión */}
              <path d="M50,70 L110,50 L150,115 L85,140 Z" stroke="rgba(194, 163, 120, 0.35)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
              <path d="M100,100 L150,115" stroke="#c2a378" strokeWidth="1" opacity="0.5" />
              <path d="M100,100 L50,70" stroke="#c2a378" strokeWidth="1" opacity="0.5" />
              <path d="M100,100 L85,140" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" opacity="0.5" />
              
              {/* Animación del barrido del radar */}
              <line x1="100" y1="100" x2="180" y2="100" stroke="#c2a378" strokeWidth="2" opacity="0.6" className="radar-sweep" />
            </svg>
          </div>

          <div className="brand-content">
            <div className="logo-wrapper">
              <img src={logo} alt="Grupo Venado Logo" className="brand-logo" />
            </div>
            <h1 className="brand-title">Grupo Venado</h1>
            <p className="brand-tagline">
              Monitoreo inteligente y seguimiento GPS en tiempo real para la gestión de reponedores en canales mayoristas, minoristas y detallistas.
            </p>
          </div>
          
          {/* Ondas divisoras (Vista Escritorio) */}
          <div className="waves-container">
            <svg className="waves-svg" viewBox="0 0 100 100" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 C30,40 20,60 10,100 L100,100 L100,0 Z" fill="rgba(194, 163, 120, 0.08)"></path>
              <path d="M0,0 C20,30 35,70 15,100 L100,100 L100,0 Z" fill="rgba(29, 31, 34, 0.3)"></path>
              <path d="M0,0 C15,25 25,75 0,100 L100,100 L100,0 Z" fill="#ffffff"></path>
            </svg>
          </div>

          {/* Ondas divisoras (Vista Móvil) */}
          <div className="waves-container-mobile">
            <svg className="waves-svg-mobile" viewBox="0 0 100 100" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,100 C40,70 60,80 100,90 L100,100 L0,100 Z" fill="rgba(194, 163, 120, 0.08)"></path>
              <path d="M0,100 C30,80 70,65 100,80 L100,100 L0,100 Z" fill="rgba(29, 31, 34, 0.3)"></path>
              <path d="M0,100 C25,85 75,75 100,100 L100,100 L0,100 Z" fill="#ffffff"></path>
            </svg>
          </div>
        </div>

        {/* Panel Derecho: Formulario Estilo Card */}
        <div className="form-side">
          <div className="form-container">
            
            {/* Badge de seguridad */}
            <div className="portal-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="badge-icon">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" y1="3" x2="9" y2="18"></line>
                <line x1="15" y1="6" x2="15" y2="21"></line>
              </svg>
              <span>Portal de Monitoreo GPS</span>
            </div>

            <div className="form-header">
              <h2>Iniciar Sesión</h2>
              <p className="form-subtitle">
                Bienvenido al panel logístico. Ingresa tus credenciales corporativas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Campo: Correo Electrónico */}
              <div className={`input-field-wrapper ${formData.email ? 'has-value' : ''} ${errors.email ? 'has-error' : ''}`}>
                <div className="input-icon-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@grupovenado.com"
                  required
                />
                <label htmlFor="email">Correo Electrónico</label>
                {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                  <span className="success-check-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                )}
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Campo: Contraseña */}
              <div className={`input-field-wrapper ${formData.password ? 'has-value' : ''} ${errors.password ? 'has-error' : ''}`}>
                <div className="input-icon-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
                <label htmlFor="password">Contraseña</label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
                {formData.password && !errors.password && formData.password.length >= 6 && (
                  <span className="success-check-icon" style={{ right: '40px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                )}
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {/* Recordar Sesión & Olvido */}
              <div className="form-extras">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    name="rememberMe" 
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">Recordar sesión</span>
                </label>
                <a href="#forgot" className="forgot-password-link">¿Recuperar contraseña?</a>
              </div>

              {/* Botón de Envío */}
              <div className="action-buttons-group">
                <button
                  type="submit"
                  className={`btn-action primary-btn ${isSubmitted ? 'loading-btn' : ''}`}
                  disabled={isSubmitted}
                >
                  {isSubmitted ? (
                    <span className="spinner"></span>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {/* Pie de página del portal */}
            <div className="portal-footer">
              <span className="support-link">Soporte TI: <a href="mailto:soporte@grupovenado.com">soporte@grupovenado.com</a></span>
              <span className="divider">•</span>
              <a href="#privacy" className="privacy-link">Términos de Uso</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
