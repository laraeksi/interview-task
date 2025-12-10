/**
 utils.tsx - Test Utilities
 Provides a wrapper component for testing React components that use React Query.

 Components like ServiceDesk and Analysis use React Query hooks (useQuery) to fetch data.
 These hooks need a QueryClientProvider to work. In tests, we wrap components with this
 wrapper so React Query works properly in the test environment.
 
 render(<Component />, { wrapper })  wraps component with QueryClientProvider
 */
import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient({});

export const wrapper = ({ children }: PropsWithChildren) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
