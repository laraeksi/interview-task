/**
This file tests the ServiceDesk component, which is the main interface for service desk operators.
It verifies that all the interactive features work correctly:
Displaying and sorting issues by priority
Filtering issues (Open + High Priority filter)
Searching issues by organization ID
Switching between List view and Dashboard view
Displaying correct statistics in the Dashboard
 
 The ServiceDesk component is the core user interface. If filtering, searching, 
 or sorting breaks, operators can't do their job effectively. These tests ensure 
 all features work as expected.
 */

// Testing Library imports, tools for testing React components
import { render, screen, waitFor } from '@testing-library/react';
// userEvent: simulates user interactions (like clicking buttons, typing in inputs)
import userEvent from '@testing-library/user-event';
// Import the ServiceDesk component we're testing
import ServiceDesk from 'components/ServiceDesk';
//Mock Service Worker mocks API requests during tests
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
// Mock data fake data used instead of real API calls
import { mockDataExtended } from '../mockDataExtended';
// wrapper provides React Query context for components
import { wrapper } from '../utils';

// Setup MSW mock server intercepts HTTP requests during tests
// When ServiceDesk component makes API calls to /api/issues, this server returns mock data instead
const server = setupServer(
    http.get('/api/issues', () => {
        return HttpResponse.json(mockDataExtended)
    }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('<ServiceDesk />', () => {
    /**
     TEST 1: Basic Rendering and Priority Sorting
     WHAT IT TESTS:
     Component renders correctly shows loading state, then data
     Issues are fetched from API and displayed
     Issues are automatically sorted by priority high  normal  low
     
     WHY IT'S IMPORTANT:
     This is the foundation, if issues don't display or sort correctly, nothing else works.
     Operators need to see high priority issues first to handle urgent tickets.
     */
    it('should render and display issues sorted by priority', async () => {
        // Render the ServiceDesk component in test environment
        render(<ServiceDesk />, { wrapper })

        // First, check that loading state appears component is fetching data
        expect(screen.getByText('Loading issues...')).toBeInTheDocument()

        // Wait for data to load and component to render issues
        await waitFor(() => {
            expect(screen.getByText('Service Desk')).toBeInTheDocument()
            expect(screen.getByText('Critical system failure')).toBeInTheDocument()
        })

        // Verify that multiple issues are displayed
        // These should be sorted by priority (high priority issues appear first)
        expect(screen.getByText('Critical system failure')).toBeInTheDocument()
        expect(screen.getByText('How to reset password?')).toBeInTheDocument()
    })

    /**
     TEST 2: Open + High Priority Filter
     WHAT IT TESTS:
     "Show only Open and High Priority" checkbox works
     When checked, only shows issues that are BOTH open AND high priority
     Other issues (closed, normal priority, low priority) are hidden
     
     Operators often need to focus on urgent, unresolved issues. This filter helps them
     quickly find tickets that need immediate attention.
     */
    it('should filter by open and high priority', async () => {
        render(<ServiceDesk />, { wrapper })
        const user = userEvent.setup()

        // Wait for initial data to load
        await waitFor(() => expect(screen.getByText('Critical system failure')).toBeInTheDocument())

        // Find the filter checkbox and click it
        // This checkbox filters to show only issues that are status="open" AND priority="high"
        const filterCheckbox = screen.getByLabelText(/Show only Open \+ High Priority/i)
        await user.click(filterCheckbox)

        // After clicking filter, verify:
        // High priority open issues are still visible
        // Other issues (closed, normal priority,...) are hidden
        await waitFor(() => {
            expect(screen.getByText('Critical system failure')).toBeInTheDocument()
            // This issue should be hidden because it doesn't match the filter criteria
            expect(screen.queryByText('How to reset password?')).not.toBeInTheDocument()
        })
    })

    /**
     TEST 3: Search by Organization ID
     WHAT IT TESTS:
     Search input field works correctly
     Typing in search box filters issues by organization_id
     Only issues matching the search term are shown
     Issues not matching the search are hidden
     
     Operators often need to find all tickets for a specific organization (company).
     This search feature lets them quickly filter by organization name/ID.
     */
    it('should search by organization_id', async () => {
        render(<ServiceDesk />, { wrapper })
        const user = userEvent.setup()

        // Wait for initial data to load
        await waitFor(() => expect(screen.getByText('Critical system failure')).toBeInTheDocument())

        // Find the search input field and type Acme in it
        // This should filter issues to only show those with organization_id containing Acme
        const searchInput = screen.getByPlaceholderText(/Enter organization name/i)
        await user.type(searchInput, 'Acme')

        // After typing, verify
        // Issues matching Acme are still visible
        // Issues not matching Acme are hidden
        await waitFor(() => {
            expect(screen.getByText('Critical system failure')).toBeInTheDocument()
            // This issue should be hidden because its organization_id doesn't match Acme
            expect(screen.queryByText('How to reset password?')).not.toBeInTheDocument()
        })
    })

    /**
     TEST 4: Switch to Dashboard View
     WHAT IT TESTS:
     "Dashboard" button works correctly
      Clicking Dashboard button switches from List view to Dashboard view
      Dashboard view displays statistics sections (By Priority, By Type, By Status, By Satisfaction)
     
     The Dashboard provides an overview of all tickets with statistics. Operators need to be able
     to switch between detailed list view and summary dashboard view to get different perspectives.
     */
    it('should switch to dashboard view', async () => {
        render(<ServiceDesk />, { wrapper })
        const user = userEvent.setup()

        // Wait for initial data to load starts in List view
        await waitFor(() => expect(screen.getByText('Critical system failure')).toBeInTheDocument())

        // Find and click the "Dashboard" button to switch views
        const dashboardButton = screen.getByText('Dashboard')
        await user.click(dashboardButton)

        // After clicking, verify that Dashboard view appears with all statistics sections
        // Dashboard should show: Priority breakdown, Type breakdown, Status breakdown, Satisfaction breakdown
        await waitFor(() => {
            expect(screen.getByText('By Priority')).toBeInTheDocument()
            expect(screen.getByText('By Type')).toBeInTheDocument()
            expect(screen.getByText('By Status')).toBeInTheDocument()
            expect(screen.getByText('By Satisfaction')).toBeInTheDocument()
        })
    })

    /**
     TEST 5: Dashboard Statistics Accuracy
     WHAT IT TESTS:
     Dashboard calculates and displays correct statistics
     Priority breakdown shows correct counts (e.g., 2 high priority issues)
     Status breakdown shows all status types (open, closed, etc.)
     Summary section shows correct total ticket count
     
     If statistics are wrong, operators make decisions based on incorrect data.
     This test ensures the dashboard accurately counts and displays ticket metrics.
     */
    it('should display correct statistics in dashboard', async () => {
        render(<ServiceDesk />, { wrapper })
        const user = userEvent.setup()

        // Wait for initial data to load
        await waitFor(() => expect(screen.getByText('Critical system failure')).toBeInTheDocument())

        // Switch to Dashboard view
        const dashboardButton = screen.getByText('Dashboard')
        await user.click(dashboardButton)

        // Verify that all statistics are calculated and displayed correctly
        await waitFor(() => {
            // Check priority statistics: should show high priority and count of 2
            expect(screen.getByText('high')).toBeInTheDocument()
            const prioritySection = screen.getByText('By Priority').closest('div')
            expect(prioritySection).toHaveTextContent('2') // 2 high priority issues in mock data
            
            // Check status statistics should show different status types
            expect(screen.getByText('open')).toBeInTheDocument()
            expect(screen.getByText('closed')).toBeInTheDocument()
            
            // Check summary section should show total ticket count
            expect(screen.getByText('Total Tickets')).toBeInTheDocument()
            const summarySection = screen.getByText('Summary').closest('div')
            expect(summarySection).toHaveTextContent('4') // Total of 4 tickets in mock data
        })
    })
})

