import React from 'react';
import { Home, Search, Settings, User } from 'lucide-react';

export function SimpleLucideTest() {
  const icons = [
    { Icon: Home, name: 'Home' },
    { Icon: Search, name: 'Search' },
    { Icon: Settings, name: 'Settings' },
    { Icon: User, name: 'User' }
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Direct Lucide Icons Test</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {icons.map(({ Icon, name }) => (
          <div key={name} className="flex flex-col items-center p-4 border rounded-lg">
            <Icon size={48} className="mb-2" />
            <span className="text-sm font-medium">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}