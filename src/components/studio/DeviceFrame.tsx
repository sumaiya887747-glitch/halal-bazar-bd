import React from 'react';
import { DeviceMode } from '../../types/website';

interface DeviceFrameProps {
  deviceMode: DeviceMode;
  children: React.ReactNode;
  isPreviewOnly: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceMode,
  children,
  isPreviewOnly,
}) => {
  if (isPreviewOnly || deviceMode === 'desktop') {
    return (
      <div className="w-full min-h-screen bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-neutral-100 py-8 px-4 flex justify-center items-start overflow-x-auto">
      {deviceMode === 'tablet' && (
        <div className="w-[768px] shrink-0 bg-white rounded-3xl shadow-2xl border-[10px] border-neutral-800 overflow-hidden ring-1 ring-neutral-900/10">
          <div className="h-6 bg-neutral-800 flex items-center justify-center">
            <div className="w-12 h-1 bg-neutral-600 rounded-full" />
          </div>
          <div className="max-h-[85vh] overflow-y-auto">
            {children}
          </div>
        </div>
      )}

      {deviceMode === 'mobile' && (
        <div className="w-[375px] shrink-0 bg-white rounded-4xl shadow-2xl border-[12px] border-neutral-900 overflow-hidden ring-1 ring-neutral-900/10">
          <div className="h-7 bg-neutral-900 flex items-center justify-center relative">
            <div className="w-20 h-4 bg-neutral-950 rounded-b-xl flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            </div>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            {children}
          </div>
          <div className="h-4 bg-neutral-900 flex items-center justify-center">
            <div className="w-24 h-1 bg-neutral-700 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};
