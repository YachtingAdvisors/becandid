interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

export default function MaterialIcon({ name, filled, className = '' }: MaterialIconProps) {
  return (
    <span className={`material-symbols-outlined ${filled ? 'material-symbols-filled' : ''} ${className}`}>
      {name}
    </span>
  );
}
