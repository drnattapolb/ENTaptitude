import React from 'react';
import { LandingPage } from './LandingPage';

interface WelcomeScreenProps {
  onSelectCandidate: () => void;
  onSelectCommittee: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectCandidate,
  onSelectCommittee
}) => {
  return (
    <LandingPage
      onStartAssessment={onSelectCandidate}
      onAdminLoginSuccess={onSelectCommittee}
    />
  );
};
