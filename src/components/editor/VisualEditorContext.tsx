import React, { createContext, useContext, useState } from 'react';
import { QuickEditTarget } from '../../types/admin';

interface VisualEditorContextType {
  isLivePreview: boolean;
  showEditIcons: boolean;
  setShowEditIcons: React.Dispatch<React.SetStateAction<boolean>>;
  openQuickEdit: (target: QuickEditTarget) => void;
  activeQuickEdit: QuickEditTarget | null;
  closeQuickEdit: () => void;
}

const VisualEditorContext = createContext<VisualEditorContextType>({
  isLivePreview: false,
  showEditIcons: false,
  setShowEditIcons: () => {},
  openQuickEdit: () => {},
  activeQuickEdit: null,
  closeQuickEdit: () => {},
});

export const useVisualEditor = () => useContext(VisualEditorContext);

interface VisualEditorProviderProps {
  children: React.ReactNode;
  isLivePreview: boolean;
}

export const VisualEditorProvider: React.FC<VisualEditorProviderProps> = ({
  children,
  isLivePreview,
}) => {
  const [showEditIcons, setShowEditIcons] = useState(false);
  const [activeQuickEdit, setActiveQuickEdit] = useState<QuickEditTarget | null>(null);

  const openQuickEdit = (target: QuickEditTarget) => {
    setActiveQuickEdit(target);
  };

  const closeQuickEdit = () => {
    setActiveQuickEdit(null);
  };

  return (
    <VisualEditorContext.Provider
      value={{
        isLivePreview,
        showEditIcons,
        setShowEditIcons,
        openQuickEdit,
        activeQuickEdit,
        closeQuickEdit,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
};
