// Import necessary types and React hooks
// SampleData: TypeScript interface for API response (not used here but imported for reference)
// axios: HTTP client for making API requests
// useEffect: React hook for side effects (data fetching)
// useState: React hook for managing component state
import { SampleData } from "api/types";
import axios from 'axios';
import { useEffect, useState } from "react";

// TypeScript interface defining the structure of analysis results from the backend
// This matches the response structure from /api/analyze endpoint
interface AnalysisResult {
    statusBreakdown: {
        open: number;
        closed: number;
        pending: number;
        hold: number;
        solved: number;
        new: number;
        openPercent: number;
        closedPercent: number;
        pendingPercent: number;
        holdPercent: number;
        solvedPercent: number;
        newPercent: number;
        allStatuses?: Record<string, number>;
    };
    priorityBreakdown: {
        high: number;
        normal: number;
        low: number;
        highPercent: number;
        normalPercent: number;
        lowPercent: number;
    };
    resolutionTimeliness: {
        onTime: number;
        overdue: number;
        currentlyOverdue: number;
        onTimePercent: number;
        overduePercent: number;
        currentlyOverduePercent: number;
    };
    highPriorityAnalysis: {
        averageTimeToCloseHours: number;
        averageTimeToCloseDays: number;
        totalClosedHighPriority: number;
    };
    longestToSolveHighPriority: {
        issueId: number;
        timeToSolveHours: number;
        timeToSolveDays: number;
        satisfactionRatingScore: string;
    };
    additionalInsights: {
        totalIssues: number;
        issuesByType: Record<string, number>;
        averageSatisfactionByPriority: Record<string, string>;
        issuesClosedCount: number;
        issuesOpenCount: number;
    };
}

