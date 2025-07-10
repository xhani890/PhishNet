import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailTemplate } from "@shared/schema";

interface TemplatePreviewProps {
  template: EmailTemplate;
  onClose?: () => void; // Make onClose optional since we'll handle closing at the Dialog level
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <>
      <DialogHeader className="border-b pb-4 mb-4">
        <DialogTitle className="text-xl font-semibold">
          Template Preview: {template.name}
        </DialogTitle>
      </DialogHeader>

      <div className="overflow-auto flex-1" style={{ height: "calc(85vh - 100px)" }}>
        <div className="flex flex-col gap-4">
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-medium text-muted-foreground">From:</div>
              <div>{template.sender_name} &lt;{template.sender_email}&gt;</div>
              
              <div className="font-medium text-muted-foreground">Subject:</div>
              <div>{template.subject}</div>
              
              <div className="font-medium text-muted-foreground">Type:</div>
              <div>
                {template.type ? `Phishing - ${template.type.replace('phishing-', '').split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : 'Standard'} - {template.complexity || 'Medium'}
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden bg-background">
            <div 
              className="prose max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary p-4"
              dangerouslySetInnerHTML={{ 
                __html: template.html_content || 'No content available' 
              }}
            />
          </div>
          
          {template.text_content && (
            <div className="border rounded-md p-3 mt-4 bg-muted/10">
              <h3 className="text-sm font-medium mb-2">Plain Text Version:</h3>
              <pre className="whitespace-pre-wrap text-sm text-foreground">{template.text_content}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}