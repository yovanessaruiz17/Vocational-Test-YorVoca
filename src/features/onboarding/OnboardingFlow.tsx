import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationStep } from './components/LocationStep';
import { PreferencesStep } from './components/PreferencesStep';
import { useStudentStore } from '../../hooks/useStudentStore';

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateData } = useStudentStore();
  const [step, setStep] = useState(1);

  // If already complete, maybe redirect to dashboard?
  // But for testing, we can let them re-do it or add a "skip" button later.
  useEffect(() => {
    if (data.isComplete) {
      // In a real app we might redirect away if they accidentally land here
      // navigate('/dashboard');
    }
  }, [data.isComplete, navigate]);

  const handleLocationNext = (current: any, target: any, flex: any) => {
    updateData({
      currentLocation: current,
      targetLocation: target,
      locationFlexibility: flex,
    });
    setStep(2);
  };

  const handlePreferencesComplete = (modality: any, type: any, sector?: any) => {
    updateData({
      preferredModality: modality,
      preferredInstitutionType: type,
      preferredSector: sector ?? 'Cualquiera',
      isComplete: true,
    });
    // For Phase 2, we just show a success or go to a placeholder dashboard
    navigate('/test');
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
          
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        {step === 1 && (
          <LocationStep 
            initialCurrent={data.currentLocation}
            initialTarget={data.targetLocation}
            initialFlex={data.locationFlexibility}
            onNext={handleLocationNext}
          />
        )}
        {step === 2 && (
          <PreferencesStep 
            initialModality={data.preferredModality}
            initialType={data.preferredInstitutionType}
            initialSector={data.preferredSector ?? null}
            onBack={() => setStep(1)}
            onComplete={handlePreferencesComplete}
          />
        )}
      </div>
    </div>
  );
};