// Analysis component: displays backend analysis results (500 data points)
function Analysis() {
    // React state hooks for managing component data and UI state
    
    //Three memory boxes that remember component state
    
    // data: Stores the analysis results from backend
    // Starts as undefined (empty), becomes AnalysisResult when data loads
    const [data, setData] = useState<AnalysisResult | undefined>(undefined);
    
    // loading:Tracks if we're still waiting for data
    // Starts as true (waiting), becomes false when done
    // Used to show/hide loading spinner
    const [loading, setLoading] = useState(true);
    
    // error: Stores error message if something goes wrong
    // Starts as null no error, becomes string with error message if error occurs
    // Used to display error messages to user
    const [error, setError] = useState<string | null>(null);

    // useEffect Fetches analysis data when component mounts
    useEffect(() => {
        // mounted flag prevents state updates if component unmounts during fetch
        let mounted = true;

        // Async function to fetch analysis data from backend API
        const fetchAnalysis = async () => {
            try {
                // Show loading indicator
                setLoading(true);
                
                // Make GET request to /api/analyze endpoint
                // This endpoint analyzes 500 data points and returns statistics
                const { data: analysisData } = await axios.get<AnalysisResult>('/api/analyze');
                
                // Only update state if component is still mounted
                if (mounted) {
                    setData(analysisData);  // Store the analysis results
                    setError(null);         // Clear any previous errors
                }
            } catch (err) {
                // catch handles errors if something goes wrong in the try block
                // err the error object that was thrown (contains error information)
                // If axios.get() fails (network error, API error, timeout, etc.), execution jumps here
                // Handle errors (network failure, API error, etc.)
                if (mounted) {
                    // Extract error message safely, or use default message
                    // err instanceof Error: checks if err is an Error object (has .message property)
                    // If yes: use err.message, if no: use default message (prevents crashes)
                    setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
                }
            } finally {
                // Always runs, whether success or error
                if (mounted) {// if componenent created and shown
                    setLoading(false);  // Hide loading indicator
                }
            }
        };

        // Call the fetch function
        fetchAnalysis();

        // Cleanup function runs automatically when component is removed from screen (unmounted)
        // This prevents memory leaks by stopping state updates after component is gone
        // How it works
        // 1. When component is removed, React calls this cleanup function
        // 2. Sets mounted = false which marks component as removed
        // 3. If data arrives later, the if (mounted) checks will be false
        // 4. setData() and setError() are skipped no errors or memory leaks
        // Without this if user navigates away and data arrives later,
        // setData() would try to update a component that doesn't exist gives an error!
        return () => { mounted = false; };
    }, []);  // Empty array means this runs only once when component mounts

    if (loading) {
        return <div className="p-4">Loading analysis...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600">
                <p className="font-semibold mb-2">Unable to load analysis</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!data) {
        return <div className="p-4">No data available</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Backend Analysis Results (500 Data Points)</h2>

            {/* Status Breakdown */}
            <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="text-xl font-semibold mb-3">Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                        <div className="text-sm text-gray-600">Open</div>
                        <div className="text-2xl font-bold">{data.statusBreakdown.open}</div>
                        <div className="text-sm text-gray-500">{data.statusBreakdown.openPercent.toFixed(2)}%</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Closed</div>
                        <div className="text-2xl font-bold">{data.statusBreakdown.closed}</div>
                        <div className="text-sm text-gray-500">{data.statusBreakdown.closedPercent.toFixed(2)}%</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Pending</div>
                        <div className="text-2xl font-bold">{data.statusBreakdown.pending}</div>
                        <div className="text-sm text-gray-500">{data.statusBreakdown.pendingPercent.toFixed(2)}%</div>
                    </div>
                    {data.statusBreakdown.hold > 0 && (
                        <div>
                            <div className="text-sm text-gray-600">Hold</div>
                            <div className="text-2xl font-bold">{data.statusBreakdown.hold}</div>
                            <div className="text-sm text-gray-500">{data.statusBreakdown.holdPercent.toFixed(2)}%</div>
                        </div>
                    )}
                    {data.statusBreakdown.solved > 0 && (
                        <div>
                            <div className="text-sm text-gray-600">Solved</div>
                            <div className="text-2xl font-bold">{data.statusBreakdown.solved}</div>
                            <div className="text-sm text-gray-500">{data.statusBreakdown.solvedPercent.toFixed(2)}%</div>
                        </div>
                    )}
                    {data.statusBreakdown.new > 0 && (
                        <div>
                            <div className="text-sm text-gray-600">New</div>
                            <div className="text-2xl font-bold">{data.statusBreakdown.new}</div>
                            <div className="text-sm text-gray-500">{data.statusBreakdown.newPercent.toFixed(2)}%</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Priority Breakdown */}
            <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="text-xl font-semibold mb-3">Priority Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <div className="text-sm text-gray-600">High</div>
                        <div className="text-2xl font-bold text-red-600">{data.priorityBreakdown.high}</div>
                        <div className="text-sm text-gray-500">{data.priorityBreakdown.highPercent.toFixed(2)}%</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Normal</div>
                        <div className="text-2xl font-bold text-yellow-600">{data.priorityBreakdown.normal}</div>
                        <div className="text-sm text-gray-500">{data.priorityBreakdown.normalPercent.toFixed(2)}%</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Low</div>
                        <div className="text-2xl font-bold text-green-600">{data.priorityBreakdown.low}</div>
                        <div className="text-sm text-gray-500">{data.priorityBreakdown.lowPercent.toFixed(2)}%</div>
                    </div>
                </div>
            </div>

            {/* Resolution Timeliness */}
            <div className="border rounded-lg p-4 bg-purple-50">
                <h3 className="text-xl font-semibold mb-3">Resolution Timeliness</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <div className="text-sm text-gray-600">Resolved On-Time</div>
                        <div className="text-2xl font-bold text-green-600">{data.resolutionTimeliness.onTime}</div>
                        <div className="text-sm text-gray-500">{data.resolutionTimeliness.onTimePercent.toFixed(2)}%</div>
                        <div className="text-xs text-gray-400 mt-1">of resolved issues</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Resolved Overdue</div>
                        <div className="text-2xl font-bold text-orange-600">{data.resolutionTimeliness.overdue}</div>
                        <div className="text-sm text-gray-500">{data.resolutionTimeliness.overduePercent.toFixed(2)}%</div>
                        <div className="text-xs text-gray-400 mt-1">of resolved issues</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Currently Overdue</div>
                        <div className="text-2xl font-bold text-red-600">{data.resolutionTimeliness.currentlyOverdue}</div>
                        <div className="text-sm text-gray-500">{data.resolutionTimeliness.currentlyOverduePercent.toFixed(2)}%</div>
                        <div className="text-xs text-gray-400 mt-1">unresolved & past due</div>
                    </div>
                </div>
            </div>

            {/* High Priority Analysis */}
            <div className="border rounded-lg p-4 bg-orange-50">
                <h3 className="text-xl font-semibold mb-3">High Priority Issues Analysis</h3>
                <div className="space-y-2">
                    <div>
                        <span className="text-sm text-gray-600">Total Closed High Priority Issues: </span>
                        <span className="font-semibold">{data.highPriorityAnalysis.totalClosedHighPriority}</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Average Time to Close: </span>
                        <span className="font-semibold">{data.highPriorityAnalysis.averageTimeToCloseHours.toFixed(2)} hours</span>
                        <span className="text-gray-500 ml-2">({data.highPriorityAnalysis.averageTimeToCloseDays.toFixed(2)} days)</span>
                    </div>
                </div>
            </div>

            {/* Longest to Solve */}
            <div className="border rounded-lg p-4 bg-red-50">
                <h3 className="text-xl font-semibold mb-3">Longest to Solve High Priority Issue</h3>
                <div className="space-y-2">
                    <div>
                        <span className="text-sm text-gray-600">Issue ID: </span>
                        <span className="font-semibold">{data.longestToSolveHighPriority.issueId}</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Time to Solve: </span>
                        <span className="font-semibold">{data.longestToSolveHighPriority.timeToSolveHours.toFixed(2)} hours</span>
                        <span className="text-gray-500 ml-2">({data.longestToSolveHighPriority.timeToSolveDays.toFixed(2)} days)</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Satisfaction Rating Score: </span>
                        <span className="font-semibold text-lg">{data.longestToSolveHighPriority.satisfactionRatingScore}</span>
                    </div>
                </div>
            </div>

            {/* Additional Insights */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-xl font-semibold mb-3">Additional Insights</h3>
                <div className="space-y-3">
                    <div>
                        <span className="text-sm text-gray-600">Total Issues: </span>
                        <span className="font-semibold">{data.additionalInsights.totalIssues}</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Issues by Type: </span>
                        <div className="mt-1 space-y-1">
                            {Object.entries(data.additionalInsights.issuesByType).map(([type, count]) => (
                                <div key={type} className="ml-4">
                                    <span className="capitalize">{type}: </span>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Most Common Satisfaction Rating by Priority: </span>
                        <div className="mt-1 space-y-1">
                            {Object.entries(data.additionalInsights.averageSatisfactionByPriority).map(([priority, score]) => (
                                <div key={priority} className="ml-4">
                                    <span className="capitalize">{priority}: </span>
                                    <span className="font-semibold capitalize">{score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Raw JSON View */}
            <details className="border rounded-lg p-4 bg-gray-100">
                <summary className="cursor-pointer font-semibold mb-2">View Raw JSON</summary>
                <pre className="text-xs overflow-auto mt-2 bg-white p-4 rounded border">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </details>
        </div>
    );
}

// export default makes the Analysis component available to other files
// Other files can import it like: import Analysis from "./Analysis"
// This is required so App.tsx can use this component
export default Analysis;

