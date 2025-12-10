/**
 index.tsx is the Application Entry Point
 This is the main entry point of the React application. It's the first file that runs
 when the app starts. It finds the HTML element with id="root" and renders the App
 component into it.
 
 Finds the <div id="root"> element in index.html file
 Creates a React root connection point between React and the DOM
 Renders the App component into that root element
 The App component then renders all other components such as ServiceDesk, Analysis
 
  The "start button" of the application it tells React where to put everything on the page.
 */
import { createRoot } from 'react-dom/client'
import 'tailwindcss/tailwind.css'
import App from 'components/App'

// Find the HTML element where React will render the app
const container = document.getElementById('root') as HTMLDivElement
// Create a React root connection between React and the DOM
const root = createRoot(container)

// Render the App component into the root element, this starts the entire application
root.render(<App />)
