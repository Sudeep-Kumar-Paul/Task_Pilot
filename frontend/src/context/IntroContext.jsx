import React, { createContext, useCallback, useContext, useState } from "react";

const IntroContext = createContext({
  showIntro: true,
  manualReplay: false,
  dismissIntro: () => {},
  replayIntro: () => {},
});

export function IntroProvider({ children }) {
  const [showIntro, setShowIntro] = useState(true);
  const [manualReplay, setManualReplay] = useState(false);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    setManualReplay(false);
  }, []);

  const replayIntro = useCallback(() => {
    setManualReplay(true);
    setShowIntro(true);
  }, []);

  return (
    <IntroContext.Provider value={{ showIntro, manualReplay, dismissIntro, replayIntro }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
