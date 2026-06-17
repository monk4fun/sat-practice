import React from 'react';
import { useFirebaseSync } from '../../hooks/useFirebaseSync';

export const SyncStatus: React.FC = () => {
  const { isConfigured, userId } = useFirebaseSync();

  if (!isConfigured) {
    return (
      <div title="Cloud sync disabled - set Firebase env variables to enable" className="text-xs text-gray-500">
        🌐 Local only
      </div>
    );
  }

  if (!userId) {
    return (
      <div title="Connecting to cloud..." className="text-xs text-yellow-600 animate-pulse">
        🔄 Connecting...
      </div>
    );
  }

  return (
    <div title="Progress synced to cloud" className="text-xs text-green-600">
      ☁️ Synced
    </div>
  );
};
