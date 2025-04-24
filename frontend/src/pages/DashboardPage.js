import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, isAuthenticated, isManager, isAgent } = useContext(AuthContext);
  const [savedListings, setSavedListings] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingDocs, setDownloadingDocs] = useState(false);
  const { toast } = useToast();

  const [documents, setDocuments] = useState([
    {
      id: 'purchase-agreement',
      name: 'Real Estate Purchase Agreement',
      description: 'Standard contract for property transactions',
      filename: 'Real-Estate-Purchase-Agreement.pdf',
      selected: true
    },
    {
      id: 'closing-costs',
      name: 'Closing Costs Statement',
      description: 'Estimated closing costs for buyers',
      filename: 'closing-costs-statement.pdf',
      selected: true
    },
    {
      id: 'repair-request',
      name: 'Repair Request Proposal',
      description: 'Form for requesting property repairs',
      filename: 'repair-request-proposal-fullsail-real-estate.pdf',
      selected: true
    }
  ]);

  useEffect(() => {
    // Fetch user-specific data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // For demo purposes we'll use sample data
        // In a real app, you'd fetch from the API
        
        // Sample listings data
        const sampleListings = [
          {
            id: 1,
            address: '123 Main Street, Anytown, AL',
            price: '$349,000',
            status: 'active'
          },
          {
            id: 2,
            address: '456 Oak Avenue, Somewhere, AL',
            price: '$425,000',
            status: 'active'
          }
        ];
        
        // Sample activity data
        const sampleActivity = [
          {
            id: 1,
            description: 'You viewed a listing at 123 Main Street',
            timestamp: '2023-07-15T14:30:00Z'
          },
          {
            id: 2,
            description: 'You downloaded Real Estate Purchase Agreement',
            timestamp: '2023-07-14T10:15:00Z'
          },
          {
            id: 3,
            description: 'You saved a listing at 456 Oak Avenue',
            timestamp: '2023-07-10T09:45:00Z'
          }
        ];
        
        setSavedListings(sampleListings);
        setUserActivity(sampleActivity);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const toggleDocumentSelection = (id) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, selected: !doc.selected } : doc
      )
    );
  };

  const downloadSelectedDocuments = async () => {
    const selectedDocs = documents.filter(doc => doc.selected);
    
    if (selectedDocs.length === 0) {
      toast({
        variant: "destructive",
        title: "No documents selected",
        description: "Please select at least one document to download."
      });
      return;
    }
    
    setDownloadingDocs(true);
    
    try {
      // Download each selected document
      for (const doc of selectedDocs) {
        const response = await fetch(`/api/documents/${doc.filename}`);
        
        if (!response.ok) {
          throw new Error(`Failed to download ${doc.name}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      // Show success toast
      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}.`
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading your documents. Please try again."
      });
    } finally {
      setDownloadingDocs(false);
    }
  };

  if (!isAuthenticated) {
    return React.createElement(
      'div', 
      { className: "container mt-5 text-center" },
      React.createElement(
        'div', 
        { className: "alert alert-warning" },
        "You must be logged in to view your dashboard."
      ),
      React.createElement(
        Link, 
        { href: "/login" },
        React.createElement(Button, null, "Log In")
      )
    );
  }

  // Create the document items
  const documentItems = documents.map(doc => 
    React.createElement(
      'div', 
      { 
        key: doc.id,
        className: `flex items-center p-3 border rounded-md cursor-pointer ${
          doc.selected ? 'border-primary bg-primary/5' : ''
        }`,
        onClick: () => toggleDocumentSelection(doc.id)
      },
      React.createElement(
        'div', 
        { className: "mr-3 text-red-500" },
        React.createElement(FileText, { size: 32 })
      ),
      React.createElement(
        'div', 
        { className: "flex-1" },
        React.createElement('h6', { className: "font-medium" }, doc.name),
        React.createElement('small', { className: "text-gray-500" }, doc.description)
      ),
      React.createElement(
        'div', 
        null,
        React.createElement('input', {
          type: "checkbox",
          checked: doc.selected,
          onChange: () => toggleDocumentSelection(doc.id),
          onClick: (e) => e.stopPropagation(),
          className: "h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
        })
      )
    )
  );

  // Create download button content
  const downloadButtonContent = downloadingDocs 
    ? React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'svg', 
          { 
            className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", 
            xmlns: "http://www.w3.org/2000/svg", 
            fill: "none", 
            viewBox: "0 0 24 24"
          },
          React.createElement(
            'circle', 
            { 
              className: "opacity-25", 
              cx: "12", 
              cy: "12", 
              r: "10", 
              stroke: "currentColor", 
              strokeWidth: "4"
            }
          ),
          React.createElement(
            'path', 
            { 
              className: "opacity-75", 
              fill: "currentColor", 
              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            }
          )
        ),
        "Downloading..."
      )
    : React.createElement(
        React.Fragment,
        null,
        React.createElement(Download, { className: "mr-2 h-4 w-4" }),
        "Download Selected Documents"
      );

  // Main dashboard content
  return React.createElement(
    'div', 
    { className: "container mx-auto px-4 py-8" },
    error && React.createElement(
      'div', 
      { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4", role: "alert" },
      React.createElement('span', { className: "block sm:inline" }, error)
    ),
    
    React.createElement(
      'div',
      { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
      
      // First column (left sidebar)
      React.createElement(
        'div',
        { className: "md:col-span-1" },
        // User profile card
        React.createElement(
          Card,
          { className: "mb-6" },
          React.createElement(
            CardContent,
            { className: "pt-6 text-center" },
            React.createElement('h2', { className: "text-sm font-medium text-gray-500" }, "Welcome back,"),
            React.createElement('h1', { className: "text-xl font-bold mb-2" }, 
              `${user?.firstName || ''} ${user?.lastName || ''}`
            ),
            React.createElement('p', { className: "text-gray-500 text-sm" }, user?.email),
            React.createElement(
              'div',
              { className: "my-2" },
              React.createElement(
                Badge,
                { 
                  variant: user?.role === 'manager' ? 'destructive' : 'default',
                  className: "mr-2"
                },
                user?.role === 'manager' ? 'Manager' : user?.role === 'agent' ? 'Agent' : 'User'
              )
            ),
            React.createElement(Button, { variant: "outline", className: "mt-4" }, "Edit Profile")
          )
        ),
        
        // Quick links card
        React.createElement(
          Card, 
          { className: "mb-6" }, 
          React.createElement(
            CardHeader,
            null,
            React.createElement('h3', { className: "text-lg font-medium" }, "Quick Links")
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              'div',
              { className: "flex flex-col space-y-2" },
              // Agent links - only if agent but not manager
              isAgent() && !isManager() && React.createElement(
                Link,
                { href: "/listings/new", className: "flex items-center text-sm p-2 rounded hover:bg-gray-100" },
                React.createElement(PlusCircle, { className: "mr-2 h-4 w-4" }),
                "Create New Listing"
              ),
              // Manager links
              isManager() && React.createElement(
                Link,
                { href: "/admin/users", className: "flex items-center text-sm p-2 rounded hover:bg-gray-100" },
                React.createElement('i', { className: "bi bi-people mr-2" }),
                "User Management"
              ),
              isManager() && React.createElement(
                Link,
                { href: "/reports?type=open", className: "flex items-center text-sm p-2 rounded hover:bg-gray-100" },
                React.createElement('i', { className: "bi bi-file-earmark-text mr-2" }),
                "Open Listings Report"
              ),
              isManager() && React.createElement(
                Link,
                { href: "/reports?type=closed", className: "flex items-center text-sm p-2 rounded hover:bg-gray-100" },
                React.createElement('i', { className: "bi bi-file-earmark-text mr-2" }),
                "Closed Listings Report"
              ),
              // Settings link for all users
              React.createElement(
                Link,
                { href: "/settings", className: "flex items-center text-sm p-2 rounded hover:bg-gray-100" },
                React.createElement(Settings, { className: "mr-2 h-4 w-4" }),
                "Account Settings"
              )
            )
          )
        ),
        
        // Agent Stats Card - Only show for agents
        isAgent() && React.createElement(
          Card,
          { className: "mb-6" },
          React.createElement(
            CardHeader,
            null,
            React.createElement('h3', { className: "text-lg font-medium" }, "Agent Stats")
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              'div',
              { className: "grid grid-cols-2 gap-4 text-center" },
              React.createElement(
                'div',
                null,
                React.createElement(
                  'h3',
                  { className: "text-2xl font-bold" },
                  loading ? React.createElement(
                    'div',
                    { className: "animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-primary rounded-full" },
                    React.createElement('span', { className: "sr-only" }, "Loading...")
                  ) : savedListings.filter(l => l.status === 'active').length
                ),
                React.createElement('p', { className: "text-gray-500 text-sm" }, "Active Listings")
              ),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'h3',
                  { className: "text-2xl font-bold" },
                  loading ? React.createElement(
                    'div',
                    { className: "animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-primary rounded-full" },
                    React.createElement('span', { className: "sr-only" }, "Loading...")
                  ) : savedListings.filter(l => l.status !== 'active').length
                ),
                React.createElement('p', { className: "text-gray-500 text-sm" }, "Closed Deals")
              )
            )
          )
        )
      ),
      
      // Second column (main content)
      React.createElement(
        'div',
        { className: "md:col-span-2" },
        // Documents card
        React.createElement(
          Card,
          { className: "mb-6 transition-all hover:shadow-md" },
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between" },
            React.createElement('h3', { className: "text-lg font-medium" }, "Documents"),
            React.createElement(Badge, null, "Important Files")
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              'p',
              { className: "text-sm text-gray-500 mb-4" },
              "Download standard real estate documents for your transactions."
            ),
            React.createElement('div', { className: "space-y-2 mb-4" }, documentItems),
            React.createElement(
              Button,
              {
                className: "w-full",
                onClick: downloadSelectedDocuments,
                disabled: downloadingDocs || documents.filter(d => d.selected).length === 0
              },
              downloadButtonContent
            )
          )
        ),

        // Saved Listings card
        React.createElement(
          Card,
          { className: "mb-6" },
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between" },
            React.createElement('h3', { className: "text-lg font-medium" }, "Saved Listings"),
            React.createElement(
              Link,
              { href: "/listings", className: "text-sm text-primary hover:underline" },
              "View All Listings"
            )
          ),
          React.createElement(
            CardContent,
            null,
            loading ? React.createElement(
              'div',
              { className: "flex justify-center py-3" },
              React.createElement(
                'div',
                { className: "animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" },
                React.createElement('span', { className: "sr-only" }, "Loading...")
              )
            ) : savedListings.length > 0 ? React.createElement(
              'div',
              { className: "space-y-2" },
              savedListings.map(listing => React.createElement(
                Link,
                {
                  key: listing.id,
                  href: `/listings/${listing.id}`,
                  className: "flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                },
                React.createElement(
                  'div',
                  null,
                  React.createElement('h6', { className: "font-medium" }, listing.address),
                  React.createElement('p', { className: "text-sm text-gray-500" }, `Price: ${listing.price}`)
                ),
                React.createElement(Badge, { variant: "outline" }, "View")
              ))
            ) : React.createElement(
              'p',
              { className: "text-center py-3 text-gray-500" },
              "You haven't saved any listings yet."
            )
          ),
          savedListings.length > 0 && React.createElement(
            CardFooter,
            { className: "border-t bg-gray-50/50 flex justify-center" },
            React.createElement(
              Link,
              { href: "/saved-listings", className: "text-sm text-primary hover:underline" },
              "View All Saved Listings"
            )
          )
        ),

        // Recent Activity card
        React.createElement(
          Card,
          { className: "mb-6" },
          React.createElement(
            CardHeader,
            null,
            React.createElement('h3', { className: "text-lg font-medium" }, "Recent Activity")
          ),
          React.createElement(
            CardContent,
            null,
            loading ? React.createElement(
              'div',
              { className: "flex justify-center py-3" },
              React.createElement(
                'div',
                { className: "animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" },
                React.createElement('span', { className: "sr-only" }, "Loading...")
              )
            ) : userActivity.length > 0 ? React.createElement(
              'div',
              { className: "divide-y" },
              userActivity.map((activity, index) => React.createElement(
                'div',
                { key: index, className: "py-3" },
                React.createElement(
                  'div',
                  { className: "flex" },
                  React.createElement(
                    'div',
                    { className: "text-gray-500 mr-3 text-sm", style: { minWidth: "100px" } },
                    new Date(activity.timestamp).toLocaleDateString()
                  ),
                  React.createElement(
                    'div',
                    null,
                    React.createElement('p', { className: "text-sm" }, activity.description)
                  )
                )
              ))
            ) : React.createElement(
              'p',
              { className: "text-center py-3 text-gray-500" },
              "No recent activity found."
            )
          )
        ),

        // Management Tools for managers
        isManager() && React.createElement(
          Card,
          { className: "mb-6" },
          React.createElement(
            CardHeader,
            null,
            React.createElement('h3', { className: "text-lg font-medium" }, "Management Tools")
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              'div',
              { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
              React.createElement(
                Link,
                { href: "/reports", className: "p-3 border rounded-md text-center hover:bg-gray-50" },
                React.createElement('i', { className: "bi bi-file-earmark-bar-graph text-xl block mb-2" }),
                React.createElement('span', null, "Report Center")
              ),
              React.createElement(
                Link,
                { href: "/admin/users", className: "p-3 border rounded-md text-center hover:bg-gray-50" },
                React.createElement('i', { className: "bi bi-people text-xl block mb-2" }),
                React.createElement('span', null, "User Management")
              )
            )
          )
        )
      )
    )
  );
};

export default DashboardPage;