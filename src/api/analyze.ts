// Backend API endpoint that analyzes 500 issues
// (automatically created by vite-plugin-api-routes) more detailed description below
//The plugin scans the src/api/ folder and automatically creates these routes when the dev server starts.
// 1. Fetches 500 data points from external API
// 2. Calculates status breakdown (open/closed/pending percentages)
// 3. Calculates priority breakdown (high/normal/low percentages)
// 4. Calculates resolution timeliness (on-time vs overdue)
// 5. Calculates average time to close high priority issues
// 6. Finds the longest-to-solve high priority issue and its satisfaction rating
// 7. Provides additional insights (issues by type, satisfaction by priority)
// Returns JSON object with all calculated statistics

// Import necessary libraries and types
import axios from 'axios';// axios: HTTP client for making API requests
import { Request, Response } from 'express';// Request, Response: Express types for handling HTTP requests/responses
import { SampleData } from './types';// SampleData: TypeScript interface defining the structure of API response data

// API endpoint URL: fetches 500 data points from the service desk API
// This is the base URL with the datapoints query parameter set to 500
const DATA_URL = 'https://sampleapi.squaredup.com/integrations/v1/service-desk?datapoints=500';

// TypeScript interface defining the structure of the analysis result
// This ensures type safety and documents what data will be returned
// This data is Service Desk Tickets/Issues from the external API
interface AnalysisResult {
    // Status breakdown: counts and percentages for all status types
    statusBreakdown: {
        open: number;              // Count of open issues
        closed: number;             // Count of closed issues
        pending: number;            // Count of pending issues
        hold: number;               // Count of hold issues
        solved: number;             // Count of solved issues
        new: number;                // Count of new issues
        openPercent: number;         // Percentage of open issues
        closedPercent: number;      // Percentage of closed issues
        pendingPercent: number;     // Percentage of pending issues
        holdPercent: number;        // Percentage of hold issues
        solvedPercent: number;      // Percentage of solved issues
        newPercent: number;         // Percentage of new issues
        allStatuses?: Record<string, number>;  // All statuses with counts 
    };
    // Priority breakdown: counts and percentages for high, normal, and low priority issues
    priorityBreakdown: {
        high: number;               // Count of high priority issues
        normal: number;             // Count of normal priority issues
        low: number;                // Count of low priority issues
        highPercent: number;        // Percentage of high priority issues
        normalPercent: number;      // Percentage of normal priority issues
        lowPercent: number;         // Percentage of low priority issues
    };
    // Resolution timeliness: tracks whether issues were resolved on-time or overdue, and currently overdue issues
    resolutionTimeliness: {
        onTime: number;             // Count of issues resolved on or before due date
        overdue: number;            // Count of issues resolved after due date
        currentlyOverdue: number;   // Count of unresolved issues that are past their due date
        onTimePercent: number;      // Percentage of on-time resolutions (of resolved issues)
        overduePercent: number;    // Percentage of overdue resolutions (of resolved issues)
        currentlyOverduePercent: number;  // Percentage of currently overdue issues (of all issues)
    };
    // Analysis specific to high priority issues
    highPriorityAnalysis: {
        averageTimeToCloseHours: number;    // Average time to close high priority issues (hours)
        averageTimeToCloseDays: number;    // Average time to close high priority issues (days)
        totalClosedHighPriority: number;    // Total count of closed high priority issues
    };
    // Information about the high priority issue that took longest to solve
    longestToSolveHighPriority: {
        issueId: number;                    // ID of the issue that took longest
        timeToSolveHours: number;           // Time taken to solve in hours
        timeToSolveDays: number;            // Time taken to solve in days
        satisfactionRatingScore: string;    // Satisfaction rating score for that issue
    };
    // Additional insights and statistics
    additionalInsights: {
        totalIssues: number;                                    // Total number of issues
        issuesByType: Record<string, number>;                   // Count of issues grouped by type (problem, question, task, etc.)
        averageSatisfactionByPriority: Record<string, string>;  // Most common satisfaction rating per priority level
        issuesClosedCount: number;                             // Total count of closed issues
        issuesOpenCount: number;                               // Total count of open issues
    };
}

