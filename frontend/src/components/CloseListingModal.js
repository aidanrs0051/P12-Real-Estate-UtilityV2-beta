import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Check, AlertCircle } from 'lucide-react';

import { apiRequest } from '@/lib/queryClient.js';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast.js';

// Define validation schema
const closingSchema = z.object({
  closingDate: z.string().min(1, "Please select a closing date"),
  sellingPrice: z.coerce.number().positive("Price must be greater than 0"),
  sellingAgentId: z.coerce.number().positive("Please select a selling agent"),
  buyingAgentId: z.coerce.number().positive("Please select a buying agent"),
  sellingAgentFee: z.coerce.number().min(0, "Fee can't be negative").max(100, "Fee can't exceed 100%"),
  buyingAgentFee: z.coerce.number().min(0, "Fee can't be negative").max(100, "Fee can't exceed 100%"),
  closingNotes: z.string().optional(),
});

const CloseListingModal = ({ 
  listingId, 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch agents for dropdown selections
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    enabled: isOpen,
  });
  
  // Form definition
  const form = useForm({
    resolver: zodResolver(closingSchema),
    defaultValues: {
      closingDate: format(new Date(), 'yyyy-MM-dd'),
      sellingPrice: 0,
      sellingAgentId: 0,
      buyingAgentId: 0,
      sellingAgentFee: 2.5,
      buyingAgentFee: 2.5,
      closingNotes: '',
    },
  });
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setShowSuccess(false);
    }
  }, [isOpen, form]);
  
  // Mutation to close listing
  const closeMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest('POST', `/api/listings/${listingId}/close`, data);
    },
    onSuccess: async () => {
      setShowSuccess(true);
      toast({
        title: "Success",
        description: "Listing has been closed successfully",
        variant: "default",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      
      // After a delay, close the modal and trigger the success callback
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close listing",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data) => {
    closeMutation.mutate(data);
  };

  return React.createElement(
    Modal,
    { open: isOpen, onClose: onClose },
    React.createElement(
      ModalHeader,
      { onClose: onClose },
      "Close Listing"
    ),
    React.createElement(
      "form",
      { onSubmit: form.handleSubmit(onSubmit) },
      React.createElement(
        ModalBody,
        null,
        showSuccess && React.createElement(
          Alert,
          { className: "mb-4 border-green-500 text-green-500" },
          React.createElement(Check, { className: "h-4 w-4" }),
          React.createElement(AlertTitle, null, "Success!"),
          React.createElement(AlertDescription, null, "Listing has been closed successfully.")
        ),
        closeMutation.isError && React.createElement(
          Alert,
          { className: "mb-4 border-red-500 text-red-500" },
          React.createElement(AlertCircle, { className: "h-4 w-4" }),
          React.createElement(AlertTitle, null, "Error"),
          React.createElement(
            AlertDescription, 
            null, 
            closeMutation.error?.message || "Failed to close listing"
          )
        ),
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
          // Closing Date
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              Label,
              { htmlFor: "closingDate" },
              "Closing Date ",
              React.createElement("span", { className: "text-red-500" }, "*")
            ),
            React.createElement(
              Input,
              {
                id: "closingDate",
                type: "date",
                ...form.register("closingDate"),
                disabled: closeMutation.isPending || showSuccess
              }
            ),
            form.formState.errors.closingDate && React.createElement(
              "p",
              { className: "text-red-500 text-sm" },
              form.formState.errors.closingDate.message
            )
          ),
          // Selling Price
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              Label,
              { htmlFor: "sellingPrice" },
              "Selling Price ",
              React.createElement("span", { className: "text-red-500" }, "*")
            ),
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement(
                "span",
                { className: "absolute left-3 top-1/2 -translate-y-1/2" },
                "$"
              ),
              React.createElement(
                Input,
                {
                  id: "sellingPrice",
                  type: "number",
                  step: "0.01",
                  min: "0",
                  className: "pl-7",
                  placeholder: "0.00",
                  ...form.register("sellingPrice"),
                  disabled: closeMutation.isPending || showSuccess
                }
              )
            ),
            form.formState.errors.sellingPrice && React.createElement(
              "p",
              { className: "text-red-500 text-sm" },
              form.formState.errors.sellingPrice.message
            )
          ),
          // Selling Agent
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              Label,
              { htmlFor: "sellingAgentId" },
              "Selling Agent ",
              React.createElement("span", { className: "text-red-500" }, "*")
            ),
            React.createElement(
              Select,
              {
                disabled: closeMutation.isPending || showSuccess || agentsLoading,
                onValueChange: (value) => form.setValue("sellingAgentId", parseInt(value)),
                defaultValue: form.getValues("sellingAgentId").toString()
              },
              React.createElement(
                SelectTrigger,
                null,
                React.createElement(SelectValue, { placeholder: "Select selling agent" })
              ),
              React.createElement(
                SelectContent,
                null,
                React.createElement(
                  SelectItem,
                  { value: "0", disabled: true },
                  "Select selling agent"
                ),
                agents?.map((agent) => React.createElement(
                  SelectItem,
                  { key: agent.id, value: agent.id.toString() },
                  agent.name
                ))
              )
            ),
            form.formState.errors.sellingAgentId && React.createElement(
              "p",
              { className: "text-red-500 text-sm" },
              form.formState.errors.sellingAgentId.message
            )
          ),
          // Buying Agent
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              Label,
              { htmlFor: "buyingAgentId" },
              "Buying Agent ",
              React.createElement("span", { className: "text-red-500" }, "*")
            ),
            React.createElement(
              Select,
              {
                disabled: closeMutation.isPending || showSuccess || agentsLoading,
                onValueChange: (value) => form.setValue("buyingAgentId", parseInt(value)),
                defaultValue: form.getValues("buyingAgentId").toString()
              },
              React.createElement(
                SelectTrigger,
                null,
                React.createElement(SelectValue, { placeholder: "Select buying agent" })
              ),
              React.createElement(
                SelectContent,
                null,
                React.createElement(
                  SelectItem,
                  { value: "0", disabled: true },
                  "Select buying agent"
                ),
                agents?.map((agent) => React.createElement(
                  SelectItem,
                  { key: agent.id, value: agent.id.toString() },
                  agent.name
                ))
              )
            ),
            form.formState.errors.buyingAgentId && React.createElement(
              "p",
              { className: "text-red-500 text-sm" },
              form.formState.errors.buyingAgentId.message
            )
          ),
          // Selling Agent Fee
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              Label,
              { htmlFor: "sellingAgentFee" },
              "Selling Agent Fee (%) ",
              React.createElement("span", { className: "text-red-500" }, "*")
            ),
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement(
                Input,
                {
                  id: "sellingAgentFee",
                  type: "number",
                  step: "0.01",
                  min: "0",
                  max: "100",
                  placeholder: "0.00",
                  ...form.register("sellingAgentFee"),
                  disabled: closeMutation.isPending || showSuccess
                }
              ),
              React.createElement(
                "span",
                { className: "absolute right-3 top-1/2 -translate-y-1/2" },
                "%"
              )
            ),
            form.formState.errors.sellingAgentFee && React.createElement(
              "p",
              { className: "text-red-500 text-sm" },
              form.formState.errors.sellingAgentFee.message
            )
          ),
          // Buying Agent Fee
          React.createElement(
            "div",
            { className: "space-y-2" },
            React.createElement(
              Label,
              { htmlFor: "buyingAgentFee" },
              "Buying Agent Fee (%) ",
              React.createElement("span", { className: "text-red-500" }, "*")
            ),
            React.createElement(
              "div",
              { className: "relative" },
              React.createElement(
                Input,
                {
                  id: "buyingAgentFee",
                  type: "number",
                  step: "0.01",
                  min: "0",
                  max: "100",
                  placeholder: "0.00",
                  ...form.register("buyingAgentFee"),
                  disabled: closeMutation.isPending || showSuccess
                }
              ),
              React.createElement(
                "span",
                { className: "absolute right-3 top-1/2 -translate-y-1/2" },
                "%"
              )
            ),
            form.formState.errors.buyingAgentFee && React.createElement(
              "p",
              { className: "text-red-500 text-sm" },
              form.formState.errors.buyingAgentFee.message
            )
          )
        ),
        // Closing Notes
        React.createElement(
          "div",
          { className: "space-y-2 mt-4" },
          React.createElement(
            Label,
            { htmlFor: "closingNotes" },
            "Closing Notes"
          ),
          React.createElement(
            Textarea,
            {
              id: "closingNotes",
              placeholder: "Optional additional information about the closing",
              ...form.register("closingNotes"),
              disabled: closeMutation.isPending || showSuccess
            }
          )
        )
      ),
      React.createElement(
        ModalFooter,
        null,
        React.createElement(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: onClose,
            disabled: closeMutation.isPending
          },
          "Cancel"
        ),
        React.createElement(
          Button,
          {
            type: "submit",
            disabled: closeMutation.isPending || showSuccess
          },
          closeMutation.isPending ? 'Submitting...' : 'Submit'
        )
      )
    )
  );
};

export default CloseListingModal;