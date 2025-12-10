// Import React Query for data fetching and caching
// QueryClient: manages the query cache and configuration
// QueryClientProvider: provides React Query context to child components
import { QueryClient, QueryClientProvider } from "react-query"
// CHANGED Added useState import, needed to track which tab is active
// Original Only imported QueryClientProvider, no state management needed
import { useState } from "react"
// Import child components
import Data from "./Data" // Component for displaying raw JSON data
// CHANGED Added Analysis import, new component for backend analysis display
// Original Only had Data component
import Analysis from "./Analysis" // Component for displaying backend analysis
// CHANGED Added ServiceDesk import, new component for frontend service desk interface
// Original Only had Data component
import ServiceDesk from "./ServiceDesk"// Component for service desk interface

// Create a new QueryClient instance
// This manages caching, refetching, and other React Query features
const queryClient = new QueryClient()

// CHANGED Added Tab type definition, ensures only valid tab names can be used
// Original No tab navigation existed, so no type needed
// Why: Type safety prevents typos like 'service-desk' vs 'service_desk'
type Tab = 'service-desk' | 'backend-analysis' | 'raw-data'

// Main App component - root component of the application
function App() {
    // CHANGED Added activeTab state, tracks which tab user is viewing
    // Original No state needed, just showed Data component directly
    // Why: Need to remember which tab is active so we can show the right component
    const [activeTab, setActiveTab] = useState<Tab>('service-desk')

    return (
        // QueryClientProvider: Wraps app to provide React Query context
        // All child components can now use React Query hooks (useQuery, etc.)
        <QueryClientProvider client={queryClient}>
            {/* Main container: full screen height with gray background */}
            <div className='min-h-screen bg-gray-50'>
                {/* Content container with padding */}
                <div className='p-4'>
                    {/* Main heading */}
                    <h1 className='mb-6 text-3xl font-bold'>Service Desk System</h1>
                    
                    {/* CHANGED Added tab navigation UI,allows switching between views */}
                    {/* Original No navigation, just showed Data component */}
                    {/* Why: Need tabs to switch between ServiceDesk, Analysis, and Data views */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="flex space-x-4">
                            {/* Service Desk Tab Button */}
                            <button
                                onClick={() => setActiveTab('service-desk')}  // Set active tab to service-desk
                                // Conditional styling: blue if active, gray if inactive
                                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                                    activeTab === 'service-desk'
                                        ? 'border-blue-600 text-blue-600'  // Active: blue border and text
                                        : 'border-transparent text-gray-500 hover:text-gray-700'  // Inactive: transparent border, gray text
                                }`}
                            >
                                Service Desk (Front-end)
                            </button>
                            
                            {/* Backend Analysis Tab Button */}
                            <button
                                onClick={() => setActiveTab('backend-analysis')}  // Set active tab to backend-analysis
                                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                                    activeTab === 'backend-analysis'
                                        ? 'border-blue-600 text-blue-600'  // Active styling
                                        : 'border-transparent text-gray-500 hover:text-gray-700'  // Inactive styling
                                }`}
                            >
                                Backend Analysis
                            </button>
                            
                            {/* Raw Data Tab Button */}
                            <button
                                onClick={() => setActiveTab('raw-data')}  // Set active tab to raw-data
                                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                                    activeTab === 'raw-data'
                                        ? 'border-blue-600 text-blue-600'  // Active styling
                                        : 'border-transparent text-gray-500 hover:text-gray-700'  // Inactive styling
                                }`}
                            >
                                Raw Data
                            </button>
                        </nav>
                    </div>

                    {/* CHANGED: Changed from directly rendering <Data /> to conditional rendering */}
                    {/* Original: return <QueryClientProvider><Data /></QueryClientProvider> */}
                    {/* Why: Need to show different components based on which tab is active */}
                    <div>
                        {activeTab === 'service-desk' && <ServiceDesk />}
                        {activeTab === 'backend-analysis' && <Analysis />}
                        {activeTab === 'raw-data' && (
                            <div>
                                <h2 className='mb-4 text-2xl'>Raw Data Display</h2>
                                <Data />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </QueryClientProvider>
    )
}

export default App
