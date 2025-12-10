// Testing Library imports tools for testing React components
// render: renders a React component in a test environment (like a mini browser)
// screen: provides methods to find elements in the rendered component (like getByText)
// waitFor: waits for something to appear/disappear (useful for async operations like API calls)
import { render, screen, waitFor } from '@testing-library/react';
// Import the component we're testing
import Analysis from 'components/Analysis';
// MSW (Mock Service Worker) imports used to mock API requests in tests
// http: creates HTTP request handlers (like GET, POST)
// HttpResponse: creates mock HTTP responses
import { http, HttpResponse } from 'msw';
// setupServer: creates a mock server that intercepts HTTP requests during tests
import { setupServer } from 'msw/node';
// wrapper: React component wrapper that provides context (like QueryClientProvider)
// Needed because Analysis component might use React Query hooks
import { wrapper } from '../utils';

// Mock data: simulates what the real API would return from /api/analyze
// This is fake data used in tests instead of making real API calls
// Structure matches the AnalysisResult interface from Analysis.tsx
const mockAnalysisResult = {
    statusBreakdown: {
        open: 150,
        closed: 250,
        pending: 100,
        openPercent: 30,
        closedPercent: 50,
        pendingPercent: 20,
    },
    priorityBreakdown: {
        high: 100,
        normal: 200,
        low: 200,
        highPercent: 20,
        normalPercent: 40,
        lowPercent: 40,
    },
    resolutionTimeliness: {
        onTime: 180,
        overdue: 70,
        currentlyOverdue: 50,
        onTimePercent: 72,
        overduePercent: 28,
        currentlyOverduePercent: 10,
    },
    highPriorityAnalysis: {
        averageTimeToCloseHours: 48.5,
        averageTimeToCloseDays: 2.02,
        totalClosedHighPriority: 60,
    },
    longestToSolveHighPriority: {
        issueId: 123,
        timeToSolveHours: 120.5,
        timeToSolveDays: 5.02,
        satisfactionRatingScore: 'good',
    },
    additionalInsights: {
        totalIssues: 500,
        issuesByType: { problem: 200, question: 150, task: 150 },
        averageSatisfactionByPriority: { high: 'good', normal: 'excellent', low: 'good' },
        issuesClosedCount: 250,
        issuesOpenCount: 150,
    },
};

// Setup MSW mock server intercepts HTTP requests during tests
// When the Analysis component tries to fetch from /api/analyze,
// this mock server will intercept it and return our mock data instead
const server = setupServer(
    // http.get: handles GET requests to /api/analyze
    // When Analysis component calls axios.get('/api/analyze'), this handler runs
    http.get('/api/analyze', () => {
        // Return our mock data as JSON response (simulates real API response)
        return HttpResponse.json(mockAnalysisResult)
    }),
)

// Test lifecycle hooks: run code before/after tests
// beforeAll: runs once before all tests start
// Starts the mock server so it can intercept requests
beforeAll(() => server.listen())
// afterEach: runs after each individual test
// Resets handlers to clean state between tests (prevents test pollution)
afterEach(() => server.resetHandlers())
// afterAll: runs once after all tests finish
// Stops the mock server (cleanup)
afterAll(() => server.close())

