import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string;
  event_year: number;
  image_url: string;
  description: string | null;
  created_at: string;
};

const GalleryManager = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", event_year: new Date().getFullYear().toString(), description: "" });
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data } = await supabase
      .from("event_gallery")
      .select("*")
      .order("event_year", { ascending: false });
    if (data) setItems(data as GalleryItem[]);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }
    if (!form.title || !form.event_year) {
      toast.error("Please fill title and year.");
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const filePath = `${form.event_year}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("event-gallery")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("event-gallery")
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase.from("event_gallery").insert({
          title: files.length > 1 ? `${form.title} (${i + 1})` : form.title,
          event_year: parseInt(form.event_year),
          image_url: urlData.publicUrl,
          description: form.description || null,
        });
        if (insertError) throw insertError;
      }

      toast.success(`${files.length} image(s) uploaded!`);
      setForm({ title: "", event_year: new Date().getFullYear().toString(), description: "" });
      setFiles(null);
      // Reset file input
      const fileInput = document.getElementById("gallery-files") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchGallery();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (item: GalleryItem) => {
    // Extract path from URL
    const url = new URL(item.image_url);
    const pathParts = url.pathname.split("/event-gallery/");
    if (pathParts[1]) {
      await supabase.storage.from("event-gallery").remove([decodeURIComponent(pathParts[1])]);
    }
    await supabase.from("event_gallery").delete().eq("id", item.id);
    toast.success("Image deleted");
    fetchGallery();
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImagePlus className="w-5 h-5" /> Upload Event Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  placeholder="e.g. NextGen Summit 2025"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Event Year</Label>
                <Input
                  type="number"
                  min="2020"
                  max="2030"
                  value={form.event_year}
                  onChange={(e) => setForm({ ...form, event_year: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Images</Label>
              <Input
                id="gallery-files"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Select multiple images at once.</p>
            </div>
            <Button type="submit" disabled={uploading} className="bg-primary text-primary-foreground">
              {uploading ? "Uploading..." : "Upload Images"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing gallery items */}
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className="text-lg">Gallery ({items.length} images)</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative group rounded-lg overflow-hidden border border-border">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                    <p className="text-xs font-semibold text-center">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.event_year}</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs mt-1"
                      onClick={() => deleteItem(item)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManager;
