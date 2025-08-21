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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vault
          </Button>
          <h2 className="text-3xl font-bold capitalize">{category} Entries</h2>
        </div>
        <Button onClick={onAddNew}>
          <Plus className="h-5 w-5 mr-2" />
          Add New Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No entries found in this category.</p>
            <Button onClick={onAddNew}>Add Your First Entry</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{entry.title}</h3>
                      {entry.is_important && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Important
                        </span>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-muted-foreground mb-2">{entry.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{entry.file_name}</span>
                      <span>{formatFileSize(entry.file_size)}</span>
                      <span>Added {formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(entry)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeleting === entry.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{entry.title}" and remove the file from storage.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteConfirm(entry.id)}
                            className="bg-destructive text-destructive-foreground"
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