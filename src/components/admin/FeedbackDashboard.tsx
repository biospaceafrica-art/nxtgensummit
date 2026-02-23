import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type FeedbackEntry = {
  id: string;
  full_name: string;
  email: string;
  overall_rating: number;
  content_rating: number | null;
  speakers_rating: number | null;
  organization_rating: number | null;
  comments: string | null;
  would_recommend: boolean;
  created_at: string;
};

const avg = (nums: number[]) => nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "—";

const FeedbackDashboard = () => {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("feedback").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setFeedback(data as FeedbackEntry[]);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading feedback...</p>;

  const overallAvg = avg(feedback.map((f) => f.overall_rating));
  const contentAvg = avg(feedback.filter((f) => f.content_rating).map((f) => f.content_rating!));
  const speakersAvg = avg(feedback.filter((f) => f.speakers_rating).map((f) => f.speakers_rating!));
  const orgAvg = avg(feedback.filter((f) => f.organization_rating).map((f) => f.organization_rating!));
  const recommendPct = feedback.length ? Math.round((feedback.filter((f) => f.would_recommend).length / feedback.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Averages */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Overall", val: overallAvg },
          { label: "Content", val: contentAvg },
          { label: "Speakers", val: speakersAvg },
          { label: "Organization", val: orgAvg },
          { label: "Would Recommend", val: `${recommendPct}%` },
        ].map((s) => (
          <Card key={s.label} className="glass border-border">
            <CardContent className="p-4 text-center">
              <Star className="w-5 h-5 text-primary fill-primary mx-auto mb-1" />
              <div className="text-2xl font-display font-bold">{s.val}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submissions */}
      <Card className="glass border-border">
        <CardHeader><CardTitle className="text-lg">All Feedback ({feedback.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.map((f) => (
              <div key={f.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{f.full_name}</p>
                    <p className="text-xs text-muted-foreground">{f.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-bold">{f.overall_rating}/5</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {f.content_rating && <Badge variant="outline" className="text-xs">Content: {f.content_rating}/5</Badge>}
                  {f.speakers_rating && <Badge variant="outline" className="text-xs">Speakers: {f.speakers_rating}/5</Badge>}
                  {f.organization_rating && <Badge variant="outline" className="text-xs">Org: {f.organization_rating}/5</Badge>}
                  <Badge variant={f.would_recommend ? "default" : "secondary"} className="text-xs">
                    {f.would_recommend ? "✓ Recommends" : "✗ No recommend"}
                  </Badge>
                </div>
                {f.comments && <p className="text-sm text-muted-foreground italic">"{f.comments}"</p>}
                <p className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {feedback.length === 0 && <p className="text-center text-muted-foreground py-8">No feedback submitted yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackDashboard;
