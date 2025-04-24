import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CloseListingModal from '@/components/CloseListingModal.jsx';

const ListingDetailPage = () => {
  const [, params] = useRoute('/listings/:id');
  const id = params?.id;
  const [showCloseModal, setShowCloseModal] = useState(false);
  const { user, isAgent } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const API_URL = '/api';

  // Fetch listing details
  const { 
    data: listing, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`${API_URL}/listings/${id}`],
    enabled: !!id // Only run query if id is available
  });

  // Mutation to update listing status
  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      return apiRequest('PUT', `${API_URL}/listings/${id}/status`, { status: newStatus });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/listings/${id}`] });
      toast({
        title: 'Status Updated',
        description: `Listing status has been changed to ${variables}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update listing status',
        variant: 'destructive',
      });
    }
  });

  // Toggle listing status
  const toggleListingStatus = async () => {
    if (!listing) return;
    
    // Determine new status (toggle between active and inactive)
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    statusMutation.mutate(newStatus);
  };
  
  // Handle successful listing closure
  const handleCloseSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [`${API_URL}/listings/${id}`] });
  };

  // Check if the current user is an agent and can modify this listing
  const canModifyListing = user && isAgent && user.role === 'agent';

  if (isLoading) {
    return React.createElement(
      "div",
      { className: "container px-4 py-8 mx-auto text-center" },
      React.createElement(
        "div",
        { 
          className: "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]", 
          role: "status" 
        },
        React.createElement("span", { className: "sr-only" }, "Loading...")
      )
    );
  }

  if (error || !listing) {
    return React.createElement(
      "div",
      { className: "container px-4 py-8 mx-auto" },
      React.createElement(
        Card,
        { className: "border-red-200" },
        React.createElement(
          CardContent,
          { className: "pt-6" },
          React.createElement(
            "div",
            { className: "flex items-center gap-2 text-red-500 mb-4" },
            React.createElement(PanelRight, { className: "h-5 w-5" }),
            React.createElement("h2", { className: "text-lg font-semibold" }, "Error")
          ),
          React.createElement(
            "p",
            { className: "text-gray-800 mb-4" },
            error instanceof Error ? error.message : 'Listing not found'
          ),
          React.createElement(
            Button,
            { asChild: true },
            React.createElement(Link, { href: "/listings" }, "Back to Listings")
          )
        )
      )
    );
  }

  const renderStatusBadge = () => {
    switch (listing.status) {
      case 'active':
        return React.createElement(Badge, { className: "bg-green-500" }, "Active");
      case 'inactive':
        return React.createElement(Badge, { variant: "secondary" }, "Inactive");
      case 'closed':
        return React.createElement(Badge, { variant: "outline", className: "text-blue-500 border-blue-500" }, "Closed");
      default:
        return React.createElement(Badge, { variant: "outline" }, listing.status);
    }
  };

  return React.createElement(
    "div",
    { className: "container px-4 py-8 mx-auto" },
    React.createElement(
      "div",
      { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
      // Main Content (Left Side)
      React.createElement(
        "div",
        { className: "md:col-span-2" },
        // Property Image
        React.createElement(
          "div",
          { className: "relative mb-6" },
          React.createElement("img", {
            src: `${API_URL}/listings/${id}/image`,
            alt: listing.address,
            className: "w-full h-auto rounded-lg object-cover",
            style: { maxHeight: '500px' },
            onError: (e) => {
              const target = e.target;
              target.src = 'https://placehold.co/800x600/gray/white?text=No+Image';
              target.onerror = null;
            }
          })
        ),
        // Property Title and Status
        React.createElement(
          "div",
          { className: "flex justify-between items-center mb-4" },
          React.createElement(
            "h1",
            { className: "text-2xl md:text-3xl font-bold" },
            listing.title || listing.address
          ),
          renderStatusBadge()
        ),
        // Price
        React.createElement(
          "h2",
          { className: "text-xl md:text-2xl font-semibold text-primary mb-4" },
          "$" + (typeof listing.price === 'number' 
            ? listing.price.toLocaleString() 
            : listing.price)
        ),
        // Property Features
        React.createElement(
          "div",
          { className: "flex flex-wrap gap-4 mb-6" },
          React.createElement(
            "div",
            { className: "flex items-center" },
            React.createElement(Home, { className: "h-5 w-5 mr-2 text-gray-500" }),
            React.createElement("span", null, listing.beds + " beds")
          ),
          React.createElement(
            "div",
            { className: "flex items-center" },
            React.createElement(Droplet, { className: "h-5 w-5 mr-2 text-gray-500" }),
            React.createElement("span", null, listing.baths + " baths")
          ),
          React.createElement(
            "div",
            { className: "flex items-center" },
            React.createElement(Ruler, { className: "h-5 w-5 mr-2 text-gray-500" }),
            React.createElement("span", null, listing.sqft.toLocaleString() + " sqft")
          )
        ),
        // Description
        React.createElement(
          "div",
          { className: "mb-6" },
          React.createElement("h3", { className: "text-lg font-semibold mb-2" }, "Description"),
          React.createElement(
            "p",
            { className: "text-gray-700" },
            listing.description || 'No description available.'
          )
        ),
        // Action Buttons
        React.createElement(
          "div",
          { className: "flex flex-wrap gap-2 mt-6" },
          React.createElement(
            Button,
            { variant: "outline", asChild: true },
            React.createElement(Link, { href: "/" }, "Back to Listings")
          ),
          // Show action buttons only if user can modify the listing
          canModifyListing && listing.status !== 'closed' && 
            React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Button, 
                {
                  variant: listing.status === 'active' ? 'destructive' : 'default',
                  onClick: toggleListingStatus,
                  disabled: statusMutation.isPending
                },
                statusMutation.isPending ? 'Updating...' : (
                  listing.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'
                )
              ),
              React.createElement(
                Button, 
                {
                  variant: "secondary",
                  onClick: () => setShowCloseModal(true)
                },
                React.createElement(FileCheck, { className: "h-4 w-4 mr-2" }),
                "Close Listing"
              )
            ),
          React.createElement(
            Button,
            { className: "ml-auto" },
            "Contact Agent"
          )
        )
      ),
      // Sidebar (Right Side)
      React.createElement(
        "div",
        { className: "space-y-6" },
        // Property Details Card
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "pb-3" },
            React.createElement(CardTitle, null, "Property Details")
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              "div",
              { className: "space-y-2" },
              React.createElement(
                "div",
                { className: "flex justify-between" },
                React.createElement("span", { className: "text-muted-foreground" }, "Address:"),
                React.createElement("span", null, listing.address)
              ),
              React.createElement(Separator, null),
              React.createElement(
                "div",
                { className: "flex justify-between" },
                React.createElement("span", { className: "text-muted-foreground" }, "Property Type:"),
                React.createElement("span", null, listing.propertyType)
              ),
              React.createElement(Separator, null),
              React.createElement(
                "div",
                { className: "flex justify-between" },
                React.createElement("span", { className: "text-muted-foreground" }, "Status:"),
                React.createElement(
                  "span", 
                  { 
                    className: 
                      listing.status === 'active' ? 'text-green-500' : 
                      listing.status === 'closed' ? 'text-blue-500' : 'text-gray-500'
                  },
                  listing.status.charAt(0).toUpperCase() + listing.status.slice(1)
                )
              )
            )
          )
        ),
        // Schedule a Tour Card
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "pb-3" },
            React.createElement(CardTitle, null, "Schedule a Tour")
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              "form",
              { className: "space-y-4" },
              React.createElement(
                "div",
                { className: "space-y-2" },
                React.createElement(
                  "label",
                  { htmlFor: "tourDate", className: "block text-sm font-medium" },
                  "Date"
                ),
                React.createElement("input", {
                  type: "date",
                  id: "tourDate",
                  className: "w-full px-3 py-2 border rounded-md"
                })
              ),
              React.createElement(
                "div",
                { className: "space-y-2" },
                React.createElement(
                  "label",
                  { htmlFor: "tourTime", className: "block text-sm font-medium" },
                  "Time"
                ),
                React.createElement(
                  "select",
                  { id: "tourTime", className: "w-full px-3 py-2 border rounded-md" },
                  React.createElement("option", { value: "" }, "Select a time"),
                  React.createElement("option", { value: "09:00" }, "9:00 AM"),
                  React.createElement("option", { value: "10:00" }, "10:00 AM"),
                  React.createElement("option", { value: "11:00" }, "11:00 AM"),
                  React.createElement("option", { value: "13:00" }, "1:00 PM"),
                  React.createElement("option", { value: "14:00" }, "2:00 PM"),
                  React.createElement("option", { value: "15:00" }, "3:00 PM"),
                  React.createElement("option", { value: "16:00" }, "4:00 PM")
                )
              ),
              React.createElement(
                Button,
                { type: "submit", className: "w-full" },
                "Schedule Tour"
              )
            )
          )
        )
      )
    ),
    // Close Listing Modal
    React.createElement(
      CloseListingModal,
      {
        listingId: parseInt(id),
        isOpen: showCloseModal,
        onClose: () => setShowCloseModal(false),
        onSuccess: handleCloseSuccess
      }
    )
  );
};

export default ListingDetailPage;