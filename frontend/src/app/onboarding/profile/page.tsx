'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitProfile } from '@/services/onBoardingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCircle, GraduationCap, BookOpen } from 'lucide-react';

// --- DATA CONSTANTS ---
const UNIVERSITIES = [
  "HCMC University of Technology (HCMUT)",
  "HCMC University of Economics (UEH)",
  "RMIT University Vietnam",
  "University of Science HCMC (HCMUS)",
  "FPT University HCMC",
  "HCMC University of Social Sciences and Humanities",
  "HCMC University of Architecture",
  "HCMC University of Foreign Languages (HUFLIT)",
  "HCMC Banking University",
  "HCMC University of Fine Arts",
  "University of Medicine and Pharmacy HCMC",
  "Van Lang University",
  "Ton Duc Thang University",
  "Other"
];

const MAJORS = [
  "Computer Science / IT",
  "Business Administration",
  "Marketing",
  "International Business",
  "Graphic Design",
  "Architecture",
  "Finance & Banking",
  "English Linguistics",
  "Medicine / Pharmacy",
  "Psychology",
  "Logistics",
  "Law",
  "Other"
];

export default function ProfileSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    university: '',
    major: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.university || !formData.major || !formData.gender) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await submitProfile({
        ...formData,
        age: parseInt(formData.age)
      });
      router.push('/test');
    } catch (error) {
      console.error(error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to update state
  const setField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Logo size="lg" />
        <h1 className="text-2xl font-bold mt-4 text-gray-900">Welcome to FitNest!</h1>
        <p className="text-muted-foreground">Let's build your profile so others can find you.</p>
      </div>

      <Card className="max-w-xl w-full p-8 shadow-xl border-gray-100 animate-in zoom-in-95 duration-500">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 uppercase tracking-wider">
              <UserCircle className="w-4 h-4" /> Basic Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Full Name</label>
                <Input 
                  required 
                  placeholder="e.g. Nguyen Van A" 
                  value={formData.full_name}
                  onChange={e => setField('full_name', e.target.value)}
                  className="bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Age</label>
                <Input 
                  required 
                  type="number" 
                  min="16" max="99"
                  placeholder="e.g. 21" 
                  value={formData.age}
                  onChange={e => setField('age', e.target.value)}
                  className="bg-gray-50/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Gender</label>
              <Select onValueChange={(val) => setField('gender', val)} required>
                <SelectTrigger className="bg-gray-50/50">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 2: Academic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" /> Education
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">University</label>
                <Select onValueChange={(val) => setField('university', val)} required>
                  <SelectTrigger className="bg-gray-50/50">
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {UNIVERSITIES.map(uni => (
                      <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Major</label>
                <Select onValueChange={(val) => setField('major', val)} required>
                  <SelectTrigger className="bg-gray-50/50">
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {MAJORS.map(major => (
                      <SelectItem key={major} value={major}>{major}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 3: Bio */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> About Me
            </h3>
            <Textarea 
              placeholder="Tell us about your hobbies, lifestyle, or what kind of roommate you are looking for..." 
              className="h-24 resize-none bg-gray-50/50"
              value={formData.bio}
              onChange={e => setField('bio', e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? 'Saving Profile...' : 'Continue to Personality Test'}
          </Button>

        </form>
      </Card>
    </div>
  );
}