-- Create vault_entries table to store file metadata and track entries
CREATE TABLE public.vault_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('medical', 'legal', 'digital', 'personal')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own vault entries"
ON public.vault_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vault entries"
ON public.vault_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault entries"
ON public.vault_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault entries"
ON public.vault_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vault_entries_updated_at
BEFORE UPDATE ON public.vault_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();