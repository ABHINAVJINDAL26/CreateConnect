import { useEffect, useState } from 'react'

function AuthForm({ mode, onSubmit, onSendOtp, loading, message, otpSent, onModeChange }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  })

  useEffect(() => {
    setFormData({ name: '', email: '', password: '', otp: '' })
  }, [mode])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const payload =
      mode === 'signup'
        ? {
            action: 'verifySignup',
            name: formData.name,
            email: formData.email,
            password: formData.password,
            otp: formData.otp,
          }
        : {
            action: 'login',
            email: formData.email,
            password: formData.password,
          }

    onSubmit(payload)
  }

  const handleSendOtp = () => {
    onSendOtp({
      action: 'sendOtp',
      email: formData.email,
    })
  }

  return (
    <div className="auth-card">
      <h2>{mode === 'signup' ? 'Create Account' : 'Login'}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {mode === 'signup' && (
          <div className="otp-row">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP sent to your email"
              value={formData.otp}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="btn btn-otp"
              onClick={handleSendOtp}
              disabled={loading || !formData.email}
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
        )}
        <button type="submit" className="btn btn-submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'signup' ? 'Verify OTP & Sign Up' : 'Login'}
        </button>
      </form>
      {mode === 'signup' && <p className="auth-hint">OTP expires in 5 minutes.</p>}
      {message && <p className={`auth-message ${message.type}`}>{message.text}</p>}
      <p className="auth-toggle">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          className="toggle-link"
          onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  )
}

export default AuthForm
