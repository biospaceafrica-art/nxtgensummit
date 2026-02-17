import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Search, XCircle } from "lucide-react";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  fellowship_track: string;
  payment_confirmed: boolean;
  created_at: string;
};

type DoorOpener = {
  id: string;
  full_name: string;
  email: string;
  partnership_tier: string;
  payment_confirmed: boolean;
  created_at: string;
};

type Props = {
  registrations: Registration[];
  doorOpeners: DoorOpener[];
  onRefresh: () => void;
};

const PaymentConfirmation = ({ registrations, doorOpeners, onRefresh }: Props) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"registrations" | "door-openers">("registrations");
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleRegistrationPayment = async (id: string, current: boolean) => {
    setUpdating(id);
    const newVal = !current;
    const { error } = await supabase
      .from("registrations")
      .update({
        payment_confirmed: newVal,
        payment_confirmed_at: newVal ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) toast.error("Failed to update payment");
    else {
      toast.success(newVal ? "Payment confirmed! Notification sent." : "Payment unconfirmed.");
      onRefresh();
    }
    setUpdating(null);
  };

  const toggleDoorOpenerPayment = async (id: string, current: boolean) => {
    setUpdating(id);
    const newVal = !current;
    const { error } = await supabase
      .from("door_opener_submissions")
      .update({
        payment_confirmed: newVal,
        payment_confirmed_at: newVal ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) toast.error("Failed to update payment");
    else {
      toast.success(newVal ? "Payment confirmed!" : "Payment unconfirmed.");
      onRefresh();
    }
    setUpdating(null);
  };

  const filteredRegs = registrations.filter(
    (r) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDO = doorOpeners.filter(
    (d) =>
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  );

  const tabClass = (t: string) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
    }`;

  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="text-lg">Payment Confirmations</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <div className="flex gap-2">
            <button className={tabClass("registrations")} onClick={() => setTab("registrations")}>
              Registrations
            </button>
            <button className={tabClass("door-openers")} onClick={() => setTab("door-openers")}>
              Door Openers
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2 hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-2">
                  {tab === "registrations" ? "Track" : "Tier"}
                </th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {tab === "registrations" &&
                filteredRegs.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 px-2 font-medium">{r.full_name}</td>
                    <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{r.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-xs">
                        {r.fellowship_track === "enterprise" ? "Business" : "Career"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      {r.payment_confirmed ? (
                        <Badge className="bg-green-600/20 text-green-400 text-xs gap-1">
                          <CheckCircle className="w-3 h-3" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <XCircle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        size="sm"
                        variant={r.payment_confirmed ? "outline" : "default"}
                        disabled={updating === r.id}
                        onClick={() => toggleRegistrationPayment(r.id, r.payment_confirmed)}
                        className="text-xs h-7"
                      >
                        {r.payment_confirmed ? "Unconfirm" : "Confirm"}
                      </Button>
                    </td>
                  </tr>
                ))}
              {tab === "door-openers" &&
                filteredDO.map((d) => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="py-3 px-2 font-medium">{d.full_name}</td>
                    <td className="py-3 px-2 hidden sm:table-cell text-muted-foreground">{d.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-xs capitalize">{d.partnership_tier}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      {d.payment_confirmed ? (
                        <Badge className="bg-green-600/20 text-green-400 text-xs gap-1">
                          <CheckCircle className="w-3 h-3" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <XCircle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        size="sm"
                        variant={d.payment_confirmed ? "outline" : "default"}
                        disabled={updating === d.id}
                        onClick={() => toggleDoorOpenerPayment(d.id, d.payment_confirmed)}
                        className="text-xs h-7"
                      >
                        {d.payment_confirmed ? "Unconfirm" : "Confirm"}
                      </Button>
                    </td>
                  </tr>
                ))}
              {((tab === "registrations" && filteredRegs.length === 0) ||
                (tab === "door-openers" && filteredDO.length === 0)) && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentConfirmation;
