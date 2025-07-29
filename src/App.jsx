import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [userImage, setUserImage] = useState(null)
  const [text, setText] = useState('')
  const [finalImage, setFinalImage] = useState(null)
  const [backgroundImage, setBackgroundImage] = useState(null)

  // Image editing state
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  // Text editing state
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const [isDraggingText, setIsDraggingText] = useState(false)
  const [textDragStart, setTextDragStart] = useState({ x: 0, y: 0 })

  const canvasRef = useRef(null)
  const editorCanvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target.result)
        // Initialize image position and size when image is loaded
        setImagePosition({ x: 250, y: 150 }) // Center-ish position
        setImageSize({ width: 500, height: 500 }) // Default size 500x500px
        // Initialize text position (bottom center by default)
        setTextPosition({ x: 400, y: 500 }) // Will be adjusted based on canvas size
      }
      reader.readAsDataURL(file)
    }
  }

  // Load background image when component mounts
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setBackgroundImage(img)
    }
    img.src = '/background.png'
  }, [])

  // Draw the editor canvas
  const drawEditorCanvas = () => {
    const canvas = editorCanvasRef.current
    if (!canvas || !backgroundImage || !userImage) return

    const ctx = canvas.getContext('2d')

    // Set canvas size to match background image
    canvas.width = backgroundImage.width
    canvas.height = backgroundImage.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0)

    // Draw user image
    const userImg = new Image()
    userImg.onload = () => {
      // Save context for circular clipping
      ctx.save()

      // Create circular clipping path
      ctx.beginPath()
      ctx.arc(
        imagePosition.x + imageSize.width / 2,
        imagePosition.y + imageSize.height / 2,
        Math.min(imageSize.width, imageSize.height) / 2,
        0,
        2 * Math.PI
      )
      ctx.clip()

      // Draw user image
      ctx.drawImage(userImg, imagePosition.x, imagePosition.y, imageSize.width, imageSize.height)

      // Restore context
      ctx.restore()

      // Draw border around image - white inner border
      ctx.beginPath()
      ctx.arc(
        imagePosition.x + imageSize.width / 2,
        imagePosition.y + imageSize.height / 2,
        Math.min(imageSize.width, imageSize.height) / 2,
        0,
        2 * Math.PI
      )
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 4
      ctx.stroke()

      // Draw black outer border for better visibility
      ctx.beginPath()
      ctx.arc(
        imagePosition.x + imageSize.width / 2,
        imagePosition.y + imageSize.height / 2,
        Math.min(imageSize.width, imageSize.height) / 2 + 2,
        0,
        2 * Math.PI
      )
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw selection handles if not dragging/resizing
      if (!isDragging && !isResizing) {
        drawSelectionHandles(ctx)
      }

      // Draw text if it exists
      if (text.trim()) {
        drawTextOnCanvas(ctx)
      }
    }
    userImg.src = userImage
  }

  // Draw selection handles around the image
  const drawSelectionHandles = (ctx) => {
    const handleSize = 12

    // Draw selection rectangle around the image
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(imagePosition.x - 2, imagePosition.y - 2, imageSize.width + 4, imageSize.height + 4)
    ctx.setLineDash([]) // Reset line dash

    const handles = [
      { x: imagePosition.x - handleSize/2, y: imagePosition.y - handleSize/2 }, // top-left
      { x: imagePosition.x + imageSize.width - handleSize/2, y: imagePosition.y - handleSize/2 }, // top-right
      { x: imagePosition.x - handleSize/2, y: imagePosition.y + imageSize.height - handleSize/2 }, // bottom-left
      { x: imagePosition.x + imageSize.width - handleSize/2, y: imagePosition.y + imageSize.height - handleSize/2 }, // bottom-right
    ]

    // Draw resize handles
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2

    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
    })
  }

  // Draw text on canvas with draggable indicator
  const drawTextOnCanvas = (ctx) => {
    const canvas = editorCanvasRef.current
    if (!canvas) return

    const fontSize = Math.max(16, canvas.height * 0.04)
    ctx.font = `bold ${fontSize}px Arial`

    // Measure text to get dimensions
    const textMetrics = ctx.measureText(text)
    const textWidth = textMetrics.width
    const textHeight = fontSize

    // Adjust text position if it's at default (0,0) to be at bottom center
    let adjustedTextPosition = { ...textPosition }
    if (textPosition.x === 0 && textPosition.y === 0) {
      adjustedTextPosition = {
        x: canvas.width / 2,
        y: canvas.height - (canvas.height * 0.05)
      }
      setTextPosition(adjustedTextPosition)
    }

    // Draw text with outline for better visibility
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = Math.max(2, fontSize * 0.1)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.strokeText(text, adjustedTextPosition.x, adjustedTextPosition.y)
    ctx.fillText(text, adjustedTextPosition.x, adjustedTextPosition.y)

    // Draw text selection indicator if not dragging image
    if (!isDragging && !isResizing && !isDraggingText) {
      drawTextSelectionIndicator(ctx, adjustedTextPosition, textWidth, textHeight)
    }

    // Reset text alignment
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }

  // Draw selection indicator around text
  const drawTextSelectionIndicator = (ctx, position, textWidth, textHeight) => {
    const padding = 10
    const rectX = position.x - textWidth/2 - padding
    const rectY = position.y - textHeight/2 - padding
    const rectWidth = textWidth + padding * 2
    const rectHeight = textHeight + padding * 2

    // Draw dashed rectangle around text
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight)
    ctx.setLineDash([])

    // Draw drag handle
    const handleSize = 8
    ctx.fillStyle = 'blue'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    ctx.fillRect(position.x - handleSize/2, position.y - handleSize/2, handleSize, handleSize)
    ctx.strokeRect(position.x - handleSize/2, position.y - handleSize/2, handleSize, handleSize)
  }

  // Check if mouse is over a resize handle
  const getResizeHandle = (mouseX, mouseY) => {
    const handleSize = 12
    const handles = [
      { x: imagePosition.x - handleSize/2, y: imagePosition.y - handleSize/2, type: 'top-left' },
      { x: imagePosition.x + imageSize.width - handleSize/2, y: imagePosition.y - handleSize/2, type: 'top-right' },
      { x: imagePosition.x - handleSize/2, y: imagePosition.y + imageSize.height - handleSize/2, type: 'bottom-left' },
      { x: imagePosition.x + imageSize.width - handleSize/2, y: imagePosition.y + imageSize.height - handleSize/2, type: 'bottom-right' },
    ]

    for (const handle of handles) {
      if (mouseX >= handle.x && mouseX <= handle.x + handleSize &&
          mouseY >= handle.y && mouseY <= handle.y + handleSize) {
        return handle.type
      }
    }
    return null
  }

  // Check if mouse is over the image
  const isMouseOverImage = (mouseX, mouseY) => {
    return mouseX >= imagePosition.x && mouseX <= imagePosition.x + imageSize.width &&
           mouseY >= imagePosition.y && mouseY <= imagePosition.y + imageSize.height
  }

  // Check if mouse is over the text
  const isMouseOverText = (mouseX, mouseY) => {
    if (!text.trim()) return false

    const canvas = editorCanvasRef.current
    if (!canvas) return false

    const fontSize = Math.max(16, canvas.height * 0.04)
    const ctx = canvas.getContext('2d')
    ctx.font = `bold ${fontSize}px Arial`
    const textMetrics = ctx.measureText(text)
    const textWidth = textMetrics.width
    const textHeight = fontSize

    const padding = 10
    const rectX = textPosition.x - textWidth/2 - padding
    const rectY = textPosition.y - textHeight/2 - padding
    const rectWidth = textWidth + padding * 2
    const rectHeight = textHeight + padding * 2

    return mouseX >= rectX && mouseX <= rectX + rectWidth &&
           mouseY >= rectY && mouseY <= rectY + rectHeight
  }

  // Get mouse position relative to canvas
  const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  }

  // Handle mouse down on editor canvas
  const handleMouseDown = (event) => {
    event.preventDefault()
    const canvas = editorCanvasRef.current
    if (!canvas || !userImage) return

    const mousePos = getMousePos(canvas, event)
    const resizeHandle = getResizeHandle(mousePos.x, mousePos.y)

    if (resizeHandle) {
      // Start resizing image
      setIsResizing(resizeHandle)
      setResizeStart({
        x: mousePos.x,
        y: mousePos.y,
        width: imageSize.width,
        height: imageSize.height,
        startX: imagePosition.x,
        startY: imagePosition.y
      })
    } else if (isMouseOverText(mousePos.x, mousePos.y)) {
      // Start dragging text
      setIsDraggingText(true)
      setTextDragStart({
        x: mousePos.x - textPosition.x,
        y: mousePos.y - textPosition.y
      })
    } else if (isMouseOverImage(mousePos.x, mousePos.y)) {
      // Start dragging image
      setIsDragging(true)
      setDragStart({
        x: mousePos.x - imagePosition.x,
        y: mousePos.y - imagePosition.y
      })
    }
  }

  // Handle mouse move on editor canvas
  const handleMouseMove = (event) => {
    event.preventDefault()
    const canvas = editorCanvasRef.current
    if (!canvas || !userImage) return

    const mousePos = getMousePos(canvas, event)

    if (isDraggingText) {
      // Update text position while dragging
      const newX = Math.max(50, Math.min(canvas.width - 50, mousePos.x - textDragStart.x))
      const newY = Math.max(20, Math.min(canvas.height - 20, mousePos.y - textDragStart.y))

      setTextPosition({
        x: newX,
        y: newY
      })
    } else if (isDragging) {
      // Update image position while dragging
      const newX = Math.max(0, Math.min(canvas.width - imageSize.width, mousePos.x - dragStart.x))
      const newY = Math.max(0, Math.min(canvas.height - imageSize.height, mousePos.y - dragStart.y))

      setImagePosition({
        x: newX,
        y: newY
      })
    } else if (isResizing) {
      // Update image size and position while resizing
      const deltaX = mousePos.x - resizeStart.x
      const deltaY = mousePos.y - resizeStart.y

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = resizeStart.startX
      let newY = resizeStart.startY

      const minSize = 30

      if (isResizing === 'top-left') {
        newWidth = Math.max(minSize, resizeStart.width - deltaX)
        newHeight = Math.max(minSize, resizeStart.height - deltaY)
        newX = resizeStart.startX + (resizeStart.width - newWidth)
        newY = resizeStart.startY + (resizeStart.height - newHeight)
      } else if (isResizing === 'top-right') {
        newWidth = Math.max(minSize, resizeStart.width + deltaX)
        newHeight = Math.max(minSize, resizeStart.height - deltaY)
        newY = resizeStart.startY + (resizeStart.height - newHeight)
      } else if (isResizing === 'bottom-left') {
        newWidth = Math.max(minSize, resizeStart.width - deltaX)
        newHeight = Math.max(minSize, resizeStart.height + deltaY)
        newX = resizeStart.startX + (resizeStart.width - newWidth)
      } else if (isResizing === 'bottom-right') {
        newWidth = Math.max(minSize, resizeStart.width + deltaX)
        newHeight = Math.max(minSize, resizeStart.height + deltaY)
      }

      // Keep image within canvas bounds
      newX = Math.max(0, Math.min(canvas.width - newWidth, newX))
      newY = Math.max(0, Math.min(canvas.height - newHeight, newY))

      setImageSize({ width: newWidth, height: newHeight })
      setImagePosition({ x: newX, y: newY })
    } else {
      // Update cursor based on what's under the mouse
      const resizeHandle = getResizeHandle(mousePos.x, mousePos.y)
      if (resizeHandle) {
        if (resizeHandle === 'top-left' || resizeHandle === 'bottom-right') {
          canvas.style.cursor = 'nw-resize'
        } else {
          canvas.style.cursor = 'ne-resize'
        }
      } else if (isMouseOverText(mousePos.x, mousePos.y)) {
        canvas.style.cursor = 'move'
      } else if (isMouseOverImage(mousePos.x, mousePos.y)) {
        canvas.style.cursor = 'move'
      } else {
        canvas.style.cursor = 'default'
      }
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setIsDraggingText(false)
    const canvas = editorCanvasRef.current
    if (canvas) {
      canvas.style.cursor = 'default'
    }
  }

  // Add global mouse event listeners to handle mouse up outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setIsDraggingText(false)
      const canvas = editorCanvasRef.current
      if (canvas) {
        canvas.style.cursor = 'default'
      }
    }

    const handleGlobalMouseMove = (event) => {
      const canvas = editorCanvasRef.current
      if ((isDragging || isResizing || isDraggingText) && canvas) {
        // Check if mouse is still over the canvas
        const rect = canvas.getBoundingClientRect()
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom) {
          handleMouseMove(event)
        }
      }
    }

    if (isDragging || isResizing || isDraggingText) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, isResizing, isDraggingText])

  // Redraw canvas when image position, size, text position, or images change
  useEffect(() => {
    drawEditorCanvas()
  }, [imagePosition, imageSize, textPosition, text, userImage, backgroundImage, isDragging, isResizing, isDraggingText])

  const generateComposite = () => {
    if (!userImage || !text.trim()) {
      alert('Please upload an image and add some text!')
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Load and draw the base image (background.png) as background
    const baseImg = new Image()
    baseImg.crossOrigin = 'anonymous' // Handle CORS if needed

    baseImg.onload = () => {
      console.log('Base image loaded successfully:', baseImg.width, 'x', baseImg.height)

      // Set canvas size to match the background image dimensions
      canvas.width = baseImg.width
      canvas.height = baseImg.height

      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the background.png as the full background
      ctx.drawImage(baseImg, 0, 0)

      // Now load and overlay the user's image on top using editor position and size
      const userImg = new Image()
      userImg.onload = () => {
        console.log('User image loaded successfully:', userImg.width, 'x', userImg.height)

        // Use the position and size from the editor
        const userImgX = imagePosition.x
        const userImgY = imagePosition.y
        const userImgWidth = imageSize.width
        const userImgHeight = imageSize.height

        // Save context for clipping
        ctx.save()

        // Create circular clipping path for user image
        ctx.beginPath()
        ctx.arc(
          userImgX + userImgWidth/2,
          userImgY + userImgHeight/2,
          Math.min(userImgWidth, userImgHeight)/2,
          0,
          2 * Math.PI
        )
        ctx.clip()

        // Draw user image (cropped to circle) on top of background
        ctx.drawImage(userImg, userImgX, userImgY, userImgWidth, userImgHeight)

        // Restore context
        ctx.restore()

        // No borders in the final composite - clean circular image only

        // Add text overlay using the position from the editor
        const fontSize = Math.max(16, canvas.height * 0.04)
        ctx.font = `bold ${fontSize}px Arial`
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = Math.max(2, fontSize * 0.1)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Use text position from editor, or default to bottom center
        let finalTextX = textPosition.x
        let finalTextY = textPosition.y

        // If text position is still at default (0,0), use bottom center
        if (textPosition.x === 0 && textPosition.y === 0) {
          finalTextX = canvas.width / 2
          finalTextY = canvas.height - (canvas.height * 0.05)
        }

        // Add text with outline for better visibility
        ctx.strokeText(text, finalTextX, finalTextY)
        ctx.fillText(text, finalTextX, finalTextY)

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
      console.error('Failed to load base image: /background.png')
      alert('Failed to load the background image. Please check if background.png exists.')

      // Fallback: create a colored background
      canvas.width = 800
      canvas.height = 600
      ctx.fillStyle = '#4a90e2'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add placeholder text
      ctx.font = 'bold 32px Arial'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.fillText('Background Image Missing', canvas.width/2, canvas.height/2)
      ctx.textAlign = 'left'
    }

    // Load the background.png from the public folder
    baseImg.src = '/background.png'
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
    setImagePosition({ x: 250, y: 150 })
    setImageSize({ width: 500, height: 500 })
    setTextPosition({ x: 0, y: 0 }) // Reset to default
    setIsDragging(false)
    setIsResizing(false)
    setIsDraggingText(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="app">
      <h1>Image Overlay Creator</h1>

      <div className="upload-section">
        <h2>1. Upload Your Picture</h2>
        <p className="instruction-text">Upload your image and then drag, resize, and position it on the canvas below</p>
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

      {userImage && backgroundImage && (
        <div className="editor-section">
          <h2>2. Position and Resize Your Image</h2>
          <p className="instruction-text">
            • Click and drag the image to move it around<br/>
            • Drag the white corner handles to resize the image<br/>
            • Click and drag the text (blue box) to reposition it<br/>
            • The image will appear as a circle in the final result
          </p>

          <div className="text-section">
            <h2>3. Add Your Text</h2>
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
          <div className="canvas-container">
            <canvas
              ref={editorCanvasRef}
              className="editor-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ userSelect: 'none' }}
            />
          </div>
        </div>
      )}


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
          <h2>4. Your Composite Image</h2>
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