// Export the GET handler function - this is called when a GET request is made to /api/analyze
// The vite-plugin-api-routes automatically creates this route based on the file name
export const GET = async (req: Request, res: Response) => {
    try {
        // Fetch 500 data points from the external API
        // await: waits for the HTTP request to complete before continuing
        // axios.get: makes a GET request to the specified URL
        // <SampleData>: TypeScript generic ensures the response matches our expected type
        const { data } = await axios.get<SampleData>(DATA_URL);
        
        // Extract the results array from the API response
        // The API returns { results: [...] }, so we get just the array of issues
        const issues = data.results;

        // Validate that we received data
        // If no issues or empty array, return an error response
        if (!issues || issues.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        
        // 1. CALCULATE STATUS BREAKDOWN
        // Count how many issues are in each status (open, closed, pending, hold, solved, new)
        
        // Initialize counters for each status type
        // Start with 0 for all known status types
        const statusCounts = {
            open: 0,      // Counter for open issues
            closed: 0,    // Counter for closed issues
            pending: 0,   // Counter for pending issues
            hold: 0,      // Counter for hold issues
            solved: 0,    // Counter for solved issues
            new: 0,       // Counter for new issues
        };

        // Loop through each issue and increment the appropriate counter
        // forEach: iterates through each item in the array
        issues.forEach(issue => {
            // Convert status to lowercase for case-insensitive comparison
            // This handles cases where status might be "Open", "OPEN", "open", etc.
            const status = issue.status.toLowerCase();
            
            // Check the status and increment the corresponding counter
            if (status === 'open') statusCounts.open++;
            else if (status === 'closed') statusCounts.closed++;
            else if (status === 'pending') statusCounts.pending++;
            else if (status === 'hold') statusCounts.hold++;
            else if (status === 'solved') statusCounts.solved++;
            else if (status === 'new') statusCounts.new++;
        });

        // Calculate total number of issues for percentage calculations
        const totalIssues = issues.length;
        
        // Create the status breakdown object with counts and percentages
        const statusBreakdown = {
            open: statusCounts.open,                    // Raw count of open issues
            closed: statusCounts.closed,               // Raw count of closed issues
            pending: statusCounts.pending,              // Raw count of pending issues
            hold: statusCounts.hold,                    // Raw count of hold issues
            solved: statusCounts.solved,                // Raw count of solved issues
            new: statusCounts.new,                     // Raw count of new issues
            // Calculate percentages for each status type (count / total) * 100
            openPercent: (statusCounts.open / totalIssues) * 100,
            closedPercent: (statusCounts.closed / totalIssues) * 100,
            pendingPercent: (statusCounts.pending / totalIssues) * 100,
            holdPercent: (statusCounts.hold / totalIssues) * 100,
            solvedPercent: (statusCounts.solved / totalIssues) * 100,
            newPercent: (statusCounts.new / totalIssues) * 100,
        };

        
        // 2. CALCULATE PRIORITY BREAKDOWN
        // Count how many issues are in each priority level (high, normal, low)
        
        // Initialize counters for each priority level
        const priorityCounts = {
            high: 0,     // Counter for high priority issues
            normal: 0,   // Counter for normal priority issues
            low: 0,      // Counter for low priority issues
        };

        // Loop through each issue and count by priority
        issues.forEach(issue => {
            // Convert priority to lowercase for case-insensitive comparison
            const priority = issue.priority.toLowerCase();
            
            // Increment the appropriate priority counter
            if (priority === 'high') priorityCounts.high++;
            else if (priority === 'normal') priorityCounts.normal++;
            else if (priority === 'low') priorityCounts.low++;
        });

        // Create the priority breakdown object with counts and percentages
        const priorityBreakdown = {
            high: priorityCounts.high,                          // Raw count of high priority issues
            normal: priorityCounts.normal,                      // Raw count of normal priority issues
            low: priorityCounts.low,                           // Raw count of low priority issues
            // Calculate percentages for each priority level
            highPercent: (priorityCounts.high / totalIssues) * 100,
            normalPercent: (priorityCounts.normal / totalIssues) * 100,
            lowPercent: (priorityCounts.low / totalIssues) * 100,
        };

        
        // 3. CALCULATE RESOLUTION TIMELINESS
        // Determine if resolved issues were on-time or overdue
        // Also check if unresolved issues are currently overdue (past their due date)
        
        // Initialize counters
        let onTime = 0;           // Count of issues resolved on or before due date
        let overdue = 0;          // Count of issues resolved after due date
        let currentlyOverdue = 0; // Count of unresolved issues that are past their due date

        // Get current date for comparing with due dates of unresolved issues
        const now = new Date();

        // Loop through all issues
        issues.forEach(issue => {
            const status = issue.status.toLowerCase();
            const dueDate = new Date(issue.due);
            
            // Check resolved issues (closed or solved)
            if (status === 'closed' || status === 'solved') {
                // Convert date strings to Date objects for comparison
                // issue.updated: when the issue was closed/updated
                // issue.due: when the issue was due to be resolved
                const updatedDate = new Date(issue.updated);
                
                // Compare dates: if closed on or before due date, it's on-time
                if (updatedDate <= dueDate) {
                    onTime++;      // Increment on-time counter
                } else {
                    overdue++;    // Increment overdue counter
                }
            } 
            // Check unresolved issues (open, pending, hold, new) - are they currently overdue?
            else if (status === 'open' || status === 'pending' || status === 'hold' || status === 'new') {
                // If the due date has passed and issue is still unresolved, it's currently overdue
                if (now > dueDate) {
                    currentlyOverdue++;  // Increment currently overdue counter
                }
            }
        });

        // Calculate total number of resolved issues
        const totalResolved = onTime + overdue;
        
        // Create the resolution timeliness object with counts and percentages
        const resolutionTimeliness = {
            onTime,    // Count of on-time resolutions
            overdue,   // Count of overdue resolutions
            currentlyOverdue,  // Count of unresolved issues that are currently overdue
            // Calculate percentages, but handle division by zero if no resolved issues
            // If totalResolved is 0, return 0% instead of NaN
            onTimePercent: totalResolved > 0 ? (onTime / totalResolved) * 100 : 0,
            overduePercent: totalResolved > 0 ? (overdue / totalResolved) * 100 : 0,
            // Percentage of all issues that are currently overdue
            currentlyOverduePercent: totalIssues > 0 ? (currentlyOverdue / totalIssues) * 100 : 0,
        };

        
        // 4. CALCULATE AVERAGE TIME TO CLOSE HIGH PRIORITY ISSUES
        // Find all high priority issues that are closed and calculate average resolution time
        
        // Filter issues to get only high priority resolved issues (closed or solved)
        // filter: creates a new array with only items that match the condition
        const highPriorityClosed = issues.filter(
            // Check both conditions: priority is high AND status is closed or solved
            issue => {
                const priority = issue.priority.toLowerCase();
                const status = issue.status.toLowerCase();
                return priority === 'high' && (status === 'closed' || status === 'solved');
            }
        );

        // Initialize variable to accumulate total time to close (in milliseconds)
        let totalTimeToClose = 0;
        
        // Create an empty array to store each issue with its time to close
        // We'll fill this array with objects like: { issue: {...}, timeMs: 14400000 }
        // This lets us find which issue took the longest to solve later
        const timeToCloseArray: { issue: SampleData['results'][0]; timeMs: number }[] = [];

        // Loop through each high priority closed issue
        highPriorityClosed.forEach(issue => {
            // Convert date strings to Date objects
            const createdDate = new Date(issue.created);  // When issue was created
            const updatedDate = new Date(issue.updated);  // When issue was closed
            
            // Calculate time difference in milliseconds
            // getTime(): converts Date to milliseconds since epoch
            const timeDiffMs = updatedDate.getTime() - createdDate.getTime();
            
            // Add to total time accumulator
            totalTimeToClose += timeDiffMs;
            
            // Store this issue and its time in the array for later analysis
            timeToCloseArray.push({ issue, timeMs: timeDiffMs });
        });

        // Calculate average time to close
        // If there are no closed high priority issues, average is 0
        const averageTimeToCloseMs = highPriorityClosed.length > 0 
            ? totalTimeToClose / highPriorityClosed.length  // Average in milliseconds
            : 0;
        
        // Convert milliseconds to hours: divide by (1000 ms * 60 sec * 60 min)
        const averageTimeToCloseHours = averageTimeToCloseMs / (1000 * 60 * 60);
        
        // Convert hours to days: divide by 24
        const averageTimeToCloseDays = averageTimeToCloseHours / 24;

        // Create the high priority analysis object
        //We already calculated the average above, now we're just rounding it for clean display
        const highPriorityAnalysis = {
            // Round to 2 decimal places for example 2.020833... becomes 2.02
            averageTimeToCloseHours: Math.round(averageTimeToCloseHours * 100) / 100,
            averageTimeToCloseDays: Math.round(averageTimeToCloseDays * 100) / 100,
            totalClosedHighPriority: highPriorityClosed.length,  // Count of closed high priority issues
        };

        
        // 5. FIND LONGEST TO SOLVE HIGH PRIORITY ISSUE
        // Find the high priority issue that took the longest to solve
        // and get its satisfaction rating score
        
        // Create a shorter name for the issue type
        // SampleData['results'] = array type, [0] = element type (one issue object)
        // Instead of writing SampleData['results'][0] everywhere, we can just use IssueType
        type IssueType = SampleData['results'][0];
        
        // Use reduce to find the entry with the maximum timeMs value
        // reduce: iterates through array and accumulates a single value
        // <{ issue: IssueType; timeMs: number } | null>: return type can be object or null
        const longestEntry = timeToCloseArray.reduce<{ issue: IssueType; timeMs: number } | null>(
            // Reducer function: compares current item with longest found so far
            (longest, current) => {
                // If no longest found yet, or current takes longer, return current
                if (!longest || current.timeMs > longest.timeMs) {
                    return current;
                }
                // Otherwise, keep the longest found so far
                return longest;
            },
            null  // Initial value: start with null (no longest found yet)
        );

        // Declare variable to store the result
        let longestToSolveHighPriority: {
            issueId: number;
            timeToSolveHours: number;
            timeToSolveDays: number;
            satisfactionRatingScore: string;
        };

        // If we found a longest entry, extract its information
        if (longestEntry) {
            longestToSolveHighPriority = {
                issueId: longestEntry.issue.id,  // ID of the issue
                // Convert milliseconds to hours and round to 2 decimals
                timeToSolveHours: Math.round((longestEntry.timeMs / (1000 * 60 * 60)) * 100) / 100,
                // Convert milliseconds to days and round to 2 decimals
                timeToSolveDays: Math.round((longestEntry.timeMs / (1000 * 60 * 60 * 24)) * 100) / 100,
                // Get satisfaction rating score, or 'N/A' if not available
                // ?.: optional chaining - safely accesses nested property
                satisfactionRatingScore: longestEntry.issue.satisfaction_rating?.score || 'N/A',
            };
        } else {
            // If no high priority closed issues found, return default values
            longestToSolveHighPriority = {
                issueId: 0,
                timeToSolveHours: 0,
                timeToSolveDays: 0,
                satisfactionRatingScore: 'N/A',
            };
        }

        // 6. ADDITIONAL INSIGHTS
        // Calculate extra statistics that provide more context
        
        // Count issues by type such as problem, question, task
        // Record<string, number>: TypeScript type for object with string keys and number values
        const issuesByType: Record<string, number> = {};
        
        // Loop through issues and count by type
        issues.forEach(issue => {
            const type = issue.type.toLowerCase();  // Normalize to lowercase
            // Increment count for this type, or initialize to 1 if first occurrence
            // || 0: if issuesByType[type] is undefined, use 0
            issuesByType[type] = (issuesByType[type] || 0) + 1;
        });

        // Calculate most common satisfaction rating by priority
        // First, collect all satisfaction scores grouped by priority
        const satisfactionByPriority: Record<string, { scores: string[] }> = {};
        
        // Loop through issues and collect satisfaction scores by priority
        issues.forEach(issue => {
            const priority = issue.priority.toLowerCase();
            
            // Initialize array for this priority if it doesn't exist
            if (!satisfactionByPriority[priority]) {
                satisfactionByPriority[priority] = { scores: [] };
            }
            
            // If issue has a satisfaction rating, add it to the array
            if (issue.satisfaction_rating?.score) {
                satisfactionByPriority[priority].scores.push(issue.satisfaction_rating.score);
            }
        });

        // Find the most common satisfaction score for each priority
        const averageSatisfactionByPriority: Record<string, string> = {};
        
        // Loop through each priority level
        // Object.keys: returns an array of the object's own enumerable property names
        //Give me all the property names from this object as an array, so I can loop through them.
        Object.keys(satisfactionByPriority).forEach(priority => {
            const scores = satisfactionByPriority[priority].scores;
            
            // Only calculate if there are scores available
            if (scores.length > 0) {
                // Count occurrences of each score
                const scoreCounts: Record<string, number> = {};
                scores.forEach(score => {
                    // Increment count for this score, or initialize to 1
                    scoreCounts[score] = (scoreCounts[score] || 0) + 1;
                });
                
                // Find the score with the highest count (most common)
                // reduce: compares each score count and returns the one with highest count
                const mostCommon = Object.keys(scoreCounts).reduce((a, b) => 
                    scoreCounts[a] > scoreCounts[b] ? a : b
                );
                
                // Store the most common score for this priority
                averageSatisfactionByPriority[priority] = mostCommon;
            }
        });

        // Create the additional insights object
        const additionalInsights = {
            totalIssues,                        // Total number of issues
            issuesByType,                      // Count of issues by type
            averageSatisfactionByPriority,      // Most common satisfaction rating per priority
            issuesClosedCount: statusCounts.closed,  // Total closed issues
            issuesOpenCount: statusCounts.open,      // Total open issues
        };

        // COMBINE ALL RESULTS
        // Create the final result object with all calculated metrics
        const result: AnalysisResult = {
            statusBreakdown,              // Status statistics
            priorityBreakdown,            // Priority statistics
            resolutionTimeliness,         // On-time vs overdue statistics
            highPriorityAnalysis,          // High priority specific analysis
            longestToSolveHighPriority,   // Longest to solve issue details
            additionalInsights,           // Additional statistics
        };

        // Send the result as JSON response
        // res.json() does 3 things:
        // Converts JavaScript object to JSON string
        // Sets HTTP header: Content-Type: application/json
        // Sends the response back to the client (frontend)
        // The frontend (Analysis.tsx) will receive this data via axios.get('/api/analyze')
        res.json(result);
        
    } catch (error) {      
        // 1. Log error to server console for debugging
        // This shows full error details in the terminal where server is running
        console.error('Error analyzing data:', error);
        
        //Send error response to frontend so users can see what went wrong
        // res.status(500) sets HTTP status code to 500, Internal Server Error
        // res.json() sends JSON response with error information
        res.status(500).json({ 
            error: 'Failed to analyze data',
            // Include error message if available, otherwise 'Unknown error'
            // instanceof Error checks if error is an Error object has .message property
            // If error is a string/null/undefined, use 'Unknown error' as fallback
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
