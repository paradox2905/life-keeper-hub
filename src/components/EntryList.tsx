import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Download, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VaultEntry {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

interface EntryListProps {
  category: string;
  entries: VaultEntry[];
  onBack: () => void;
  onEdit: (entry: VaultEntry) => void;
  onDelete: (entryId: string) => void;
  onAddNew: () => void;
}

const EntryList: React.FC<EntryListProps> = ({
  category,
  entries,
  onBack,
  onEdit,
  onDelete,
  onAddNew
}) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDownload = async (entry: VaultEntry) => {
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .download(entry.file_path);

      if (error) {
        console.error('Download error:', error);
        toast({
          title: "Download failed",
          description: "Failed to download file. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = entry.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download successful",
        description: `${entry.file_name} has been downloaded.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "An unexpected error occurred during download.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async (entryId: string) => {
    setIsDeleting(entryId);
    try {
      // Find the entry to get the file path
      const entry = entries.find(e => e.id === entryId);
      if (!entry) return;

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('vault')
        .remove([entry.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete database record
      const { error: dbError } = await supabase
        .from('vault_entries')
        .delete()
        .eq('id', entryId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        toast({
          title: "Delete failed",
          description: "Failed to delete entry. Please try again.",
          variant: "destructive",
        });
        return;
      }

      onDelete(entryId);
      toast({
        title: "Entry deleted",
        description: "The entry has been successfully deleted.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred during deletion.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'medical': return 'text-red-500';
      case 'legal': return 'text-blue-500';
      case 'digital': return 'text-green-500';
      case 'personal': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" onClick={onBack} className="w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Vault</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold capitalize">{category} Entries</h2>
        </div>
        <Button onClick={onAddNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="hidden sm:inline">Add New Entry</span>
          <span className="sm:hidden">Add Entry</span>
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">No entries found in this category.</p>
            <Button onClick={onAddNew} className="w-full sm:w-auto">Add Your First Entry</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold truncate pr-2">{entry.title}</h3>
                      {entry.is_important && (
                        <span className="bg-warning/10 text-warning text-xs px-2 py-1 rounded-full w-fit">
                          Important
                        </span>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-muted-foreground mb-2 text-sm sm:text-base line-clamp-2">{entry.description}</p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="truncate">{entry.file_name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatFileSize(entry.file_size)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Added {formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      className="p-2"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(entry)}
                      className="p-2"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeleting === entry.id}
                          className="p-2"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-sm sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg sm:text-xl">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm sm:text-base">
                            This will permanently delete "{entry.title}" and remove the file from storage.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteConfirm(entry.id)}
                            className="bg-destructive text-destructive-foreground w-full sm:w-auto"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntryList;