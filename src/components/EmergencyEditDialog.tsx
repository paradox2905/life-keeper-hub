import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, X } from 'lucide-react';
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

interface EmergencyEditDialogProps {
  type: 'contact' | 'medical' | 'insurance';
  data: EmergencyContact | MedicalInfo | InsuranceInfo;
  onSave: (data: any) => void;
}

const EmergencyEditDialog: React.FC<EmergencyEditDialogProps> = ({ type, data, onSave }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleSave = () => {
    onSave(formData);
    setIsOpen(false);
    toast({
      title: "Emergency Info Updated",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} information has been saved successfully.`,
    });
  };

  const handleArrayAdd = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev as any)[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const renderContactForm = () => {
    const contactData = formData as EmergencyContact;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={contactData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="relationship">Relationship</Label>
          <Input
            id="relationship"
            value={contactData.relationship}
            onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={contactData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={contactData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>
    );
  };

  const renderMedicalForm = () => {
    const medicalData = formData as MedicalInfo;
    const [newAllergy, setNewAllergy] = useState('');
    const [newCondition, setNewCondition] = useState('');
    const [newMedication, setNewMedication] = useState('');

    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Input
            id="bloodGroup"
            value={medicalData.bloodGroup}
            onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
            placeholder="e.g., A+, O-, AB+"
          />
        </div>

        <div>
          <Label>Allergies</Label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {medicalData.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive text-sm rounded-full"
                >
                  {allergy}
                  <button
                    onClick={() => handleArrayRemove('allergies', index)}
                    className="hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayAdd('allergies', newAllergy);
                    setNewAllergy('');
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  handleArrayAdd('allergies', newAllergy);
                  setNewAllergy('');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label>Medical Conditions</Label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {medicalData.conditions.map((condition, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning text-sm rounded-full"
                >
                  {condition}
                  <button
                    onClick={() => handleArrayRemove('conditions', index)}
                    className="hover:bg-warning/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add medical condition"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayAdd('conditions', newCondition);
                    setNewCondition('');
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  handleArrayAdd('conditions', newCondition);
                  setNewCondition('');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label>Current Medications</Label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {medicalData.medications.map((medication, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-info/10 text-info text-sm rounded-full"
                >
                  {medication}
                  <button
                    onClick={() => handleArrayRemove('medications', index)}
                    className="hover:bg-info/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Add medication"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayAdd('medications', newMedication);
                    setNewMedication('');
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  handleArrayAdd('medications', newMedication);
                  setNewMedication('');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInsuranceForm = () => {
    const insuranceData = formData as InsuranceInfo;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="provider">Insurance Provider</Label>
          <Input
            id="provider"
            value={insuranceData.provider}
            onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="policyNumber">Policy Number</Label>
          <Input
            id="policyNumber"
            value={insuranceData.policyNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="membershipId">Membership ID</Label>
          <Input
            id="membershipId"
            value={insuranceData.membershipId}
            onChange={(e) => setFormData(prev => ({ ...prev, membershipId: e.target.value }))}
          />
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'contact':
        return 'Edit Emergency Contact';
      case 'medical':
        return 'Edit Medical Information';
      case 'insurance':
        return 'Edit Insurance Information';
      default:
        return 'Edit Information';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover:animate-hover-glow">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {type === 'contact' && renderContactForm()}
          {type === 'medical' && renderMedicalForm()}
          {type === 'insurance' && renderInsuranceForm()}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyEditDialog;