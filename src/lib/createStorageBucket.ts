
import { supabase } from "@/integrations/supabase/client";

// Function to check if a bucket exists and create it if it doesn't
export const ensureStorageBucket = async (bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make it public so we can access images directly
      });
      
      if (error) {
        console.error(`Error creating ${bucketName} bucket:`, error);
        return false;
      }
      
      console.log(`Created ${bucketName} bucket successfully`);
      return true;
    }
    
    console.log(`${bucketName} bucket already exists`);
    return true;
  } catch (error) {
    console.error(`Error checking/creating ${bucketName} bucket:`, error);
    return false;
  }
};
