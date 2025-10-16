# Supabase Storage Setup for Resumes

## Step 1: Create Storage Bucket

Go to Supabase Dashboard → Storage → Create a new bucket:

**Bucket Configuration:**
- **Name:** `resumes`
- **Public:** ❌ No (Private bucket - requires authentication)
- **File Size Limit:** 5 MB
- **Allowed MIME types:** `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Step 2: Set Up Storage Policies

Add these RLS policies for the `resumes` bucket:

### Policy 1: Users can upload their own resumes
```sql
CREATE POLICY "Users can upload own resume"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Users can read their own resumes
```sql
CREATE POLICY "Users can read own resume"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Users can update their own resumes
```sql
CREATE POLICY "Users can update own resume"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 4: Users can delete their own resumes
```sql
CREATE POLICY "Users can delete own resume"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 5: Admins can access all resumes (optional)
```sql
CREATE POLICY "Admins can access all resumes"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM public."User"
    WHERE id = auth.uid()::text
    AND "isAdmin" = true
  )
);
```

## Step 3: File Structure

Resumes are stored with this path structure:
```
resumes/
  └── {userId}/
      ├── {timestamp}-resume.pdf
      ├── {timestamp}-cv.docx
      └── ...
```

Example:
```
resumes/user-123/1699999999999-john-doe-resume.pdf
```

## Step 4: Verify Setup

Run this query in Supabase SQL Editor to verify bucket exists:

```sql
SELECT * FROM storage.buckets WHERE name = 'resumes';
```

Check policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname ILIKE '%resume%';
```

## Environment Variables

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

Test upload from the browser console:
```javascript
const supabase = createClient();
const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
const { data, error } = await supabase.storage
  .from('resumes')
  .upload(`${userId}/test-${Date.now()}.pdf`, file);
console.log({ data, error });
```
