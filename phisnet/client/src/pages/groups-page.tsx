import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupForm from "@/components/groups/group-form";
import TargetForm from "@/components/groups/target-form";
import ImportCSV from "@/components/groups/import-csv";
import { Plus, Users, UserPlus, FileSpreadsheet, Trash2, Edit, Eye, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function GroupsPage() {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isAddingTarget, setIsAddingTarget] = useState(false);
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<any>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetToEdit, setTargetToEdit] = useState<any>(null);
  const [showActiveCampaignsDialog, setShowActiveCampaignsDialog] = useState(false);
  const [activeCampaignsError, setActiveCampaignsError] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: groups, refetch: refetchGroups } = useQuery({
    queryKey: ['/api/groups'],
  });

  const { data: targets, refetch: refetchTargets } = useQuery({
    queryKey: ['/api/groups', selectedGroup?.id, 'targets'],
    enabled: !!selectedGroup,
    onSuccess: (data) => {
      console.log('Targets data:', data);
      if (data && data.length > 0) {
        console.log('First target structure:', data[0]);
        console.log('Available keys:', Object.keys(data[0]));
      }
    }
  });

  // Add delete mutation for groups
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      try {
        console.log(`Attempting to delete group ID: ${groupId}`);
        
        // Create a direct fetch request without apiRequest helper
        const response = await fetch(`/api/groups/${groupId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Handle successful response (204 No Content is expected)
        if (response.status === 204 || response.ok) {
          return { success: true };
        }
        
        // Handle error response
        let errorMessage = `Failed to delete group: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If response isn't valid JSON, use status text
          console.error("Error parsing error response:", parseError);
        }
        
        throw new Error(errorMessage);
      } catch (error) {
        console.error("Delete group error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Group deleted",
        description: "The target group has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      
      // If the deleted group was selected, clear selection
      if (groupToDelete?.id === selectedGroup?.id) {
        setSelectedGroup(null);
      }
      
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    },
    onError: (error: any) => {
      console.error('Group deletion error:', error);
      
      if (error.error === 'ACTIVE_CAMPAIGNS') {
        // Show special dialog for active campaigns
        setActiveCampaignsError(error);
        setShowActiveCampaignsDialog(true);
        setDeleteDialogOpen(false);
      } else {
        toast({
          title: "Error deleting group",
          description: error.message || "Unknown error deleting group",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
      }
      setGroupToDelete(null);
    }
  });

  // Add delete mutation for targets
  const deleteTargetMutation = useMutation({
    mutationFn: async (targetId: number) => {
      const response = await apiRequest('DELETE', `/api/groups/${selectedGroup.id}/targets/${targetId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Target deleted",
        description: "The target has been deleted successfully.",
      });
      refetchTargets();
    },
    onError: (error) => {
      toast({
        title: "Error deleting target",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsCreatingGroup(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setIsCreatingGroup(true);
  };

  const handleViewGroup = (group) => {
    console.log('Selecting group:', group);
    setSelectedGroup(group);
    
    // Show success message
    toast({
      title: "Group selected",
      description: `Now viewing targets for "${group.name}"`,
    });
  };

  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteGroup = () => {
    if (groupToDelete) {
      deleteGroupMutation.mutate(groupToDelete.id);
    }
  };

  const handleAddTarget = () => {
    setTargetToEdit(null);
    setIsAddingTarget(true);
  };

  const handleImportCSV = () => {
    setIsImportingCSV(true);
  };

  const handleDeleteTarget = (targetId: number) => {
    deleteTargetMutation.mutate(targetId);
  };

  const handleEditTarget = (target) => {
    setTargetToEdit(target);
    setIsEditingTarget(true);
  };

  useEffect(() => {
    if (targets && targets.length > 0) {
      console.log("Target fields:", Object.keys(targets[0]));
      console.log("Sample target data:", targets[0]);
    }
  }, [targets]);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Target Groups</h1>
        <Button onClick={handleAddGroup}>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Targets</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups && groups.length > 0 ? (
                    groups.map((group) => (
                      <TableRow key={group.id} className={selectedGroup?.id === group.id ? "bg-secondary/50" : ""}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.targetCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewGroup(group)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditGroup(group)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteGroup(group)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No groups found. Create your first target group.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Group Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>
                {selectedGroup 
                  ? (
                      <div className="flex items-center gap-2">
                        <span>{selectedGroup.name}</span>
                        <Badge variant="secondary">
                          {targets?.length || 0} target{targets?.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )
                  : "Select a group to view targets"}
              </CardTitle>
              {selectedGroup && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleImportCSV}>
                    <FileSpreadsheet className="mr-1 h-4 w-4" /> Import CSV
                  </Button>
                  <Button size="sm" onClick={handleAddTarget}>
                    <UserPlus className="mr-1 h-4 w-4" /> Add Target
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedGroup ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!targets ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <div className="text-muted-foreground">Loading targets...</div>
                        </TableCell>
                      </TableRow>
                    ) : targets.length > 0 ? (
                      targets.map((target) => (
                        <TableRow key={target.id}>
                          <TableCell>
                            {/* Fix the name display logic */}
                            {target.firstName && target.lastName 
                              ? `${target.firstName} ${target.lastName}` 
                              : target.first_name && target.last_name
                              ? `${target.first_name} ${target.last_name}`
                              : target.name || 'Unknown'}
                          </TableCell>
                          <TableCell>{target.email || 'No email'}</TableCell>
                          <TableCell>{target.position || target.job_title || target.title || '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditTarget(target)}
                                title="Edit target"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteTarget(target.id)}
                                title="Delete target"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {selectedGroup ? 
                            "No targets in this group yet. Add targets or import from CSV." :
                            "Select a group to view its targets."
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Group Selected</h3>
                  <p className="text-muted-foreground mt-1">
                    Select a group from the list to view and manage targets
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Group Dialog */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? "Edit Group" : "Create Group"}
            </DialogTitle>
          </DialogHeader>
          <GroupForm 
            group={selectedGroup} 
            onClose={() => setIsCreatingGroup(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Add/Edit Target Dialog */}
      <Dialog open={isAddingTarget || isEditingTarget} onOpenChange={(open) => {
        if (!open) {
          setIsAddingTarget(false);
          setIsEditingTarget(false);
          setTargetToEdit(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingTarget 
                ? `Edit Target in ${selectedGroup?.name}` 
                : `Add Target to ${selectedGroup?.name}`
              }
            </DialogTitle>
          </DialogHeader>
          <TargetForm 
            groupId={selectedGroup?.id} 
            target={targetToEdit}
            onClose={() => {
              setIsAddingTarget(false);
              setIsEditingTarget(false);
              setTargetToEdit(null);
              refetchTargets();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportingCSV} onOpenChange={setIsImportingCSV}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Targets from CSV</DialogTitle>
          </DialogHeader>
          <ImportCSV 
            groupId={selectedGroup?.id} 
            onClose={() => {
              setIsImportingCSV(false);
              refetchTargets();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete "{groupToDelete?.name}"?
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        This action will also delete:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                        <li>All targets in this group</li>
                        <li>Any associated campaigns (except active ones)</li>
                        <li>All campaign results and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm font-medium text-destructive">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGroupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Group & Associated Data"  
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active Campaigns Warning Dialog */}
      <AlertDialog open={showActiveCampaignsDialog} onOpenChange={setShowActiveCampaignsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Cannot Delete Group
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  This group cannot be deleted because it has <strong>{activeCampaignsError?.activeCampaigns?.length || 0} active campaign(s)</strong>:
                </p>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <ul className="space-y-2">
                    {activeCampaignsError?.activeCampaigns?.map((campaign: any) => (
                      <li key={campaign.id} className="flex items-center gap-2">
                        <Badge variant={campaign.status === 'Active' ? 'destructive' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <span className="font-medium">{campaign.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="font-medium">To delete this group, you must first:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Stop or complete the active campaigns</li>
                    <li>Move targets to another group (optional)</li>
                    <li>Then delete this group</li>
                  </ol>
                </div>
                
                {activeCampaignsError?.totalCampaigns > activeCampaignsError?.activeCampaigns?.length && (
                  <p className="text-sm text-muted-foreground">
                    Note: This group also has {activeCampaignsError.totalCampaigns - activeCampaignsError.activeCampaigns.length} inactive campaign(s) 
                    that will be automatically deleted with the group.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Understood
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowActiveCampaignsDialog(false);
                // Optionally navigate to campaigns page
                // navigate('/campaigns');
              }}
            >
              Go to Campaigns
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
