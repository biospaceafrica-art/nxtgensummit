import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, UserPlus, MessageCircle, User, Send } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  organization: string | null;
  bio: string | null;
  photo_url: string | null;
};

type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

const Networking = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [search, setSearch] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [form, setForm] = useState({ full_name: "", organization: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [chatWith, setChatWith] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgText, setMsgText] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyProfile();
      fetchConnections();
    }
  }, [user]);

  useEffect(() => {
    if (!chatWith || !user) return;
    fetchMessages(chatWith.user_id);
    const channel = supabase
      .channel(`msgs-${chatWith.user_id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.recipient_id === chatWith.user_id) ||
          (msg.sender_id === chatWith.user_id && msg.recipient_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatWith, user]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("networking_profiles").select("id, user_id, full_name, organization, bio, photo_url").order("created_at", { ascending: false });
    if (data) setProfiles(data);
  };

  const fetchMyProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("networking_profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (data) { setMyProfile(data); setForm({ full_name: data.full_name, organization: data.organization || "", bio: data.bio || "" }); }
    else setShowSetup(true);
  };

  const fetchConnections = async () => {
    const { data } = await supabase.from("connections").select("*");
    if (data) setConnections(data);
  };

  const fetchMessages = async (otherId: string) => {
    if (!user) return;
    const { data } = await supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.full_name) return;
    setSaving(true);
    if (myProfile) {
      await supabase.from("networking_profiles").update({ full_name: form.full_name, organization: form.organization || null, bio: form.bio || null }).eq("id", myProfile.id);
    } else {
      await supabase.from("networking_profiles").insert({ user_id: user.id, full_name: form.full_name, organization: form.organization || null, bio: form.bio || null });
    }
    setSaving(false);
    setShowSetup(false);
    toast.success("Profile saved!");
    fetchProfiles();
    fetchMyProfile();
  };

  const sendConnection = async (recipientId: string) => {
    if (!user) return;
    await supabase.from("connections").insert({ requester_id: user.id, recipient_id: recipientId });
    toast.success("Connection request sent!");
    fetchConnections();
  };

  const acceptConnection = async (connId: string) => {
    await supabase.from("connections").update({ status: "accepted" }).eq("id", connId);
    toast.success("Connection accepted!");
    fetchConnections();
  };

  const sendMessage = async () => {
    if (!user || !chatWith || !msgText.trim()) return;
    await supabase.from("messages").insert({ sender_id: user.id, recipient_id: chatWith.user_id, content: msgText.trim() });
    setMsgText("");
  };

  const getConnectionStatus = (profileUserId: string) => {
    if (!user) return null;
    const conn = connections.find(
      (c) => (c.requester_id === user.id && c.recipient_id === profileUserId) ||
             (c.recipient_id === user.id && c.requester_id === profileUserId)
    );
    return conn || null;
  };

  const filtered = profiles.filter((p) =>
    !search || p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.organization || "").toLowerCase().includes(search.toLowerCase())
  );

  // Not logged in view
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container max-w-3xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              Networking <span className="text-gradient">Hub</span>
            </h1>
            <p className="text-muted-foreground mb-6">Connect with fellow attendees, speakers, and sponsors. Sign in to create your profile and start networking.</p>
            <Button onClick={() => toast.info("Please register first at /register, then log in.")} className="bg-primary text-primary-foreground">
              Sign In to Network
            </Button>
          </motion.div>

          {/* Still show profiles publicly */}
          <div className="mt-12">
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search attendees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <Card key={p.id} className="glass border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{p.full_name}</h3>
                        {p.organization && <p className="text-xs text-muted-foreground">{p.organization}</p>}
                      </div>
                    </div>
                    {p.bio && <p className="text-xs text-muted-foreground line-clamp-2">{p.bio}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat modal
  if (chatWith) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container max-w-2xl px-4">
          <Button variant="ghost" onClick={() => setChatWith(null)} className="mb-4">← Back to Profiles</Button>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">{chatWith.full_name}</h3>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${m.sender_id === user.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-muted-foreground text-sm">No messages yet. Say hello!</p>}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Input value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              <Button onClick={sendMessage} size="icon" className="bg-primary text-primary-foreground shrink-0"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3">
            Networking <span className="text-gradient">Hub</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Connect with fellow attendees, speakers, and sponsors.</p>
        </motion.div>

        {/* Profile setup/edit */}
        {(showSetup || !myProfile) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-display font-bold mb-4">{myProfile ? "Edit Profile" : "Create Your Profile"}</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <Input placeholder="Full Name *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              <Input placeholder="Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              <Textarea placeholder="Short bio..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">{saving ? "Saving..." : "Save Profile"}</Button>
            </form>
          </motion.div>
        )}

        {myProfile && !showSetup && (
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => setShowSetup(true)}>Edit Profile</Button>
          </div>
        )}

        {/* Pending connection requests */}
        {connections.filter((c) => c.recipient_id === user.id && c.status === "pending").length > 0 && (
          <div className="glass rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold mb-3">Pending Requests</h3>
            {connections.filter((c) => c.recipient_id === user.id && c.status === "pending").map((c) => {
              const requester = profiles.find((p) => p.user_id === c.requester_id);
              return (
                <div key={c.id} className="flex items-center justify-between py-2">
                  <span className="text-sm">{requester?.full_name || "Unknown"}</span>
                  <Button size="sm" onClick={() => acceptConnection(c.id)} className="bg-primary text-primary-foreground">Accept</Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or organization..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Profiles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.filter((p) => p.user_id !== user.id).map((p) => {
            const conn = getConnectionStatus(p.user_id);
            const isConnected = conn?.status === "accepted";
            const isPending = conn?.status === "pending";
            return (
              <Card key={p.id} className="glass border-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{p.full_name}</h3>
                      {p.organization && <p className="text-xs text-muted-foreground truncate">{p.organization}</p>}
                    </div>
                  </div>
                  {p.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.bio}</p>}
                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <Badge className="bg-primary/20 text-primary text-xs">Connected</Badge>
                        <Button size="sm" variant="outline" onClick={() => setChatWith(p)} className="ml-auto">
                          <MessageCircle className="w-3 h-3 mr-1" /> Chat
                        </Button>
                      </>
                    ) : isPending ? (
                      <Badge variant="secondary" className="text-xs">Pending</Badge>
                    ) : (
                      <Button size="sm" onClick={() => sendConnection(p.user_id)} className="bg-primary text-primary-foreground">
                        <UserPlus className="w-3 h-3 mr-1" /> Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.filter((p) => p.user_id !== user.id).length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">No profiles found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Networking;
