/**
 This file tests the App component renders correctly with all tabs visible,tab navigation works 
 (clicking tabs switches views), each tab shows the correct component content, loading states appear correctly,
 and data loads and displays properly. The App component is the root of the application. If it breaks, nothing works.
 Testing ensures tab navigation works correctly and users can switch between views.
 */

// Testing Library imports tools for testing React components
import { render, waitFor, screen } from '@testing-library/react';
// userEvent simulates user interactions like clicking buttons
import userEvent from '@testing-library/user-event';
// Import the App component we're testing
import App from 'components/App';
// Mock Service Worker, mocks API requests during tests
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
// Mock data files fake data used instead of real API calls
import { mockData } from '../mockData';
import { mockDataExtended } from '../mockDataExtended';
// wrapper provides React Query context for components
import { wrapper } from '../utils';

// Setup MSW mock server that intercepts HTTP requests during tests
// When components make API calls, this server returns mock data instead
const server = setupServer(
    // CHANGED Added /api/data handler, mocks the Raw Data tab API call
    // Original Likely only had this one (for original Data component)
    // Why: Raw Data tab still uses /api/data endpoint
    http.get('/api/data', () => {
        return HttpResponse.json(mockData)
    }),
    // CHANGED Added /api/issues handler, mocks the Service Desk tab API call
    // Original Didn't exist (ServiceDesk component is new)
    // Why because Service Desk tab fetches from /api/issues, need to mock this
    http.get('/api/issues', () => {
        return HttpResponse.json(mockDataExtended)
    }),
    // CHANGED Added /api/analyze handler, mocks the Backend Analysis tab API call
    // Original Didn't exist (Analysis component is new)
    // Why: Backend Analysis tab fetches from /api/analyze, need to mock this
    http.get('/api/analyze', () => {
        return HttpResponse.json({
            statusBreakdown: {
                open: 1,
                closed: 2,
                pending: 1,
                openPercent: 25,
                closedPercent: 50,
                pendingPercent: 25,
            },
            priorityBreakdown: {
                high: 2,
                normal: 1,
                low: 1,
                highPercent: 50,
                normalPercent: 25,
                lowPercent: 25,
            },
            resolutionTimeliness: {
                onTime: 1,
                overdue: 1,
                currentlyOverdue: 0,
                onTimePercent: 50,
                overduePercent: 50,
                currentlyOverduePercent: 0,
            },
            highPriorityAnalysis: {
                averageTimeToCloseHours: 4,
                averageTimeToCloseDays: 0.17,
                totalClosedHighPriority: 1,
            },
            longestToSolveHighPriority: {
                issueId: 3,
                timeToSolveHours: 4,
                timeToSolveDays: 0.17,
                satisfactionRatingScore: 'bad',
            },
            additionalInsights: {
                totalIssues: 4,
                issuesByType: { problem: 2, question: 1, task: 1 },
                averageSatisfactionByPriority: { high: 'good', normal: 'excellent', low: 'good' },
                issuesClosedCount: 2,
                issuesOpenCount: 1,
            },
        })
    }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('<App />', () => {
    // CHANGED Test description and assertions updated to match new tab structure
    // Original Likely tested just Data component rendering
    // Why: App now has tabs, need to test that all tabs are visible and Service Desk (default) loads
    it('should render the Service Desk System with tabs', async () => {
        // render: converts React component to HTML and puts it in test environment
        // <App />: the component to render convert to HTML
        // { wrapper }: provides React Query context needed for components that use hooks
        // Rendering = taking React code and making it into actual HTML we can test
        // Think of it like: code, HTML,visible on screen but in test environment, not real browser
        const { container } = render(<App />, { wrapper })

        // CHANGED Added assertions for tab navigation UI
        // Original Probably just checked if Data component rendered
        // Why: Need to verify all three tabs are visible in the UI
        expect(screen.getByText('Service Desk System')).toBeInTheDocument()
        expect(screen.getByText('Service Desk (Front-end)')).toBeInTheDocument()
        expect(screen.getByText('Backend Analysis')).toBeInTheDocument()
        expect(screen.getByText('Raw Data')).toBeInTheDocument()
        
        // Changed from "Loading data..." to "Loading issues..."
        // Originalchecked for Data component's loading message
        // Why: Service Desk is now the default tab, it shows "Loading issues..."
        expect(screen.getByText('Loading issues...')).toBeInTheDocument()
        
        // CHANGED: Changed assertion to check for ServiceDesk content
        // Original: Probably checked for Data component content
        // Why: Service Desk is default tab now, need to verify its content loads
        // "Critical system failure" is from mockDataExtended (ServiceDesk data)
        await waitFor(() => expect(container).toHaveTextContent('Critical system failure'))
    })

    // CHANGED: This is a completely new test, tests tab switching functionality
    // Original: Didn't exist (no tabs to switch between)
    // Why: App now has tab navigation, need to test that clicking tabs actually switches views
    it('should switch between tabs', async () => {
        render(<App />, { wrapper })
        // userEvent: simulates real user interactions (more reliable than fireEvent)
        const user = userEvent.setup()

        // Wait for Service Desk (default tab) to load first
        await waitFor(() => expect(screen.getByText('Critical system failure')).toBeInTheDocument())

        // CHANGED: New test step, click Backend Analysis tab
        // Original: No tab switching existed
        // Why: Verify that clicking "Backend Analysis" tab shows Analysis component
        const backendTab = screen.getByText('Backend Analysis')
        await user.click(backendTab)

        // CHANGED: New assertion, check if Analysis component content appears
        // Original: No Analysis component existed
        // Why: Verify tab switching works, Analysis component should render after clicking tab
        await waitFor(() => expect(screen.getByText('Backend Analysis Results (500 Data Points)')).toBeInTheDocument())

        // CHANGED: New test step, click Raw Data tab
        // Original: No tab switching existed
        // Why: Verify that clicking "Raw Data" tab shows Data component
        const rawDataTab = screen.getByText('Raw Data')
        await user.click(rawDataTab)

        // CHANGED: New assertion, check if Data component content appears
        // Original: Data was always visible, no tab switching needed
        // Why: Verify tab switching works, Data component should render after clicking tab
        await waitFor(() => expect(screen.getByText('Raw Data Display')).toBeInTheDocument())
    })
})