// describe: groups related tests together
// '<Analysis />' is the test suite name (describes what we're testing)
describe('<Analysis />', () => {
    // Test 1: Checks if component renders and shows loading state, then displays results
    // it: defines a single test case
    // 'should render and display analysis results': test description (what it tests)
    it('should render and display analysis results', async () => {
        // render: renders the Analysis component in test environment
        // wrapper: provides React Query context (needed if component uses useQuery)
        // This simulates what happens when user visits the page
        render(<Analysis />, { wrapper })

        // Assertion: Check if "Loading analysis..." text appears
        // This should appear immediately when component first renders
        // getByText: finds element containing this exact text
        // toBeInTheDocument: checks if element exists in the rendered HTML
        expect(screen.getByText('Loading analysis...')).toBeInTheDocument()

        // waitFor: waits for async operation to complete (API call finishes)
        // Analysis component fetches data from /api/analyze (which our mock server handles)
        // Once data loads, component should show the results
        await waitFor(() => {
            // Assertion: Check if main heading appears after data loads
            // This confirms the component successfully fetched and displayed data
            expect(screen.getByText('Backend Analysis Results (500 Data Points)')).toBeInTheDocument()
        })
    })

    // Test 2: Checks if status breakdown section displays correctly
    // Verifies that status labels (Open, Closed, Pending) and their counts are shown
    it('should display status breakdown', async () => {
        // Render component again (each test is independent)
        render(<Analysis />, { wrapper })

        // Wait for data to load, then check status breakdown section
        await waitFor(() => {
            // Assertion 1 Check if Status Breakdown heading exists
            expect(screen.getByText('Status Breakdown')).toBeInTheDocument()
            // Assertion 2-4 Check if status labels are displayed
            expect(screen.getByText('Open')).toBeInTheDocument()
            expect(screen.getByText('Closed')).toBeInTheDocument()
            expect(screen.getByText('Pending')).toBeInTheDocument()
            
            // Check counts Find the status breakdown section, then verify it contains the numbers
            // closest('div'): finds the parent div containing "Status Breakdown" text
            // This narrows down the search to just the status section (not the whole page)
            // Why? Because numbers like "150" might appear multiple times on the page
            const statusSection = screen.getByText('Status Breakdown').closest('div')
            // toHaveTextContent: checks if element contains these numbers
            // 150 = open count, 250 = closed count, 100 = pending count (from mock data)
            expect(statusSection).toHaveTextContent('150')
            expect(statusSection).toHaveTextContent('250')
            expect(statusSection).toHaveTextContent('100')
        })
    })

    // Test 3: Checks if priority breakdown section displays correctly
    // Verifies that priority labels and counts are shown
    it('should display priority breakdown', async () => {
        render(<Analysis />, { wrapper })

        await waitFor(() => {
            // Assertion 1: Check if "Priority Breakdown" heading exists
            expect(screen.getByText('Priority Breakdown')).toBeInTheDocument()
            // Assertion 2: Check if "High" priority label is displayed
            expect(screen.getByText('High')).toBeInTheDocument()
            
            // Check count: Find the priority breakdown section, then verify it contains the number
            // closest('div'): finds parent div of "Priority Breakdown" (the priority section)
            // This ensures we're checking the count in the right section (not elsewhere on page)
            const prioritySection = screen.getByText('Priority Breakdown').closest('div')
            // 100 = high priority count from mock data
            expect(prioritySection).toHaveTextContent('100')
        })
    })

    // Test 4: Checks if high priority analysis section displays correctly
    // Verifies that average time to close for high priority issues is shown
    it('should display high priority analysis', async () => {
        render(<Analysis />, { wrapper })

        await waitFor(() => {
            // Assertion 1: Check if "High Priority Issues Analysis" heading exists
            expect(screen.getByText('High Priority Issues Analysis')).toBeInTheDocument()
            // Assertion 2: Check if "Average Time to Close" text exists
            // /Average Time to Close/i: regex pattern (case-insensitive)
            // The 'i' flag makes it case-insensitive (matches "average time to close" or "Average Time to Close")
            expect(screen.getByText(/Average Time to Close/i)).toBeInTheDocument()
            // Assertion 3: Check if the average time value is displayed
            // /48.50 hours/i: regex pattern matching "48.50 hours" (case-insensitive)
            // This verifies the calculated average time from mock data is shown
            expect(screen.getByText(/48.50 hours/i)).toBeInTheDocument()
        })
    })

    // Test 5: Checks if longest to solve issue section displays correctly
    // Verifies that the issue ID and satisfaction rating of the longest-to-solve issue are shown
    it('should display longest to solve issue', async () => {
        render(<Analysis />, { wrapper })

        await waitFor(() => {
            // Assertion 1: Check if "Longest to Solve High Priority Issue" heading exists
            expect(screen.getByText('Longest to Solve High Priority Issue')).toBeInTheDocument()
            
            // Check details: Find the longest to solve section, then verify it contains the data
            // closest('div'): finds parent div containing the heading (the longest section)
            // This narrows search to just this section (not the whole page)
            const longestSection = screen.getByText('Longest to Solve High Priority Issue').closest('div')
            // Assertion 2: Check if issue ID "123" is displayed in this section
            // 123 = issueId from mock data (the longest-to-solve high priority issue)
            expect(longestSection).toHaveTextContent('123')
            // Assertion 3: Check if satisfaction rating "good" is displayed
            // 'good' = satisfactionRatingScore from mock data
            expect(longestSection).toHaveTextContent('good')
        })
    })

    // Test 6: Checks if additional insights section displays correctly
    // Verifies that total issues count and other insights are shown
    it('should display additional insights', async () => {
        render(<Analysis />, { wrapper })

        await waitFor(() => {
            // Assertion 1: Check if "Additional Insights" heading exists
            expect(screen.getByText('Additional Insights')).toBeInTheDocument()
            // Assertion 2: Check if "Total Issues" label is displayed
            // /Total Issues/i: regex pattern (case-insensitive)
            expect(screen.getByText(/Total Issues/i)).toBeInTheDocument()
            // Assertion 3: Check if total count "500" is displayed
            // 500 = totalIssues from mock data
            // Note: We use getByText('500') directly because it's a unique number on the page
            expect(screen.getByText('500')).toBeInTheDocument()
        })
    })
})
// End of test suite - all tests for Analysis component are complete

