import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string;
  event_year: number;
  image_url: string;
  description: string | null;
};

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("event_gallery")
        .select("*")
        .order("event_year", { ascending: false });
      if (data) {
        setItems(data as GalleryItem[]);
        const uniqueYears = [...new Set(data.map((d: any) => d.event_year))].sort((a, b) => b - a);
        setYears(uniqueYears);
        if (uniqueYears.length > 0 && !selectedYear) setSelectedYear(uniqueYears[0]);
      }
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const filtered = selectedYear ? items.filter((i) => i.event_year === selectedYear) : items;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Event <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Relive the moments from our past summits and events.
          </p>
        </motion.div>

        {/* Year filter */}
        {years.length > 0 && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedYear === year
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-16">Loading gallery...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No photos yet. Check back soon!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid glass rounded-xl overflow-hidden group"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
