import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ensureStorageBucket } from "@/lib/createStorageBucket";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Create schema for form validation with all fields optional
const accommodationSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  features: z.array(z.string()).optional(),
  pg_category: z.enum(['girls', 'boys']).optional(),
  maps_link: z.string().optional(),
});

type AccommodationFormValues = z.infer<typeof accommodationSchema>;

interface AccommodationFormProps {
  onSuccess: () => void;
  initialData?: any;
  mode?: 'add' | 'edit';
}

const AccommodationForm = ({ onSuccess, initialData, mode = 'add' }: AccommodationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.main_image || null);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const { toast } = useToast();

  // Ensure storage bucket exists on component mount
  useEffect(() => {
    ensureStorageBucket('accommodations');
  }, []);

  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      address: initialData?.address || "",
      contact: initialData?.contact || "",
      email: initialData?.email || "",
      features: initialData?.features || [],
      pg_category: initialData?.pg_category || undefined,
      maps_link: initialData?.maps_link || "",
    },
  });

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

  const handleAddFeature = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && featureInput.trim() !== "") {
      e.preventDefault();
      if (!features.includes(featureInput.trim())) {
        setFeatures([...features, featureInput.trim()]);
      }
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('accommodations')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('accommodations')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: AccommodationFormValues) => {
    try {
      setIsSubmitting(true);
      
      const accommodationData: any = {
        name: values.name || null,
        code: values.code || null,
        description: values.description || null,
        address: values.address || null,
        contact: values.contact || null,
        email: values.email || null,
        features: features,
        pg_category: values.pg_category || null,
        maps_link: values.maps_link || null,
      };

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        accommodationData.main_image = imageUrl;
      } else if (initialData?.main_image) {
        accommodationData.main_image = initialData.main_image;
      }

      let result;
      if (mode === 'edit' && initialData?.id) {
        result = await supabase
          .from("accommodations")
          .update(accommodationData)
          .eq("id", initialData.id);
      } else {
        result = await supabase
          .from("accommodations")
          .insert(accommodationData);
      }

      if (result.error) throw result.error;

      form.reset();
      setImagePreview(null);
      setImageFile(null);
      setFeatures([]);

      onSuccess();
      
      toast({
        title: mode === 'edit' ? "Updated successfully" : "Added successfully",
        description: mode === 'edit' 
          ? "Accommodation has been updated" 
          : "New accommodation has been added",
      });
    } catch (error: any) {
      console.error("Error with accommodation:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'edit' ? 'Edit' : 'Add New'} Accommodation</CardTitle>
        <CardDescription>Enter the details of the hostel or PG accommodation</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code/Reference ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter unique code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pg_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PG Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PG category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="girls">Girls PG</SelectItem>
                      <SelectItem value="boys">Boys PG</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed description" 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maps_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Google Maps link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Features</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={handleAddFeature}
                  placeholder="Add a feature and press Enter (e.g., WiFi, AC, Food)"
                  className="flex-1"
                />
              </div>
              
              {features.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-sm pl-2">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">No features added yet</p>
              )}
            </div>
            
            <div>
              <FormLabel>Main Image</FormLabel>
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

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  mode === 'edit' ? 'Update Accommodation' : 'Add Accommodation'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AccommodationForm;
