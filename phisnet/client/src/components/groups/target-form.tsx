import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const targetSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  position: z.string().optional(),
});

type TargetFormValues = z.infer<typeof targetSchema>;

interface TargetFormProps {
  groupId: number;
  target?: any;
  onClose: () => void;
}

export default function TargetForm({ groupId, target, onClose }: TargetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetSchema),
    defaultValues: target ? {
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      position: target.position || "",
    } : {
      firstName: "",
      lastName: "",
      email: "",
      position: "",
    },
  });

  const isEditing = !!target;

  const mutation = useMutation({
    mutationFn: async (data: TargetFormValues) => {
      const url = isEditing 
        ? `/api/targets/${target.id}` 
        : `/api/groups/${groupId}/targets`;
      const method = isEditing ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Target ${isEditing ? 'updated' : 'added'}`,
        description: `Target has been ${isEditing ? 'updated' : 'added to the group'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'targets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Error ${isEditing ? 'updating' : 'adding'} target`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: TargetFormValues) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.smith@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="IT Manager" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Add Target"}
              </>
            ) : (
              isEditing ? "Update Target" : "Add Target"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
