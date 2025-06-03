import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Image, Upload, Trash2, X, Pencil, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  accommodation_id: string | null;
  created_at: string | null;
  sort_order: number;
}

const Gallery = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [pgNames, setPgNames] = useState<string[]>([]);
  const [pgIds, setPgIds] = useState<{ id: string; name: string }[]>([]);
  const [selectedPg, setSelectedPg] = useState<string>("");
  const [selectedPgId, setSelectedPgId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("view");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [customAccommodationId, setCustomAccommodationId] = useState<string>("");
  const [customCreatedAt, setCustomCreatedAt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // Fetch PG names and IDs
  const fetchPgNames = async () => {
    try {
      const { data, error } = await supabase
        .from("accommodations")
        .select("id, name")
        .order("name");

      if (error) throw error;
      const names = (data || []).map(item => item.name);
      setPgNames(names);
      setPgIds(data || []);
      if (names.length > 0) {
        setSelectedPg(names[0]);
        setSelectedPgId((data || [])[0]?.id || "");
      }
    } catch (error) {
      console.error("Error fetching PG names:", error);
      toast({
        title: "Error",
        description: "Failed to load PG names",
        variant: "destructive",
      });
    }
  };

  // Fetch images for selected PG
  const fetchImages = async () => {
    if (!selectedPgId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("accommodation_images")
        .select("id, image_url, alt_text, accommodation_id, created_at, sort_order")
        .eq("accommodation_id", selectedPgId)
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

  useEffect(() => {
    fetchPgNames();
  }, []);

  useEffect(() => {
    if (selectedPg) {
      const found = pgIds.find(pg => pg.name === selectedPg);
      setSelectedPgId(found?.id || "");
    }
  }, [selectedPg, pgIds]);

  useEffect(() => {
    if (selectedPgId) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPgId]);

  // Only admin can access this page
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // Image upload helpers
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

  const uploadImage = async (file: File): Promise<string | null> => {
    const accommodationId = customAccommodationId || selectedPgId;
    // We need accommodationId to upload to a specific folder, but it's not strictly mandatory for the DB row
    const uploadFolder = accommodationId || 'general'; // Use a default folder if no ID is provided
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `accommodation-gallery/${uploadFolder}/${fileName}`;

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from('accommodations')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      toast({
        title: "Error",
        description: `Failed to upload image: ${uploadError.message}`,
        variant: "destructive",
      });
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('accommodations')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Add new image
  const handleAddImage = async () => {
    // Image file and alt text are required by DB schema
    if (!imageFile) {
       toast({
         title: "Error",
         description: "Image upload is required by schema.",
         variant: "destructive",
       });
       return;
    }

    if (!altText.trim()) {
      toast({
        title: "Error",
        description: "Alt text is required by schema.",
        variant: "destructive",
      });
      return;
    }


    setIsSubmitting(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage(imageFile);

      if (!imageUrl) {
        // Upload failed, error already toasted in uploadImage
        setIsSubmitting(false);
        return;
      }

      // Get highest sort order if not provided
      const finalSortOrder = sortOrder !== undefined && sortOrder !== null ? sortOrder : (images.length > 0 
        ? Math.max(...images.map(img => img.sort_order)) + 1 
        : 0);


      // Add to gallery
      const { error } = await supabase.from("accommodation_images").insert({
        accommodation_id: customAccommodationId || selectedPgId || null, // Allow null if neither is selected
        image_url: imageUrl, // Required
        alt_text: altText, // Required
        sort_order: finalSortOrder,
        created_at: customCreatedAt || undefined, // Supabase will default if undefined
      });

      if (error) throw error;

      // Reset form and refresh
      setImagePreview(null);
      setImageFile(null);
      setAltText("");
      setSortOrder(0);
      setCustomAccommodationId("");
      setCustomCreatedAt("");
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
        description: `Failed to add image: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete image
  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const { error } = await supabase
        .from("accommodation_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== id));

      toast({
        title: "Image deleted",
        description: "The image has been removed from the gallery",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: `Failed to delete image: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  // Edit image
  const handleEditImage = (img: GalleryImage) => {
    setEditId(img.id);
    setEditAltText(img.alt_text);
    setEditSortOrder(img.sort_order);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from("accommodation_images")
        .update({
          alt_text: editAltText,
          sort_order: editSortOrder,
        })
        .eq("id", id);

      if (error) throw error;

      setImages(images.map(img => img.id === id ? { ...img, alt_text: editAltText, sort_order: editSortOrder } : img));
      setEditId(null);
      toast({
        title: "Image updated",
        description: "The image details have been updated",
      });
    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        title: "Error",
        description: `Failed to update image: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {

    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>PG Image Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select value={selectedPg} onValueChange={setSelectedPg}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select PG" />
              </SelectTrigger>
              <SelectContent>
                {pgNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
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
                    Add images to this PG from the "Add Image" tab
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Alt Text</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Accommodation ID</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {images.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell>
                          <img 
                            src={image.image_url} 
                            alt={image.alt_text}
                            className="w-20 h-20 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          {editId === image.id ? (
                            <Input
                              value={editAltText}
                              onChange={e => setEditAltText(e.target.value)}
                              className="w-40"
                            />
                          ) : (
                            image.alt_text
                          )}
                        </TableCell>
                        <TableCell>
                          {editId === image.id ? (
                            <Input
                              type="number"
                              value={editSortOrder}
                              onChange={e => setEditSortOrder(Number(e.target.value))}
                              className="w-20"
                            />
                          ) : (
                            image.sort_order
                          )}
                        </TableCell>
                        <TableCell>
                          {image.accommodation_id}
                        </TableCell>
                        <TableCell>
                          {image.created_at}
                        </TableCell>
                        <TableCell>
                          {editId === image.id ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(image.id)}
                                disabled={isSubmitting}
                              >
                                <Save className="h-4 w-4 mr-1" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditId(null)}
                              >
                                <X className="h-4 w-4" /> Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditImage(image)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="add">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accommodation-id">Accommodation (PG) (Optional)</Label>
                  <Select
                    value={customAccommodationId || selectedPgId || ""}
                    onValueChange={setCustomAccommodationId}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select PG" />
                    </SelectTrigger>
                    <SelectContent>
                      {pgIds.map((pg) => (
                        <SelectItem key={pg.id} value={pg.id}>
                          {pg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="accommodation-id"
                    value={customAccommodationId}
                    onChange={e => setCustomAccommodationId(e.target.value)}
                    placeholder="Or enter accommodation ID (Optional)"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs h-[180px]">
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
                <div>
                  <Label htmlFor="sort-order">Sort Order (Optional)</Label>
                  <Input
                    id="sort-order"
                    type="number"
                    value={sortOrder}
                    onChange={e => setSortOrder(Number(e.target.value))}
                    placeholder="Sort order (optional)"
                    className="mt-1 w-32"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Images are sorted in ascending order. Leave blank to auto-generate.
                  </p>
                </div>
                <div>
                  <Label htmlFor="created-at">Created At (Optional)</Label>
                  <Input
                    id="created-at"
                    type="datetime-local"
                    value={customCreatedAt}
                    onChange={e => setCustomCreatedAt(e.target.value)}
                    className="mt-1 w-64"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave blank to use the current time
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
                      setSortOrder(0);
                      setCustomAccommodationId("");
                      setCustomCreatedAt("");
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleAddImage}
                    disabled={isSubmitting || !imageFile || !altText.trim()} // Keep image and alt text required by schema
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Gallery;