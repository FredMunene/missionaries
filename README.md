[![Netlify Status](https://api.netlify.com/api/v1/badges/135e10ef-cd41-4ee4-93d8-ad3c91331809/deploy-status)](https://app.netlify.com/projects/ethereum-10yrs-kisumu/deploys)

# Ethereum@10 Kisumu - Event Poster Generator


A React-based web application for generating personalized attendance posters for the **Ethereum@10 Kisumu** event happening on **July 30, 2025**.

## About the Event

**Ethereum@10 Kisumu** is a celebration of Ethereum's 10th anniversary, bringing together the blockchain community in Kisumu, Kenya. This poster generator allows attendees to create personalized "I am attending" posters to share on social media and show their participation in this historic event.

## Features

- 📸 **Image Upload**: Upload your photo to be featured on the poster
- ✏️ **Name Personalization**: Add your name to appear on the poster
- 🎨 **Interactive Editor**: Drag, resize, and position your image and text
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 💾 **Download**: Generate and download your personalized poster
- 🎯 **Circular Crop**: Your photo appears as a clean circular overlay

## How to Use

1. **Upload Your Photo**: Choose an image file from your device
2. **Enter Your Name**: Add your name that will appear on the poster
3. **Position & Resize**: Use the interactive editor to:
   - Drag your image to reposition it
   - Drag the corner handles to resize your image
   - Drag the text to move your name around
4. **Generate**: Click "Generate Final Image" to create your poster
5. **Download**: Save your personalized poster to share on social media

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **HTML5 Canvas** - Image manipulation and composition
- **CSS3** - Responsive styling and animations
- **JavaScript ES6+** - Modern JavaScript features

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FredMunene/missionaries.git
cd missionaries
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Styling and responsive design
├── main.jsx         # Application entry point
└── index.css        # Global styles

public/
└── background.png   # Event background image
```

## Event Details

- **Event**: Ethereum@10 Kisumu
- **Date**: July 30, 2025
- **Location**: Kisumu, Kenya
- **Purpose**: Celebrating 10 years of Ethereum

## Contributing

This project was created specifically for the Ethereum@10 Kisumu event. If you'd like to contribute improvements or report issues, please feel free to submit pull requests or open issues.

## License

This project is open source and available under the [MIT License](LICENSE).
