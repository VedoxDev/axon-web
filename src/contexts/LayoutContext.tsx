import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';

// Layout State Types
export interface LayoutState {
  sidebar: {
    isOpen: boolean;
    isPinned: boolean;
    selectedItem: string | null;
    width: number;
    collapsedWidth: number;
  };
  navigation: {
    activeView: 'home' | 'friends' | 'conversations';
    selectedChatId: string | null;
  };
  titlebar: {
    title: string;
    showBackButton: boolean;
    isElectron: boolean; // Will be useful for Electron transition
  };
  viewport: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
}

// Action Types
export type LayoutAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_PINNED'; payload: boolean }
  | { type: 'SET_SELECTED_MENU_ITEM'; payload: string | null }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'home' | 'friends' | 'conversations' }
  | { type: 'SET_SELECTED_CHAT'; payload: string | null }
  | { type: 'SET_TITLEBAR_TITLE'; payload: string }
  | { type: 'SET_TITLEBAR_BACK'; payload: boolean }
  | { type: 'SET_VIEWPORT'; payload: Partial<LayoutState['viewport']> }
  | { type: 'RESET_NAVIGATION' };

// Context Type
interface LayoutContextType {
  state: LayoutState;
  actions: {
    toggleSidebar: () => void;
    setSidebarPinned: (pinned: boolean) => void;
    selectMenuItem: (item: string | null) => void;
    setActiveView: (view: 'home' | 'friends' | 'conversations') => void;
    selectChat: (chatId: string | null) => void;
    setTitlebarTitle: (title: string) => void;
    setTitlebarBack: (show: boolean) => void;
    resetNavigation: () => void;
    updateViewport: (viewport: Partial<LayoutState['viewport']>) => void;
  };
}

// Initial State
const initialState: LayoutState = {
  sidebar: {
    isOpen: true,
    isPinned: false,
    selectedItem: null,
    width: 320, // 20rem in pixels - increased for better space
    collapsedWidth: 64, // 4rem in pixels
  },
  navigation: {
    activeView: 'home',
    selectedChatId: null,
  },
  titlebar: {
    title: 'Axon',
    showBackButton: false,
    isElectron: false, // Will be set to true in Electron environment
  },
  viewport: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  },
};

// Reducer
const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen },
      };

    case 'SET_SIDEBAR_PINNED':
      return {
        ...state,
        sidebar: { ...state.sidebar, isPinned: action.payload },
      };

    case 'SET_SELECTED_MENU_ITEM':
      // Auto-set titlebar title based on menu item
      let title = 'Axon';
      if (action.payload) {
        switch (action.payload) {
          case 'tasks': title = 'Tasks'; break;
          case 'calendar': title = 'Calendar'; break;
          case 'activity': title = 'Activity'; break;
          case 'files': title = 'Files'; break;
          case 'meetings': title = 'Meetings'; break;
          case 'announcements': title = 'Announcements'; break;
          case 'general-chat': title = 'General Chat'; break;
          case 'chat': title = 'Chat'; break;
          default: title = 'Axon';
        }
      }
      
      return {
        ...state,
        sidebar: { ...state.sidebar, selectedItem: action.payload },
        titlebar: { ...state.titlebar, title },
      };

    case 'SET_ACTIVE_VIEW':
      return {
        ...state,
        navigation: { ...state.navigation, activeView: action.payload },
      };

    case 'SET_SELECTED_CHAT':
      return {
        ...state,
        navigation: { ...state.navigation, selectedChatId: action.payload },
      };

    case 'SET_TITLEBAR_TITLE':
      return {
        ...state,
        titlebar: { ...state.titlebar, title: action.payload },
      };

    case 'SET_TITLEBAR_BACK':
      return {
        ...state,
        titlebar: { ...state.titlebar, showBackButton: action.payload },
      };

    case 'SET_VIEWPORT':
      return {
        ...state,
        viewport: { ...state.viewport, ...action.payload },
      };

    case 'RESET_NAVIGATION':
      return {
        ...state,
        sidebar: { ...state.sidebar, selectedItem: null },
        navigation: { activeView: 'home', selectedChatId: null },
        titlebar: { ...state.titlebar, title: 'Axon', showBackButton: false },
      };

    default:
      return state;
  }
};

// Context
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Provider Component
export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Actions
  const actions = useMemo(() => ({
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    setSidebarPinned: (pinned: boolean) => dispatch({ type: 'SET_SIDEBAR_PINNED', payload: pinned }),
    selectMenuItem: (item: string | null) => dispatch({ type: 'SET_SELECTED_MENU_ITEM', payload: item }),
    setActiveView: (view: 'home' | 'friends' | 'conversations') => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view }),
    selectChat: (chatId: string | null) => dispatch({ type: 'SET_SELECTED_CHAT', payload: chatId }),
    setTitlebarTitle: (title: string) => dispatch({ type: 'SET_TITLEBAR_TITLE', payload: title }),
    setTitlebarBack: (show: boolean) => dispatch({ type: 'SET_TITLEBAR_BACK', payload: show }),
    resetNavigation: () => dispatch({ type: 'RESET_NAVIGATION' }),
    updateViewport: (viewport: Partial<LayoutState['viewport']>) => dispatch({ type: 'SET_VIEWPORT', payload: viewport }),
  }), [dispatch]);

  const contextValue = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

// Custom Hook
export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Utility Hooks
export const useSidebar = () => {
  const { state, actions } = useLayout();
  return useMemo(() => ({
    ...state.sidebar,
    toggle: actions.toggleSidebar,
    setPinned: actions.setSidebarPinned,
    selectItem: actions.selectMenuItem,
  }), [state.sidebar, actions.toggleSidebar, actions.setSidebarPinned, actions.selectMenuItem]);
};

export const useNavigation = () => {
  const { state, actions } = useLayout();
  return useMemo(() => ({
    ...state.navigation,
    setActiveView: actions.setActiveView,
    selectChat: actions.selectChat,
    reset: actions.resetNavigation,
  }), [state.navigation, actions.setActiveView, actions.selectChat, actions.resetNavigation]);
};

export const useTitlebar = () => {
  const { state, actions } = useLayout();
  return useMemo(() => ({
    ...state.titlebar,
    setTitle: actions.setTitlebarTitle,
    setBackButton: actions.setTitlebarBack,
  }), [state.titlebar, actions.setTitlebarTitle, actions.setTitlebarBack]);
};

export const useViewport = () => {
  const { state, actions } = useLayout();
  return useMemo(() => ({
    ...state.viewport,
    update: actions.updateViewport,
  }), [state.viewport, actions.updateViewport]);
}; 