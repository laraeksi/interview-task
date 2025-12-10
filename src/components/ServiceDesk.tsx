// Import necessary types and React hooks
// SampleData: TypeScript interface for the API response structure
// axios: HTTP client for making API requests
// useEffect: React hook for side effects (data fetching)
// useState: React hook for managing component state
// useMemo: React hook for memoizing computed values (performance optimization)
import { SampleData } from "api/types";
import axios from 'axios';
import { useEffect, useState, useMemo } from "react";

// TypeScript type definitions for better type safety
// These restrict values to specific strings, preventing typos and errors
type Priority = 'high' | 'normal' | 'low';  // Possible priority values
type Status = 'open' | 'closed' | 'pending';            // Possible status values
type ViewMode = 'list' | 'dashboard';                   // Possible view modes

// Priority order mapping for sorting issues
// Lower numbers = higher priority (sorted first)
// This object maps priority strings to numeric values for comparison
const priorityOrder: Record<string, number> = {
    'high': 1,      // Highest priority - appears first
    'normal': 2,    // Normal priority
    'low': 3,       // Low priority - appears last
};

// Main ServiceDesk component - displays list of issues with filtering and dashboard
function ServiceDesk() {
    // React state hooks - manage component data and UI state
    
    // data: Stores the fetched issues from the API
    // undefined initially, then populated with SampleData when fetch completes
    const [data, setData] = useState<SampleData | undefined>(undefined);
    
    // loading: Tracks whether data is currently being fetched
    // true initially, set to false when fetch completes (success or error)
    const [loading, setLoading] = useState(true);
    
    // error: Stores any error message if the API request fails
    // null if no error, string with error message if error occurs
    const [error, setError] = useState<string | null>(null);
    
    // viewMode: Controls which view is displayed (list or dashboard)
    // 'list' shows the filtered/sorted list of issues
    // 'dashboard' shows statistics and charts
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    
    // filterOpenHighPriority: Boolean flag for filtering to show only open + high priority issues
    // When true, only displays issues that are both open AND high priority
    const [filterOpenHighPriority, setFilterOpenHighPriority] = useState(false);
    
    // searchTerm: Text input for searching issues by organization_id
    // As user types, issues are filtered to those containing the search term
    const [searchTerm, setSearchTerm] = useState('');

    // useEffect: Runs when component mounts (empty dependency array [])
    // Fetches issues data from the API endpoint
    useEffect(() => {
        // mounted flag: prevents state updates if component unmounts during fetch
        // This avoids "memory leak" warnings if user navigates away before fetch completes
        let mounted = true;

        // Async function to fetch data from API
        const fetchData = async () => {
            try {
                // Set loading to true to show loading indicator
                setLoading(true);
                
                // Make GET request to /api/issues endpoint
                // await: waits for HTTP request to complete
                // <SampleData>: TypeScript generic ensures response matches expected type
                const { data: allData } = await axios.get<SampleData>('/api/issues');
                
                // Only update state if component is still mounted
                // Prevents errors if component unmounts during async operation
                if (mounted) {
                    setData(allData);      // Store fetched data
                    setError(null);        // Clear any previous errors
                }
            } catch (err) {
                // Handle errors (network failure, API error, etc.)
                if (mounted) {
                    // Extract error message if it's an Error object, otherwise use default message
                    setError(err instanceof Error ? err.message : 'Failed to fetch issues');
                }
            } finally {
                // Always runs, whether success or error
                if (mounted) {
                    setLoading(false);     // Hide loading indicator
                }
            }
        };

        // Call the fetch function
        fetchData();

        // Cleanup function: runs when component unmounts
        // Sets mounted to false to prevent state updates after unmount
        return () => { mounted = false; };
    }, []);  // Empty array means this effect runs only once when component mounts

   
    // useMemo: remembers the filtered or sorted result, only recalculates when data/searchTerm/filter changes
    // This makes the app faster by avoiding unnecessary recalculations
    const filteredAndSortedIssues = useMemo(() => {
        // If no data exists, return empty array (nothing to show)
        if (!data?.results) return [];

        // Make a copy of all issues (so we don't change the original data)
        let issues = [...data.results];

        // If user typed something in search box, filter issues to only show matching ones
        // trim(): removes extra spaces from search term
        if (searchTerm.trim()) {
            // Convert search to lowercase so search is case-insensitive (ABC = abc)
            const searchLower = searchTerm.toLowerCase();
            
            // Keep only issues where organization_id contains the search term
            // Example search "ABC" shows issues with "ABC123"
            issues = issues.filter(issue =>
                issue.organization_id.toLowerCase().includes(searchLower)
            );
        }

        // Apply open and high priority filter
        // Only show issues that are BOTH open AND high priority
        if (filterOpenHighPriority) {
            issues = issues.filter(issue =>
                issue.status.toLowerCase() === 'open' &&
                issue.priority.toLowerCase() === 'high'
            );
        }

        // Sort put high priority first, then normal, then low
        // priorityOrder gives each priority a number: high=1, normal=2, low=3
        // Lower numbers sort first, so high priority appears at the top
        issues.sort((a, b) => {
            // Get the number for each issue's priority (high=1, normal=2, low=3)
            // || 99: if priority not found, use 99 (sorts last)
            const priorityA = priorityOrder[a.priority.toLowerCase()] || 99;
            const priorityB = priorityOrder[b.priority.toLowerCase()] || 99;
            
            // Return negative if A should come before B, positive if after, 0 if equal
            return priorityA - priorityB;
        });

        // Return the filtered and sorted array
        return issues;
    }, [data, filterOpenHighPriority, searchTerm]);  // Dependencies: recalculate when these change

    // Calculate dashboard statistics counts of issues by various categories
    // useMemo recalculates when data, filterOpenHighPriority, or searchTerm changes
    const dashboardStats = useMemo(() => {
        // Early return with empty objects if no data
        if (!data?.results) {
            return {
                byPriority: {},      // Empty object for priority counts
                byType: {},         // Empty object for type counts
                byStatus: {},       // Empty object for status counts
                bySatisfaction: {}, // Empty object for satisfaction counts
            };
        }

        // Initialize empty objects to store counts
        // Record<string, number>: TypeScript type for object with string keys and number values
        const byPriority: Record<string, number> = {};      // Count by priority level
        const byType: Record<string, number> = {};          // Count by issue type
        const byStatus: Record<string, number> = {};        // Count by status
        const bySatisfaction: Record<string, number> = {};   // Count by satisfaction rating

        // Loop through each issue and count by category
        data.results.forEach(issue => {
            // Count by priority increment counter for this priority level
            const priority = issue.priority.toLowerCase();
            // || 0 if key doesn't exist, start at 0, then increment
            byPriority[priority] = (byPriority[priority] || 0) + 1;

            // Count by type increment counter for this issue type
            const type = issue.type.toLowerCase();
            byType[type] = (byType[type] || 0) + 1;

            // Count by status increment counter for this status
            const status = issue.status.toLowerCase();
            byStatus[status] = (byStatus[status] || 0) + 1;

            // Count by satisfaction rating
            // ?. optional chaining - safely accesses nested property
            // || N/A  if no satisfaction rating, use N/A as default
            const satisfaction = issue.satisfaction_rating?.score || 'N/A';
            bySatisfaction[satisfaction] = (bySatisfaction[satisfaction] || 0) + 1;
        });

        // Return object containing all the counts
        return { byPriority, byType, byStatus, bySatisfaction };
    }, [data]);  // Only recalculate when data changes

    // Helper function: returns Tailwind CSS classes for priority badge colors
    // Different colors help visually distinguish priority levels
    const getPriorityColor = (priority: string) => {
        const p = priority.toLowerCase();  // Normalize to lowercase
        
        // Return Tailwind classes based on priority
        // bg-*: background color, text-*: text color, border-*: border color
        if (p === 'high') return 'bg-red-100 text-red-800 border-red-300';      // Red for high priority
        if (p === 'normal') return 'bg-yellow-100 text-yellow-800 border-yellow-300';  // Yellow for normal
        if (p === 'low') return 'bg-green-100 text-green-800 border-green-300';  // Green for low
        return 'bg-gray-100 text-gray-800 border-gray-300';  // Gray for unknown
    };

    // Helper function: returns Tailwind CSS classes for status badge colors
    // Different colors help visually distinguish status types
    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();  // Normalize to lowercase
        
        // Return Tailwind classes based on status
        if (s === 'open') return 'bg-blue-100 text-blue-800';           // Blue for open
        if (s === 'closed') return 'bg-gray-100 text-gray-800';         // Gray for closed
        if (s === 'pending') return 'bg-orange-100 text-orange-800';    // Orange for pending
        if (s === 'hold') return 'bg-yellow-100 text-yellow-800';       // Yellow for hold
        if (s === 'solved') return 'bg-green-100 text-green-800';       // Green for solved
        if (s === 'new') return 'bg-purple-100 text-purple-800';        // Purple for new
        return 'bg-gray-100 text-gray-800';  // Gray for unknown statuses
    };

    if (loading) {
        return <div className="p-4">Loading issues...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    if (!data) {
        return <div className="p-4">No data available</div>;
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Service Desk</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={`px-4 py-2 rounded ${viewMode === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Dashboard
                    </button>
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="space-y-4">
                    {/* Filters and Search */}
                    <div className="bg-white border rounded-lg p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search by organization_id */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search by Organization ID
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Enter organization name..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Filter checkbox */}
                            <div className="flex items-end">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filterOpenHighPriority}
                                        onChange={(e) => setFilterOpenHighPriority(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Show only Open + High Priority
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            Showing {filteredAndSortedIssues.length} of {data.results.length} issues
                        </div>
                    </div>

                    {/* Issues List */}
                    <div className="space-y-2">
                        {filteredAndSortedIssues.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No issues found matching your filters.
                            </div>
                        ) : (
                            filteredAndSortedIssues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(issue.priority)}`}>
                                                    {issue.priority.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(issue.status)}`}>
                                                    {issue.status.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    #{issue.id}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-1">{issue.subject}</h3>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div>
                                                    <span className="font-medium">Type:</span> {issue.type}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Organization:</span> {issue.organization_id}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Assignee:</span> {issue.assignee_id}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Created: {new Date(issue.created).toLocaleDateString()}
                                                    {(issue.status.toLowerCase() === 'closed' || issue.status.toLowerCase() === 'solved') && (
                                                        <span className="ml-2">
                                                            | Resolved: {new Date(issue.updated).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                {issue.satisfaction_rating?.score && (
                                                    <div>
                                                        <span className="font-medium">Satisfaction:</span>{' '}
                                                        <span className="capitalize">{issue.satisfaction_rating.score}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {viewMode === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Tickets by Priority */}
                        <div className="bg-white border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3">By Priority</h3>
                            <div className="space-y-2">
                                {Object.entries(dashboardStats.byPriority)
                                    .sort(([a], [b]) => priorityOrder[a] - priorityOrder[b])
                                    .map(([priority, count]) => (
                                        <div key={priority} className="flex justify-between items-center">
                                            <span className="capitalize font-medium">{priority}</span>
                                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getPriorityColor(priority)}`}>
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Tickets by Type */}
                        <div className="bg-white border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3">By Type</h3>
                            <div className="space-y-2">
                                {Object.entries(dashboardStats.byType)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span className="capitalize font-medium">{type}</span>
                                            <span className="px-2 py-1 rounded text-sm font-semibold bg-blue-100 text-blue-800">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Tickets by Status */}
                        <div className="bg-white border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3">By Status</h3>
                            <div className="space-y-2">
                                {Object.entries(dashboardStats.byStatus)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([status, count]) => (
                                        <div key={status} className="flex justify-between items-center">
                                            <span className="capitalize font-medium">{status}</span>
                                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(status)}`}>
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Tickets by Satisfaction Rating */}
                        <div className="bg-white border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3">By Satisfaction</h3>
                            <div className="space-y-2">
                                {Object.entries(dashboardStats.bySatisfaction)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([satisfaction, count]) => (
                                        <div key={satisfaction} className="flex justify-between items-center">
                                            <span className="capitalize font-medium">{satisfaction}</span>
                                            <span className="px-2 py-1 rounded text-sm font-semibold bg-purple-100 text-purple-800">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3">Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Total Tickets</div>
                                <div className="text-2xl font-bold">{data.results.length}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Open Tickets</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {dashboardStats.byStatus['open'] || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">High Priority</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {dashboardStats.byPriority['high'] || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Closed Tickets</div>
                                <div className="text-2xl font-bold text-gray-600">
                                    {dashboardStats.byStatus['closed'] || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ServiceDesk;

