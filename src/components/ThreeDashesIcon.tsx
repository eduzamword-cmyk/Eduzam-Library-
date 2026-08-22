interface ThreeDashesIconProps {
  colorClass?: string;
  align?: 'left' | 'right';
}

export default function ThreeDashesIcon({ 
  colorClass = 'bg-slate-950', 
  align = 'left' 
}: ThreeDashesIconProps) {
  return (
    <div className={`flex flex-col justify-center ${align === 'right' ? 'items-end' : 'items-start'} gap-[3.5px] w-7 h-4 shrink-0 pointer-events-none`}>
      <span className={`w-7 h-[3.5px] ${colorClass} rounded-full block shrink-0`} />
      <span className={`w-7 h-[3.5px] ${colorClass} rounded-full block shrink-0`} />
      <span className={`w-3.5 h-[3.5px] ${colorClass} rounded-full block shrink-0`} />
    </div>
  );
}

