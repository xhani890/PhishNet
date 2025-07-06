// Update: phisnet/client/src/components/templates/email-template-form.tsx
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Download } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Please enter a valid email address"),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().optional(),
  type: z.enum(["phishing", "training", "notification"]),
  complexity: z.enum(["low", "medium", "high"]),
  description: z.string().optional(),
  category: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface EmailTemplateFormProps {
  template?: any;
  onClose: () => void;
}

export default function EmailTemplateForm({ template, onClose }: EmailTemplateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewContent, setPreviewContent] = useState("");

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      name: template.name || "",
      subject: template.subject || "",
      senderName: template.senderName || "",
      senderEmail: template.senderEmail || "",
      htmlContent: template.htmlContent || "",
      textContent: template.textContent || "",
      type: template.type || "phishing",
      complexity: template.complexity || "medium",
      description: template.description || "",
      category: template.category || "",
    } : {
      name: "",
      subject: "",
      senderName: "",
      senderEmail: "",
      htmlContent: "",
      textContent: "",
      type: "phishing",
      complexity: "medium",
      description: "",
      category: "",
    },
  });

  const isEditing = !!template;

  const mutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      const url = isEditing ? `/api/email-templates/${template.id}` : '/api/email-templates';
      const method = isEditing ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `Template ${isEditing ? 'updated' : 'created'}`,
        description: `Email template has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} template`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    const htmlContent = form.getValues('htmlContent');
    setPreviewContent(htmlContent);
  };

  const handleExportTemplate = () => {
    const values = form.getValues();
    const templateData = JSON.stringify(values, null, 2);
    const blob = new Blob([templateData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${values.name || 'template'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function onSubmit(data: TemplateFormValues) {
    mutation.mutate(data);
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col h-full max-h-[80vh]">
        <div className="text-lg font-medium border-b pb-4">
          {isEditing ? "Edit Email Template" : "Create Email Template"}
        </div>
        
        <div className="flex-1 mt-4 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border overflow-hidden">
          {/* Left panel - Settings */}
          <div className="w-full sm:w-1/3 p-4 overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Email Template Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Email Subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="senderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="senderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="phishing">Phishing</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="complexity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complexity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complexity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Banking, Social Media, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Template description" 
                          className="resize-none h-20" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      isEditing ? "Update Template" : "Save Template"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportTemplate}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Template
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          {/* Right panel - Editor/Preview */}
          <div className="w-full sm:w-2/3 p-4 overflow-hidden flex flex-col">
            <Tabs defaultValue="editor" className="w-full flex flex-col flex-1">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="flex-1 flex flex-col">
                <FormField
                  control={form.control}
                  name="htmlContent"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your HTML email content here..."
                          className="flex-1 min-h-[400px] font-mono text-sm resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="textContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Content (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Plain text version of the email..."
                            className="h-24 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="mt-4"
                >
                  Update Preview
                </Button>
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1">
                <div className="border rounded-lg h-full overflow-auto bg-white">
                  {previewContent ? (
                    <div 
                      className="p-4"
                      dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Click "Update Preview" in the Editor tab to see preview
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}