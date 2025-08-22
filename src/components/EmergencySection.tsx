import React, { useState } from 'react';
import { Phone, Mail, Printer, Heart, User, Shield, FileText, QrCode, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface MedicalInfo {
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  membershipId: string;
}

const EmergencySection: React.FC = () => {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // Mock data - replace with real data from your backend
  const emergencyContact: EmergencyContact = {
    name: "Dr. Sarah Johnson",
    relationship: "Primary Physician",
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@hospital.com"
  };

  const medicalInfo: MedicalInfo = {
    bloodGroup: "A+",
    allergies: ["Penicillin", "Shellfish"],
    conditions: ["Type 2 Diabetes", "Hypertension"],
    medications: ["Metformin", "Lisinopril"]
  };

  const insuranceInfo: InsuranceInfo = {
    provider: "HealthCare Plus",
    policyNumber: "HP-2024-789456",
    membershipId: "HC789456123"
  };

  const handleEmergencyCall = () => {
    setActiveAction('call');
    setTimeout(() => {
      window.open(`tel:${emergencyContact.phone}`);
      setActiveAction(null);
      toast({
        title: "Emergency Call Initiated",
        description: `Calling ${emergencyContact.name}`,
      });
    }, 1000);
  };

  const handleEmergencyMessage = () => {
    setActiveAction('message');
    setTimeout(() => {
      const message = `Emergency: This is an automated message from LifeVault. Please contact me immediately.`;
      window.open(`sms:${emergencyContact.phone}?body=${encodeURIComponent(message)}`);
      setActiveAction(null);
      toast({
        title: "Emergency Message Sent",
        description: `Message sent to ${emergencyContact.name}`,
      });
    }, 800);
  };

  const handlePrintEmergencyCard = () => {
    setActiveAction('print');
    setTimeout(() => {
      window.print();
      setActiveAction(null);
      toast({
        title: "Emergency Card Ready",
        description: "Emergency information ready to print",
      });
    }, 600);
  };

  const handleShowQRCode = () => {
    setShowQRCode(true);
    toast({
      title: "QR Code Generated",
      description: "Emergency profile QR code is now available",
    });
  };

  const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    variant: 'call' | 'message' | 'print';
    isActive: boolean;
  }> = ({ onClick, icon, label, variant, isActive }) => {
    const getVariantClasses = () => {
      if (isActive) {
        switch (variant) {
          case 'call':
            return 'bg-success text-success-foreground animate-flash border-success';
          case 'message':
            return 'bg-info text-info-foreground animate-slide-check border-info';
          case 'print':
            return 'bg-warning text-warning-foreground animate-slide-check border-warning';
        }
      }
      return 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border-border hover:animate-hover-glow';
    };

    return (
      <Button
        onClick={onClick}
        disabled={activeAction !== null}
        className={`relative overflow-hidden transition-all duration-300 ${getVariantClasses()} border-2`}
        size="lg"
      >
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
        {isActive && (
          <div className="absolute inset-0 bg-white/20 animate-ripple rounded-md" />
        )}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Emergency Button */}
      <div className="flex justify-center">
        <button
          onClick={handleEmergencyCall}
          className="relative w-48 h-48 rounded-full bg-emergency text-emergency-foreground font-bold text-xl transition-all duration-300 hover:scale-105 animate-pulse-glow shadow-2xl"
          disabled={activeAction !== null}
        >
          <div className="flex flex-col items-center justify-center h-full animate-heartbeat">
            <Heart className="w-12 h-12 mb-2" />
            <span>EMERGENCY</span>
            <span className="text-sm font-normal">Tap to Call</span>
          </div>
        </button>
      </div>

      {/* Emergency Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Emergency Contact */}
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-emergency" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{emergencyContact.name}</p>
              <p className="text-sm text-muted-foreground">{emergencyContact.relationship}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${emergencyContact.phone}`)}
                className="flex-1 hover:bg-success hover:text-success-foreground transition-colors"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`mailto:${emergencyContact.email}`)}
                className="flex-1 hover:bg-info hover:text-info-foreground transition-colors"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medical Details */}
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-emergency" />
              Medical Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-emergency">Blood Group: {medicalInfo.bloodGroup}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Allergies:</p>
              <div className="flex flex-wrap gap-1">
                {medicalInfo.allergies.map((allergy, index) => (
                  <span key={index} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Conditions:</p>
              <div className="flex flex-wrap gap-1">
                {medicalInfo.conditions.map((condition, index) => (
                  <span key={index} className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Info */}
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-info" />
              Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{insuranceInfo.provider}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Policy #</p>
              <p className="font-mono text-sm">{insuranceInfo.policyNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member ID</p>
              <p className="font-mono text-sm">{insuranceInfo.membershipId}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <ActionButton
          onClick={handleEmergencyCall}
          icon={<Phone className="w-5 h-5" />}
          label="Emergency Call"
          variant="call"
          isActive={activeAction === 'call'}
        />
        <ActionButton
          onClick={handleEmergencyMessage}
          icon={<Mail className="w-5 h-5" />}
          label="Send Message"
          variant="message"
          isActive={activeAction === 'message'}
        />
        <ActionButton
          onClick={handlePrintEmergencyCard}
          icon={<Printer className="w-5 h-5" />}
          label="Print Card"
          variant="print"
          isActive={activeAction === 'print'}
        />
      </div>

      {/* QR Code Export */}
      <div className="flex justify-center">
        {!showQRCode ? (
          <Button
            onClick={handleShowQRCode}
            variant="outline"
            className="hover:animate-hover-glow transition-all duration-300"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Generate Emergency QR Code
          </Button>
        ) : (
          <Card className="animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="w-20 h-20 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Scan to access emergency profile
              </p>
              <div className="flex items-center justify-center mt-2 text-success">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-sm">QR Code Generated</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmergencySection;