import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [userImage, setUserImage] = useState(null)
  const [text, setText] = useState('')
  const [finalImage, setFinalImage] = useState(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateComposite = () => {
    if (!userImage || !text.trim()) {
      alert('Please upload an image and add some text!')
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Load and draw the base image (background.jpg) as background
    const baseImg = new Image()
    baseImg.crossOrigin = 'anonymous' // Handle CORS if needed

    baseImg.onload = () => {
      console.log('Base image loaded successfully:', baseImg.width, 'x', baseImg.height)

      // Set canvas size to match the background image dimensions
      canvas.width = baseImg.width
      canvas.height = baseImg.height

      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the background.jpg as the full background (no scaling needed)
      ctx.drawImage(baseImg, 0, 0)

      // Now load and overlay the user's image on top
      const userImg = new Image()
      userImg.onload = () => {
        console.log('User image loaded successfully:', userImg.width, 'x', userImg.height)

        // Calculate dimensions for user image overlay (circular crop)
        // Scale overlay size based on image dimensions (10-15% of the smaller dimension)
        const overlaySize = Math.min(canvas.width, canvas.height) * 0.12

        // Position for user image overlay (center of the image)
        const userImgX = (canvas.width - overlaySize) / 2
        const userImgY = (canvas.height - overlaySize) / 2

        // Save context for clipping
        ctx.save()

        // Create circular clipping path for user image
        ctx.beginPath()
        ctx.arc(userImgX + overlaySize/2, userImgY + overlaySize/2, overlaySize/2, 0, 2 * Math.PI)
        ctx.clip()

        // Draw user image (cropped to circle) on top of background
        ctx.drawImage(userImg, userImgX, userImgY, overlaySize, overlaySize)

        // Restore context
        ctx.restore()

        // Add circular border around user image for better visibility
        ctx.beginPath()
        ctx.arc(userImgX + overlaySize/2, userImgY + overlaySize/2, overlaySize/2, 0, 2 * Math.PI)
        ctx.strokeStyle = 'white'
        ctx.lineWidth = Math.max(2, overlaySize * 0.04) // Scale border width
        ctx.stroke()

        // Add a second border for extra emphasis
        ctx.beginPath()
        ctx.arc(userImgX + overlaySize/2, userImgY + overlaySize/2, overlaySize/2 + ctx.lineWidth/2, 0, 2 * Math.PI)
        ctx.strokeStyle = 'black'
        ctx.lineWidth = Math.max(1, overlaySize * 0.02)
        ctx.stroke()

        // Add text overlay at the bottom
        const fontSize = Math.max(16, canvas.height * 0.04) // Scale font size based on image height
        ctx.font = `bold ${fontSize}px Arial`
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = Math.max(2, fontSize * 0.1) // Scale stroke width
        ctx.textAlign = 'center'

        // Position text at bottom center with padding
        const textX = canvas.width / 2
        const textY = canvas.height - (canvas.height * 0.05) // 5% from bottom

        // Add text with outline for better visibility
        ctx.strokeText(text, textX, textY)
        ctx.fillText(text, textX, textY)

        // Reset text alignment
        ctx.textAlign = 'left'

        // Convert canvas to image
        const compositeDataURL = canvas.toDataURL('image/png')
        setFinalImage(compositeDataURL)

        console.log('Composite image generated successfully with dimensions:', canvas.width, 'x', canvas.height)
      }

      userImg.onerror = () => {
        console.error('Failed to load user image')
        alert('Failed to load your uploaded image. Please try again.')
      }

      userImg.src = userImage
    }

    baseImg.onerror = () => {
      console.error('Failed to load base image: /background.jpg')
      alert('Failed to load the background image. Please check if background.jpg exists.')

      // Fallback: create a colored background
      ctx.fillStyle = '#4a90e2'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add placeholder text
      ctx.font = 'bold 32px Arial'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.fillText('Background Image Missing', canvas.width/2, canvas.height/2)
      ctx.textAlign = 'left'
    }

    // Load the background.jpg from the public folder
    baseImg.src = '/background.jpg'
    console.log('Loading base image from:', baseImg.src)
  }

  const downloadImage = () => {
    if (finalImage) {
      const link = document.createElement('a')
      link.download = 'composite-image.png'
      link.href = finalImage
      link.click()
    }
  }

  const resetApp = () => {
    setUserImage(null)
    setText('')
    setFinalImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="app">
      <h1>Image Overlay Creator</h1>

      <div className="upload-section">
        <h2>1. Upload Your Picture</h2>
        <p className="instruction-text">Your image will appear as a circular overlay in the center, on top of the background.jpg background</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
        />
        {userImage && (
          <div className="preview">
            <img src={userImage} alt="User upload" className="user-image-preview" />
          </div>
        )}
      </div>

      <div className="text-section">
        <h2>2. Add Your Text</h2>
        <p className="instruction-text">Your text will appear at the bottom center of the image</p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="text-input"
          maxLength={50}
        />
      </div>

      <div className="action-section">
        <button
          onClick={generateComposite}
          disabled={!userImage || !text.trim()}
          className="generate-btn"
        >
          Generate Composite Image
        </button>

        <button onClick={resetApp} className="reset-btn">
          Reset
        </button>
      </div>

      {finalImage && (
        <div className="result-section">
          <h2>3. Your Composite Image</h2>
          <img src={finalImage} alt="Final composite" className="final-image" />
          <button onClick={downloadImage} className="download-btn">
            Download Image
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default App
