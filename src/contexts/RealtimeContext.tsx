
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface RealtimeContextType {
  isRealtimeEnabled: boolean;
  disabledChannels: Set<string>;
  disableChannel: (channelName: string) => void;
  enableChannel: (channelName: string) => void;
  isChannelDisabled: (channelName: string) => boolean;
  setRealtimeEnabled: (enabled: boolean) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRealtimeEnabled, setRealtimeEnabled] = useState(true);
  const disabledChannelsRef = useRef(new Set<string>());
  const [, forceUpdate] = useState({});

  const disableChannel = useCallback((channelName: string) => {
    console.log(`🚫 Disabling problematic channel: ${channelName}`);
    disabledChannelsRef.current.add(channelName);
    forceUpdate({});
  }, []);

  const enableChannel = useCallback((channelName: string) => {
    console.log(`✅ Re-enabling channel: ${channelName}`);
    disabledChannelsRef.current.delete(channelName);
    forceUpdate({});
  }, []);

  const isChannelDisabled = useCallback((channelName: string) => {
    return disabledChannelsRef.current.has(channelName);
  }, []);

  return (
    <RealtimeContext.Provider value={{
      isRealtimeEnabled,
      disabledChannels: disabledChannelsRef.current,
      disableChannel,
      enableChannel,
      isChannelDisabled,
      setRealtimeEnabled
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtimeContext = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
};
