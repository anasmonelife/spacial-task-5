import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Users, MessageSquare, Loader2, UserCog, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminTeamManagement } from "@/components/admin/AdminTeamManagement";
import { TestimonialManagementSimple } from "@/components/admin/TestimonialManagementSimple";
import { TeamAdminManagement } from "@/components/admin/TeamAdminManagement";

interface SuperAdminUser {
  id: string;
  name: string;
  username: string;
}

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<SuperAdminUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user-management");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check super_admins table for credentials
      const { data, error } = await supabase
        .from('super_admins')
        .select('id, name, username, password_hash')
        .eq('username', username.trim())
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
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return;
      }

      const admin = data[0];
      // Simple password check (in production, use proper hashing)
      if (admin.password_hash === password.trim()) {
        setAdminUser({
          id: admin.id,
          name: admin.name,
          username: admin.username,
        });
        setIsAuthenticated(true);
        toast({
          title: "Login Successful",
          description: `Welcome, ${admin.name}!`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
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
    setAdminUser(null);
    setUsername("");
    setPassword("");
    toast({
      title: "Logged Out",
      description: "You have been logged out of Super Admin Panel",
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
            <CardTitle className="text-2xl font-bold">Super Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
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
                Super Admin Panel
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Welcome, {adminUser?.name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Admin Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div 
            className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "user-management" ? "scale-[1.02]" : ""}`} 
            onClick={() => setActiveTab("user-management")}
          >
            <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "user-management" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-3 bg-blue-50">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">User Management</CardTitle>
                </div>
                <CardDescription>
                  Manage all system users and roles
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div 
            className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "team-admin-control" ? "scale-[1.02]" : ""}`} 
            onClick={() => setActiveTab("team-admin-control")}
          >
            <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "team-admin-control" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-3 bg-green-50">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Team Admin Control</CardTitle>
                </div>
                <CardDescription>
                  Approve, edit, activate/deactivate admins
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div 
            className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeTab === "testimonials" ? "scale-[1.02]" : ""}`} 
            onClick={() => setActiveTab("testimonials")}
          >
            <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${activeTab === "testimonials" ? "border-primary shadow-xl bg-primary/10" : "border-border hover:border-primary/50 hover:shadow-lg"}`}>
              <CardHeader className="pb-3 bg-yellow-50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Testimonials</CardTitle>
                </div>
                <CardDescription>
                  Manage agent testimonial questions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Content Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="user-management">
            <AdminTeamManagement />
          </TabsContent>

          <TabsContent value="team-admin-control">
            <TeamAdminManagement />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManagementSimple />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdmin;