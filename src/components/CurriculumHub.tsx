import DigitalLibrary from './DigitalLibrary';

interface CurriculumHubProps {
  onNavigate?: (viewId: string) => void;
}

export default function CurriculumHub({ onNavigate }: CurriculumHubProps) {
  return <DigitalLibrary onNavigate={onNavigate} />;
}

