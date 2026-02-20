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
  const [uploadWidgetActive, setUploadWidgetActive] = useState(false)
  const [cloudinaryReady, setCloudinaryReady] = useState(false)

  // Wait for Cloudinary to load from CDN
  useEffect(() => {
    let maxAttempts = 50 // Wait up to 5 seconds
    let attempts = 0
    
    const checkCloudinary = setInterval(() => {
      if (window.cloudinary) {
        setCloudinaryReady(true)
        console.log('✓ Cloudinary SDK loaded')
        clearInterval(checkCloudinary)
      }
      attempts++
      if (attempts >= maxAttempts) {
        console.warn('⚠ Cloudinary CDN timeout - will show file input fallback')
        setCloudinaryReady(false)
        clearInterval(checkCloudinary)
      }
    }, 100)
    
    return () => clearInterval(checkCloudinary)
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
    // Directly attempt to open, don't use state relay
    setUploadWidgetActive(true)
    openCloudinaryWidget()
  }

  const openCloudinaryWidget = () => {
    // If Cloudinary isn't ready yet, try one more time
    if (!window.cloudinary) {
      setAssetMessage({
        type: 'info',
        text: '⏳ File uploader initializing... This should take a moment.'
      })
      
      // Wait a bit and try again
      let retryCount = 0
      const retryInterval = setInterval(() => {
        retryCount++
        
        if (window.cloudinary && window.cloudinary.createUploadWidget) {
          clearInterval(retryInterval)
          openWidget()
          return
        }
        
        if (retryCount >= 10) {
          clearInterval(retryInterval)
          setAssetMessage({
            type: 'error',
            text: '⚠ Cloudinary is slow to load. This may be a network issue. Please refresh the page and try again.'
          })
          setUploadWidgetActive(false)
        }
      }, 200)
      return
    }
    
    openWidget()
  }

  const openWidget = () => {
    try {
      if (!window.cloudinary?.createUploadWidget) {
        setAssetMessage({
          type: 'error',
          text: 'File uploader not available. Please refresh the page.'
        })
        setUploadWidgetActive(false)
        return
      }
      
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'degaavykx',
          uploadPreset: 'ml_default',
          clientAllowedFormats: ['image', 'video', 'pdf'],
          maxFileSize: 104857600,
          folder: 'fullstack_assets',
          styles: {
            palette: {
              window: '#1a1a2e',
              windowBorder: '#3b82f6',
              tabIcon: '#3b82f6',
              menuIcons: '#cbd5e1',
              textDark: '#fff',
              textLight: '#cbd5e1',
              link: '#3b82f6',
              action: '#3b82f6',
              inactiveTabIcon: '#666',
              error: '#ef4444',
              inProgress: '#3b82f6',
              complete: '#10b981',
              sourceBg: '#1a1a2e',
            },
          },
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            const fileUrl = result.info.secure_url
            setAssetForm((previous) => ({
              ...previous,
              fileUrl,
            }))
            setAssetMessage({ type: 'success', text: 'File uploaded to cloud successfully! ✓' })
          } else if (error) {
            console.error('Upload error:', error)
            setAssetMessage({ type: 'error', text: 'File upload failed. Please try again.' })
          }
          setUploadWidgetActive(false)
        }
      )
      widget.open()
      setAssetMessage(null)
    } catch (err) {
      console.error('Widget error:', err)
      setAssetMessage({ type: 'error', text: 'Error opening file picker. Please try again.' })
      setUploadWidgetActive(false)
    }
  }

  const handleFallbackFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setAssetMessage({ type: 'info', text: '📤 Uploading file...' })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:5000/api/assets/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      setAssetForm((previous) => ({
        ...previous,
        fileUrl: `http://localhost:5000${data.fileUrl}`
      }))
      setAssetMessage({ type: 'success', text: '✓ File uploaded successfully!' })

      // Clear the input
      event.target.value = ''
    } catch (error) {
      console.error('Fallback upload error:', error)
      setAssetMessage({ type: 'error', text: `Upload failed: ${error.message}` })
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
      {!token ? (
        <div className="auth-page">
          <div className="auth-header"><h1>🚀 AssetVault</h1></div>
          <div className="auth-container">
            <div className="auth-form-section">
              <AuthForm
                mode={authMode}
                onSubmit={handleAuthSubmit}
                onSendOtp={handleAuthSubmit}
                loading={authLoading}
                message={authMessage}
                otpSent={otpSent}
                onModeChange={handleAuthModeChange}
              />
            </div>
            <div className="auth-welcome-section">
              <h2>Welcome to AssetVault!</h2>
              <p>Securely upload, manage, and organize your assets in one place.</p>
              <ul className="features-list">
                <li>📁 Cloud-based storage with Cloudinary</li>
                <li>🔐 Secure authentication with OTP verification</li>
                <li>⚡ Lightning-fast asset management</li>
                <li>🎬 Support for images and videos</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <div className="dashboard-sidebar">
            <div className="sidebar-header">
              <h1>AssetVault</h1>
            </div>
            <div className="sidebar-menu">
              <button
                type="button"
                className={`sidebar-btn ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => setActivePage('home')}
              >
                🏠 Home
              </button>
              <button
                type="button"
                className={`sidebar-btn ${activePage === 'create-asset' ? 'active' : ''}`}
                onClick={() => setActivePage('create-asset')}
              >
                ➕ Create Asset
              </button>
              <button
                type="button"
                className={`sidebar-btn ${activePage === 'my-assets' ? 'active' : ''}`}
                onClick={() => setActivePage('my-assets')}
              >
                📁 My Assets
              </button>
              <button
                type="button"
                className={`sidebar-btn ${activePage === 'about' ? 'active' : ''}`}
                onClick={() => setActivePage('about')}
              >
                ℹ️ About
              </button>
            </div>
            <button type="button" className="sidebar-btn logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>

          <div className="dashboard-wrapper">
            {activePage === 'home' && (
              <div className="page-content">
                <h2>Welcome {currentUser?.name || 'User'}</h2>
                <p>You are logged in. Use Create Asset to upload image/video files.</p>
              </div>
            )}

          {activePage === 'create-asset' && (
              <div className="page-content">
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
                  {assetForm.fileUrl ? 'Change File (Cloudinary)' : 'Choose File (Cloudinary)'}
                </button>
                
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>Or upload directly:</p>
                  <input
                    type="file"
                    id="fallback-file"
                    onChange={handleFallbackFileUpload}
                    style={{ fontSize: '14px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
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
              <div className="page-content">
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
                      ) : asset.fileType === 'video' ? (
                        <video controls className="asset-media">
                          <source src={asset.fileUrl} type={asset.mimeType} />
                        </video>
                      ) : asset.fileType === 'audio' ? (
                        <audio controls className="asset-media" style={{ width: '100%' }}>
                          <source src={asset.fileUrl} type={asset.mimeType} />
                          Your browser does not support the audio element.
                        </audio>
                      ) : asset.fileType === 'document' ? (
                        <div className="asset-media" style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center', borderRadius: '4px' }}>
                          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>Document</p>
                          <a 
                            href={asset.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#3b82f6', textDecoration: 'underline' }}
                          >
                            📄 {asset.title} ({asset.mimeType})
                          </a>
                        </div>
                      ) : (
                        <div className="asset-media" style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center', borderRadius: '4px' }}>
                          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>File</p>
                          <a 
                            href={asset.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#3b82f6', textDecoration: 'underline' }}
                          >
                            📁 Download
                          </a>
                        </div>
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
              <div className="page-content">
                <h2>About</h2>
                <p>This is your asset manager dashboard. You can upload image/video and view all your assets using Cloudinary.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
