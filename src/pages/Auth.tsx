import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, Heart, Mail, Phone } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [tabSwitching, setTabSwitching] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);

    if (user) {
      navigate('/dashboard');
    }

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleTabChange = (value: string) => {
    setTabSwitching(true);
    setTimeout(() => {
      setTabSwitching(false);
      setError('');
      setMessage('');
      setOtpSent(false);
    }, 300);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for a confirmation link!');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        if (error.message.includes('Provider not found') || error.message.includes('Provider disabled')) {
          setError('Google authentication is not configured. Please enable Google provider in Supabase Dashboard > Authentication > Providers.');
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('Failed to connect with Google. Please check your configuration.');
    }
    setLoading(false);
  };

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true
        }
      });
      
      if (error) {
        if (error.message.includes('otp_disabled') || error.message.includes('Signups not allowed for otp')) {
          setError('Phone authentication is not configured. Please enable Phone provider and configure SMS in Supabase Dashboard > Authentication > Providers.');
        } else if (error.message.includes('SMS provider')) {
          setError('SMS service is not configured. Please set up Twilio or another SMS provider in Supabase Dashboard > Settings > Authentication.');
        } else {
          setError(error.message);
        }
      } else {
        setOtpSent(true);
        setMessage('OTP sent to your phone!');
      }
      setLoading(false);
    } else {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });
      
      if (error) {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: false
        }
      });
      
      if (error) {
        if (error.message.includes('otp_disabled') || error.message.includes('Signups not allowed for otp')) {
          setError('Phone authentication is not configured. Please enable Phone provider and configure SMS in Supabase Dashboard > Authentication > Providers.');
        } else if (error.message.includes('SMS provider')) {
          setError('SMS service is not configured. Please set up Twilio or another SMS provider in Supabase Dashboard > Settings > Authentication.');
        } else {
          setError(error.message);
        }
      } else {
        setOtpSent(true);
        setMessage('OTP sent to your phone!');
      }
      setLoading(false);
    } else {
      setLoading(true);
      setError('');
      
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });
      
      if (error) {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent!');
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full animate-pulse">
                <Shield className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <Skeleton className="h-6 w-24 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">LifeVault</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">Secure storage for your most important information</p>
        </div>

        <Card className="animate-scale-in">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center text-sm">
              Access your secure digital vault
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="signin" className="space-y-4" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <div className={`transition-all duration-300 ${tabSwitching ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                <TabsContent value="signin" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant={authMethod === 'email' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setAuthMethod('email');
                        setOtpSent(false);
                        setError('');
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={authMethod === 'phone' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setAuthMethod('phone');
                        setOtpSent(false);
                        setError('');
                      }}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Phone
                    </Button>
                  </div>

                  {authMethod === 'email' ? (
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <Button type="submit" className="w-full text-sm" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm"
                        onClick={handleForgotPassword}
                        disabled={loading}
                      >
                        Forgot Password?
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-phone" className="text-sm">Phone Number</Label>
                        <Input
                          id="signin-phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Auto-add +91 for Indian numbers if not present
                            if (value && !value.startsWith('+')) {
                              value = '+91' + value.replace(/^91/, '');
                            }
                            setPhone(value);
                          }}
                          required
                          disabled={otpSent}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      {otpSent && (
                        <div className="space-y-2 animate-fade-in">
                          <Label htmlFor="signin-otp" className="text-sm">Enter OTP</Label>
                          <Input
                            id="signin-otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            className="text-sm sm:text-base text-center tracking-widest"
                          />
                        </div>
                      )}
                      <Button type="submit" className="w-full text-sm" disabled={loading}>
                        {loading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : (otpSent ? 'Verify OTP' : 'Send OTP')}
                      </Button>
                    </form>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant={authMethod === 'email' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setAuthMethod('email');
                        setOtpSent(false);
                        setError('');
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={authMethod === 'phone' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setAuthMethod('phone');
                        setOtpSent(false);
                        setError('');
                      }}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Phone
                    </Button>
                  </div>

                  {authMethod === 'email' ? (
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <Button type="submit" className="w-full text-sm" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-sm">Phone Number</Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Auto-add +91 for Indian numbers if not present
                            if (value && !value.startsWith('+')) {
                              value = '+91' + value.replace(/^91/, '');
                            }
                            setPhone(value);
                          }}
                          required
                          disabled={otpSent}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      {otpSent && (
                        <div className="space-y-2 animate-fade-in">
                          <Label htmlFor="signup-otp" className="text-sm">Enter OTP</Label>
                          <Input
                            id="signup-otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            className="text-sm sm:text-base text-center tracking-widest"
                          />
                        </div>
                      )}
                      <Button type="submit" className="w-full text-sm" disabled={loading}>
                        {loading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : (otpSent ? 'Verify OTP' : 'Send OTP')}
                      </Button>
                    </form>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </TabsContent>
              </div>
            </Tabs>

            {error && (
              <Alert className="mt-4 animate-fade-in" variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="mt-4 animate-fade-in">
                <AlertDescription className="text-sm">{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs sm:text-sm text-muted-foreground animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
            <div className="flex items-center space-x-1">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Age-friendly design</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;