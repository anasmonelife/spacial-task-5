import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ViewAnalyze } from "@/components/admin/ViewAnalyze";
import { PanchayathManagement } from "@/components/admin/PanchayathManagement";
import { AgentTestimonialAnalytics } from "@/components/admin/AgentTestimonialAnalytics";
import { PerformanceReport } from "@/components/admin/PerformanceReport";
import { TodoList } from "@/components/admin/TodoList";
import { ArrowLeft, Shield, BarChart3, MapPin, MessageSquare, TrendingDown, ListTodo, Phone, Loader2 } from "lucide-react";
import { DailyNoteCard } from "@/components/DailyNoteCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/authService";

interface AdminMember {
  id: string;
  name: string;
  mobile: string;
  is_approved: boolean | null;
  is_active: boolean | null;
}

const TeamAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("panchayath");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminMember, setAdminMember] = useState<AdminMember | null>(null);
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  // Get current user from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim()) {
      toast({
        title: "Mobile Required",
        description: "Please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check admin_members table for mobile number
      const { data, error } = await supabase
        .from('admin_members')
        .select('id, name, mobile, is_approved, is_active')
        .eq('mobile', mobile.trim())
        .limit(1);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to verify credentials",
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Not Found",
          description: "No team admin found with this mobile number",
          variant: "destructive",
        });
        return;
      }

      const member = data[0];

      // Check if approved
      if (!member.is_approved) {
        toast({
          title: "Not Approved",
          description: "Your account is pending approval. Please contact Super Admin.",
          variant: "destructive",
        });
        return;
      }

      // Check if active
      if (!member.is_active) {
        toast({
          title: "Account Inactive",
          description: "Your account has been deactivated. Please contact Super Admin.",
          variant: "destructive",
        });
        return;
      }

      setAdminMember(member);
      setIsAuthenticated(true);
      
      // Also set currentUser for compatibility with other components
      const userObj: User = {
        id: member.id,
        name: member.name,
        mobile_number: member.mobile,
        role: 'admin_member',
        table: 'admin_members',
        hasAdminAccess: true,
      };
      setCurrentUser(userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));

      toast({
        title: "Login Successful",
        description: `Welcome, ${member.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminMember(null);
    setMobile("");
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged Out",
      description: "You have been logged out of Team Admin Panel",
    });
    navigate("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Team Admin Login</CardTitle>
            <CardDescription>
              Enter your registered mobile number to access the panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => navigate("/")} className="text-sm">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Team Admin Panel
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Welcome, {adminMember?.name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Daily Notes for Team Members */}
        {currentUser && (
          <div className="mb-6">
            <DailyNoteCard currentUser={currentUser} />
          </div>
        )}

        {/* Admin Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "panchayath" ? "scale-[1.02]" : ""}`} onClick={() => setActiveTab("panchayath")}>
            <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "panchayath" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-coordinator/10 border border-coordinator/20">
                    <MapPin className="h-6 w-6 text-coordinator" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold mb-1">Panchayath</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">പഞ്ചായത്ത് ചേർക്കാൻ</p>
                    <CardDescription className="text-xs">
                      Create and manage panchayaths
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "analytics" ? "scale-[1.02]" : ""}`} onClick={() => setActiveTab("analytics")}>
            <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "analytics" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-supervisor/10 border border-supervisor/20">
                    <BarChart3 className="h-6 w-6 text-supervisor" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold mb-1">Hierarchy View</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">ശ്രേണി കാണാൻ</p>
                    <CardDescription className="text-xs">
                      View panchayath analytics and hierarchy
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "testimonials" ? "scale-[1.02]" : ""}`} onClick={() => setActiveTab("testimonials")}>
            <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "testimonials" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-accent/10 border border-accent/20">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold mb-1">Testimonials</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">അനുമാന ചോദ്യങ്ങളും ഉത്തരങ്ങളും</p>
                    <CardDescription className="text-xs">
                      View agent testimonials and feedback
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "performance" ? "scale-[1.02]" : ""}`} onClick={() => setActiveTab("performance")}>
            <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "performance" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-pro/10 border border-pro/20">
                    <TrendingDown className="h-6 w-6 text-pro" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold mb-1">Performance</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">ഏജൻ്റുമാരുടെ പ്രകടന റിപ്പോർട്ടുകൾ</p>
                    <CardDescription className="text-xs">
                      View panchayath performance reports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "todo" ? "scale-[1.02]" : ""}`} onClick={() => setActiveTab("todo")}>
            <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "todo" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-group-leader/10 border border-group-leader/20">
                    <ListTodo className="h-6 w-6 text-group-leader" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold mb-1">Todo List</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">ചെയ്യേണ്ട കാര്യങ്ങൾ</p>
                    <CardDescription className="text-xs">
                      Manage tasks and to-do items
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Content Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="panchayath">
            <PanchayathManagement />
          </TabsContent>
          
          <TabsContent value="analytics">
            <ViewAnalyze />
          </TabsContent>

          <TabsContent value="testimonials">
            <AgentTestimonialAnalytics />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceReport />
          </TabsContent>

          <TabsContent value="todo">
            <TodoList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamAdmin;