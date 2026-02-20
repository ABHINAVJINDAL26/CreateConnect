import { useState, useEffect } from 'react'
import './App.css'
import AuthForm from './Components/AuthForm'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })
  const [activePage, setActivePage] = useState('home')
  const [authMode, setAuthMode] = useState('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState(null)
  const [otpSent, setOtpSent] = useState(false)
  const [assetForm, setAssetForm] = useState({ title: '', description: '', fileUrl: '' })
  const [assetMessage, setAssetMessage] = useState(null)
  const [assetLoading, setAssetLoading] = useState(false)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [myAssets, setMyAssets] = useState([])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://upload-widget.cloudinary.com/latest/cld-js-sdk.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handleAuthModeChange = (mode) => {
    setAuthMode(mode)
    setAuthMessage(null)
    setOtpSent(false)
  }

  const fetchMyAssets = async () => {
    if (!token) {
      return
    }

    try {
      setAssetsLoading(true)
      const response = await fetch('/api/assets/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch assets')
      }

      setMyAssets(data)
    } catch (error) {
      setAssetMessage({ type: 'error', text: error.message || 'Failed to fetch assets' })
    } finally {
      setAssetsLoading(false)
    }
  }

  useEffect(() => {
    if (token && activePage === 'my-assets') {
      fetchMyAssets()
    }
  }, [activePage, token])

  useEffect(() => {
    if (token && activePage === 'my-assets') {
      fetchMyAssets()
    }
  }, [activePage, token])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setCurrentUser(null)
    setActivePage('home')
    setAuthMode('login')
    setAuthMessage(null)
    setOtpSent(false)
    setAssetForm({ title: '', description: '', fileUrl: '' })
    setAssetMessage(null)
    setMyAssets([])
  }

  const handleAssetInputChange = (event) => {
    const { name, value } = event.target
    setAssetForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleOpenCloudinaryWidget = () => {
    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'degaavykx',
          uploadPreset: 'ml_default',
          clientAllowedFormats: ['image', 'video'],
          maxFileSize: 104857600,
          folder: 'fullstack_assets',
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            const fileUrl = result.info.secure_url
            setAssetForm((previous) => ({
              ...previous,
              fileUrl,
            }))
            setAssetMessage({ type: 'success', text: 'File uploaded successfully' })
          }
        }
      )
      widget.open()
    }
  }

  const handleAssetCreate = async (event) => {
    event.preventDefault()

    if (!assetForm.fileUrl) {
      setAssetMessage({ type: 'error', text: 'Please upload an image or video file' })
      return
    }

    if (!assetForm.title) {
      setAssetMessage({ type: 'error', text: 'Please enter a title' })
      return
    }

    try {
      setAssetLoading(true)
      setAssetMessage(null)

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: assetForm.title,
          description: assetForm.description,
          fileUrl: assetForm.fileUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Asset creation failed')
      }

      setAssetForm({ title: '', description: '', fileUrl: '' })
      setAssetMessage({ type: 'success', text: 'Asset created successfully' })
      setActivePage('my-assets')
      fetchMyAssets()
    } catch (error) {
      setAssetMessage({ type: 'error', text: error.message || 'Asset creation failed' })
    } finally {
      setAssetLoading(false)
    }
  }

  const handleAuthSubmit = async (payload) => {
    try {
      setAuthLoading(true)
      setAuthMessage(null)

      if (payload.action === 'login') {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: payload.email, password: payload.password }),
        })

        const loginData = await loginResponse.json()

        if (!loginResponse.ok) {
          throw new Error(loginData.message || 'Login failed')
        }

        if (loginData.token) {
          localStorage.setItem('token', loginData.token)
          setToken(loginData.token)
        }

        if (loginData.user) {
          localStorage.setItem('user', JSON.stringify(loginData.user))
          setCurrentUser(loginData.user)
        }

        setAuthMessage({ type: 'success', text: 'Login successful' })
        setActivePage('home')
        return
      }

      if (payload.action === 'sendOtp') {
        const otpResponse = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: payload.email }),
        })

        const otpData = await otpResponse.json()

        if (!otpResponse.ok) {
          throw new Error(otpData.message || 'Unable to send OTP')
        }

        if (!otpData.emailSent) {
          throw new Error('OTP generate hua lekin email send nahi hua. Email config check karo.')
        }

        setOtpSent(true)
        setAuthMessage({ type: 'success', text: 'OTP sent to your email' })
        return
      }

      if (payload.action === 'verifySignup') {
        if (!otpSent) {
          throw new Error('Pehle Send OTP par click karo')
        }

        if (!payload.otp) {
          throw new Error('OTP enter karo')
        }

        const verifyResponse = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: payload.email, otp: payload.otp }),
        })

        const verifyData = await verifyResponse.json()

        if (!verifyResponse.ok) {
          throw new Error(verifyData.message || 'OTP verification failed')
        }

        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            password: payload.password,
          }),
        })

        const registerData = await registerResponse.json()

        if (!registerResponse.ok) {
          throw new Error(registerData.message || 'Signup failed')
        }

        if (registerData.token) {
          localStorage.setItem('token', registerData.token)
          setToken(registerData.token)
        }

        if (registerData.user) {
          localStorage.setItem('user', JSON.stringify(registerData.user))
          setCurrentUser(registerData.user)
        }

        setOtpSent(false)
        setAuthMessage({ type: 'success', text: 'Signup successful' })
        setActivePage('home')
        return
      }

      throw new Error('Invalid auth action')
    } catch (error) {
      setAuthMessage({
        type: 'error',
        text: error.message || 'Something went wrong',
      })
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="App">
      {!token && <div className="app-header"><h1>🚀 AssetVault</h1></div>}
      {!token ? (
        <>
          <AuthForm
            mode={authMode}
            onSubmit={handleAuthSubmit}
            onSendOtp={handleAuthSubmit}
            loading={authLoading}
            message={authMessage}
            otpSent={otpSent}
            onModeChange={handleAuthModeChange}
          />
        </>
      ) : (
        <>
          <div className="dashboard-nav">
            <div className="menu-items">
              <button
                type="button"
                className={`btn ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => setActivePage('home')}
              >
                Home
              </button>
              <button
                type="button"
                className={`btn ${activePage === 'create-asset' ? 'active' : ''}`}
                onClick={() => setActivePage('create-asset')}
              >
                +Create Asset
              </button>
              <button
                type="button"
                className={`btn ${activePage === 'my-assets' ? 'active' : ''}`}
                onClick={() => setActivePage('my-assets')}
              >
                My Assets
              </button>
              <button
                type="button"
                className={`btn ${activePage === 'about' ? 'active' : ''}`}
                onClick={() => setActivePage('about')}
              >
                About
              </button>
            </div>
            <button type="button" className="btn btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {activePage === 'home' && (
            <div className="card">
              <h2>Welcome {currentUser?.name || 'User'}</h2>
              <p>You are logged in. Use +Create Asset to upload image/video files.</p>
            </div>
          )}

          {activePage === 'create-asset' && (
            <div className="card">
              <h2>Upload New Asset</h2>
              <form className="asset-form" onSubmit={handleAssetCreate}>
                <input
                  type="text"
                  name="title"
                  placeholder="Asset title"
                  value={assetForm.title}
                  onChange={handleAssetInputChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Asset description"
                  value={assetForm.description}
                  onChange={handleAssetInputChange}
                />
                <button
                  type="button"
                  className="btn btn-cloudinary"
                  onClick={handleOpenCloudinaryWidget}
                >
                  {assetForm.fileUrl ? 'Change File' : 'Choose File'}
                </button>
                {assetForm.fileUrl && (
                  <div className="file-preview">
                    <p>File selected: {assetForm.fileUrl.split('/').pop()}</p>
                  </div>
                )}
                <button type="submit" className="btn btn-submit" disabled={assetLoading}>
                  {assetLoading ? 'Creating Asset...' : 'Create Asset'}
                </button>
              </form>
              {assetMessage && <p className={`auth-message ${assetMessage.type}`}>{assetMessage.text}</p>}
            </div>
          )}

          {activePage === 'my-assets' && (
            <div className="card">
              <h2>My Assets</h2>
              {assetsLoading ? (
                <p>Loading assets...</p>
              ) : myAssets.length > 0 ? (
                <div className="asset-grid">
                  {myAssets.map((asset) => (
                    <div className="asset-item" key={asset._id}>
                      <h3>{asset.title}</h3>
                      {asset.description && <p>{asset.description}</p>}
                      {asset.fileType === 'image' ? (
                        <img src={asset.fileUrl} alt={asset.title} className="asset-media" />
                      ) : (
                        <video controls className="asset-media">
                          <source src={asset.fileUrl} type={asset.mimeType} />
                        </video>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No assets uploaded yet.</p>
              )}
            </div>
          )}

          {activePage === 'about' && (
            <div className="card">
              <h2>About</h2>
              <p>This is your asset manager dashboard. You can upload image/video and view all your assets using Cloudinary.</p>
            </div>
          )}
        </>
      )}


    </div>
  )
}

export default App
