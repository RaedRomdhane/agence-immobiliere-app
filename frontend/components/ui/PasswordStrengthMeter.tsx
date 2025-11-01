import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;
    
    return Math.min(strength, 5);
  };

  const strength = calculateStrength(password);
  
  const getStrengthLabel = () => {
    if (strength === 0) return { label: 'Très faible', color: 'bg-red-500' };
    if (strength <= 2) return { label: 'Faible', color: 'bg-orange-500' };
    if (strength <= 3) return { label: 'Moyen', color: 'bg-yellow-500' };
    if (strength <= 4) return { label: 'Bon', color: 'bg-green-500' };
    return { label: 'Excellent', color: 'bg-green-600' };
  };

  if (!password) return null;

  const { label, color } = getStrengthLabel();

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded ${
              index < strength ? color : 'bg-gray-200'
            } transition-colors`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Force du mot de passe: <span className="font-medium">{label}</span>
      </p>
      <ul className="text-xs text-gray-600 space-y-1">
        <li className={password.length >= 8 ? 'text-green-600' : ''}>
          {password.length >= 8 ? '✓' : '○'} Au moins 8 caractères
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
          {/[A-Z]/.test(password) ? '✓' : '○'} Une majuscule
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
          {/[a-z]/.test(password) ? '✓' : '○'} Une minuscule
        </li>
        <li className={/\d/.test(password) ? 'text-green-600' : ''}>
          {/\d/.test(password) ? '✓' : '○'} Un chiffre
        </li>
        <li className={/[@$!%*?&]/.test(password) ? 'text-green-600' : ''}>
          {/[@$!%*?&]/.test(password) ? '✓' : '○'} Un caractère spécial (@$!%*?&)
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
