import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Image, Upload, Trash2, X } from "lucide-react";

interface AccommodationImagesProps {
  accommodationId: string;
  accommodationName: string;
}

interface ImageGalleryItem {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  pg_name: string;
}

const AccommodationImages = ({ accommodationId, accommodationName }: AccommodationImagesProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<ImageGalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState("view");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [accommodationId]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("accommodation_images")
        .select("id, image_url, alt_text, sort_order, pg_name")
        .eq("accommodation_id", accommodationId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `accommodation-gallery/${accommodationId}/${fileName}`;

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from('accommodations')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('accommodations')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAddImage = async () => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    if (!altText.trim()) {
      toast({
        title: "Error",
        description: "Please provide alt text for the image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage(imageFile);

      // Get highest sort order
      const maxSortOrder = images.length > 0 
        ? Math.max(...images.map(img => img.sort_order)) + 1 
        : 0;

      // Add to gallery
      const { error } = await supabase.from("accommodation_images").insert({
        accommodation_id: accommodationId,
        image_url: imageUrl,
        alt_text: altText,
        sort_order: maxSortOrder,
        pg_name: accommodationName,
      });

      if (error) throw error;

      // Reset form and refresh
      setImagePreview(null);
      setImageFile(null);
      setAltText("");
      fetchImages();
      setActiveTab("view");

      toast({
        title: "Image added",
        description: "The image has been added to the gallery",
      });
    } catch (error) {
      console.error("Error adding image:", error);
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const { error } = await supabase
        .from("accommodation_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setImages(images.filter(img => img.id !== id));

      toast({
        title: "Image deleted",
        description: "The image has been removed from the gallery",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Gallery</TabsTrigger>
          <TabsTrigger value="add">Add Image</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <Image className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No images yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add images to the gallery by switching to the "Add Image" tab
              </p>
              <Button 
                onClick={() => setActiveTab("add")} 
                variant="outline" 
                className="mt-4"
              >
                Add First Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group overflow-hidden rounded-md border">
                  <img 
                    src={image.image_url} 
                    alt={image.alt_text}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-2">
                      <p className="text-white text-sm mb-2">{image.alt_text}</p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative w-full h-[240px]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer rounded-md bg-background font-semibold text-primary hover:underline focus-within:outline-none focus-within:ring-2"
                      >
                        <span>Upload a file</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="alt-text">Image Description (Alt Text)</Label>
              <Input
                id="alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Provide a brief description of the image for accessibility purposes
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setAltText("");
                }}
              >
                Clear
              </Button>
              <Button
                onClick={handleAddImage}
                disabled={isSubmitting || !imageFile || !altText.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add to Gallery"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccommodationImages;
