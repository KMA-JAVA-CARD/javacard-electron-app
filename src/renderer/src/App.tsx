import { useState } from 'react';

import Versions from './components/Versions';
import electronLogo from './assets/electron.svg';
import { processImageForCard } from './utils/imageUtils';

import axios from 'axios';

function App(): React.JSX.Element {
  const [status, setStatus] = useState('Chưa kết nối');
  const [loading, setLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageHex, setImageHex] = useState<string>('');
  const [imageProcessing, setImageProcessing] = useState(false);

  // Hàm gọi xuống Java Middleware
  const checkJavaConnection = async () => {
    console.log('trigger');
    setLoading(true);
    try {
      // Gọi vào port 8081 mà huynh đã mở bên Java
      const response = await axios.get('http://localhost:8081/connect');
      console.log('res', response);
      if (response.data.result === 'Connected') {
        setStatus('✅ Đã kết nối với Thẻ & Java Middleware');
      } else {
        setStatus('⚠️ Kết nối Java được, nhưng không thấy Thẻ');
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Không thể kết nối Java Middleware (Check port 8081)');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setOriginalImage(null);
    setProcessedImage(null);
    setImageHex('');

    // Show original image preview using FileReader (more compatible with Electron)
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setOriginalImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);

    // Process image
    setImageProcessing(true);
    try {
      const result = await processImageForCard(file);
      setProcessedImage(result.previewUrl);
      setImageHex(result.hex);
      console.log('Image processed:', {
        width: result.width,
        height: result.height,
        hexLength: result.hex.length,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Lỗi khi xử lý ảnh');
    } finally {
      setImageProcessing(false);
    }
  };

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  return (
    <>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Smart Card Loyalty System</h1>
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
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

        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        >
          <h3>Upload Avatar cho Thẻ</h3>
          <input
            type='file'
            accept='image/*'
            onChange={handleImageUpload}
            style={{ marginBottom: '15px' }}
          />
          {imageProcessing && <p>Đang xử lý ảnh...</p>}

          {(originalImage || processedImage) && (
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              {originalImage && (
                <div style={{ flex: 1 }}>
                  <h4>Ảnh gốc</h4>
                  <img
                    src={originalImage}
                    alt='Original'
                    style={{
                      maxWidth: '200px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              )}

              {processedImage && (
                <div style={{ flex: 1 }}>
                  <h4>Ảnh đã xử lý (64x64 Grayscale)</h4>
                  <img
                    src={processedImage}
                    alt='Processed'
                    style={{
                      width: '64px',
                      height: '64px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      imageRendering: 'pixelated',
                    }}
                  />
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <p>
                      <strong>Hex Data Length:</strong> {imageHex.length} characters
                    </p>
                    <details>
                      <summary style={{ cursor: 'pointer' }}>View Hex Data</summary>
                      <pre
                        style={{
                          maxHeight: '150px',
                          maxWidth: '200px',
                          overflow: 'auto',
                          background: '#f5f5f5',
                          padding: '10px',
                          fontSize: '10px',
                          wordBreak: 'break-all',
                          color: '#333',
                        }}
                      >
                        {imageHex}
                      </pre>
                    </details>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <img alt='logo' className='logo' src={electronLogo} />
      <div className='creator'>Powered by electron-vite</div>
      <div className='text'>
        Build an Electron app with <span className='react'>React</span>
        &nbsp;and <span className='ts'>TypeScript</span>
      </div>
      <p className='tip'>
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className='actions'>
        <div className='action'>
          <a href='https://electron-vite.org/' target='_blank' rel='noreferrer'>
            Documentation
          </a>
        </div>
        <div className='action'>
          <a target='_blank' rel='noreferrer' onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  );
}

export default App;
