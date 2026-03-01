import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

type VolunteerApp = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string;
  experience: string | null;
  why_volunteer: string | null;
  created_at: string;
};

const positionLabels: Record<string, string> = {
  mass_choir: "Mass Choir",
  ushering: "Ushering",
  transportation: "Transportation & Logistics",
  social_media: "Social Media",
};

const VolunteerAdmin = () => {
  const [volunteers, setVolunteers] = useState<VolunteerApp[]>([]);

  useEffect(() => {
    supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setVolunteers(data as VolunteerApp[]); });
  }, []);

  const byPosition = volunteers.reduce<Record<string, number>>((acc, v) => {
    acc[v.position] = (acc[v.position] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-display font-bold">{volunteers.length}</div>
            <p className="text-xs text-muted-foreground">Total Volunteers</p>
          </CardContent>
        </Card>
        {Object.entries(byPosition).map(([pos, count]) => (
          <Card key={pos} className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-display font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">{positionLabels[pos] || pos}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass border-border">
        <CardHeader><CardTitle className="text-lg">Volunteer Applications ({volunteers.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2 hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-2">Position</th>
                  <th className="text-left py-3 px-2 hidden md:table-cell">Experience</th>
                  <th className="text-left py-3 px-2 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v.id} className="border-b border-border/50">
                    <td className="py-3 px-2 font-medium">{v.full_name}</td>
                    <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{v.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-xs">{positionLabels[v.position] || v.position}</Badge>
                    </td>
                    <td className="py-3 px-2 hidden md:table-cell text-xs text-muted-foreground truncate max-w-[200px]">{v.experience || "—"}</td>
                    <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {volunteers.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No volunteer applications yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerAdmin;
