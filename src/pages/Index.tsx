import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Users, AlertTriangle, Heart, Briefcase, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-2 sm:px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full">
              <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
            Your Digital
            <span className="text-primary block">Life Vault</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Securely store your most important information and ensure your loved ones 
            can access it when they need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-2 sm:px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-primary/10 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">1. Store Securely</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Add your medical, legal, and digital information to your encrypted vault
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">2. Choose Trusted Contacts</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Select family members or friends who should have emergency access
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">3. Set Emergency Rules</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Configure when and how your contacts can access your information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 px-2 sm:px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  <span>Medical Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Store health records, medications, allergies, and emergency medical contacts
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <span>Legal Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Wills, insurance policies, financial accounts, and important legal papers
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  <span>Digital Assets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Passwords, cryptocurrency, online accounts, and digital property
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <span>Personal Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Contact information, family details, and personal preferences
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-2 sm:px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Protect What Matters Most</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 px-4">
            Join thousands who trust LifeVault with their most important information
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
            <Link to="/auth">Start Your Vault Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-2 sm:px-4 bg-muted">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
            Bank-level security • Age-friendly design • 24/7 emergency access
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">About</a>
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
