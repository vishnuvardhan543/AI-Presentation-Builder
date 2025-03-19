import { createContext, useContext, useState, useEffect } from "react";
import { socket, joinSession, updateSlide } from "../lib/socket";

const PresentationContext = createContext(undefined);

export function PresentationProvider({ children }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isCollaborating, setIsCollaborating] = useState(false);

  useEffect(() => {
    if (isCollaborating) {
      socket.connect();
    } else {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isCollaborating]);

  // Handle incoming slide updates
  useEffect(() => {
    socket.on("slide_update", ({ slideIndex, content }) => {
      setSlides((prev) => {
        const newSlides = [...prev];
        newSlides[slideIndex] = content;
        return newSlides;
      });
    });
  }, []);

  const updateCurrentSlide = (index) => {
    setCurrentSlide(index);
  };

  const updateSlideContent = (index, content) => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[index] = content;
      return newSlides;
    });
    if (isCollaborating && sessionId) {
      updateSlide(sessionId, index, content);
    }
  };

  const startCollaboration = () => {
    const newSessionId = Math.random().toString(36).substring(7);
    setSessionId(newSessionId);
    setIsCollaborating(true);
    joinSession(newSessionId);
  };

  const stopCollaboration = () => {
    setSessionId(null);
    setIsCollaborating(false);
  };

  return (
    <PresentationContext.Provider
      value={{
        slides,
        currentSlide,
        sessionId,
        isCollaborating,
        updateCurrentSlide,
        updateSlideContent,
        startCollaboration,
        stopCollaboration,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
}

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (context === undefined) {
    throw new Error("usePresentation must be used within a PresentationProvider");
  }
  return context;
};
