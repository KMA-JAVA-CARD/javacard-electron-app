import { useState } from 'react'

import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

import axios from 'axios'

function App(): React.JSX.Element {
  const [status, setStatus] = useState('Chưa kết nối')
  const [loading, setLoading] = useState(false)

  // Hàm gọi xuống Java Middleware
  const checkJavaConnection = async () => {
    console.log('trigger')
    setLoading(true)
    try {
      // Gọi vào port 8081 mà huynh đã mở bên Java
      const response = await axios.get('http://localhost:8081/connect')
      console.log('res', response)
      if (response.data.result === 'Connected') {
        setStatus('✅ Đã kết nối với Thẻ & Java Middleware')
      } else {
        setStatus('⚠️ Kết nối Java được, nhưng không thấy Thẻ')
      }
    } catch (error) {
      console.error(error)
      setStatus('❌ Không thể kết nối Java Middleware (Check port 8081)')
    } finally {
      setLoading(false)
    }
  }

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Smart Card Loyalty System</h1>
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
        >
          <h3>System Status Check</h3>
          <p>
            Trạng thái: <strong>{status}</strong>
          </p>

          <button
            onClick={checkJavaConnection}
            disabled={loading}
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </button>
        </div>
      </div>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
