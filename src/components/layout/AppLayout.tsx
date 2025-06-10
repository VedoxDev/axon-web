import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLayout, useTitlebar, useViewport } from '../../contexts/LayoutContext';
import { generateCSSVariables } from '../../styles/design-system';

interface AppLayoutProps {
  children: ReactNode;
  titlebarContent?: ReactNode;
  sidebarContent?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  titlebarContent, 
  sidebarContent 
}) => {
  const { state } = useLayout();
  const { isElectron } = useTitlebar();
  const { update: updateViewport } = useViewport();

  // Handle viewport detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      updateViewport({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Initial check
    handleResize();

    // Listen for resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateViewport]);

  // Generate CSS variables based on environment
  const cssVariables = generateCSSVariables(isElectron);

  // Dynamic CSS for the layout
  const layoutStyles = `
    ${cssVariables}

    /* Core Layout Grid */
    .app-layout {
      display: grid;
      grid-template-areas: 
        "titlebar titlebar"
        "sidebar main";
      grid-template-rows: var(--titlebar-height) 1fr;
      grid-template-columns: ${state.sidebar.isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)'} 1fr;
      height: 100vh;
      overflow: hidden;
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      transition: grid-template-columns var(--transition-normal);
    }

    /* Titlebar Area - Electron Ready */
    .layout-titlebar {
      grid-area: titlebar;
      background: var(--color-bg-primary);
      border-bottom: 1px solid var(--color-border-subtle);
      display: flex;
      align-items: center;
      position: relative;
      z-index: var(--z-titlebar);
      ${isElectron ? `
        /* Electron-specific titlebar styles */
        -webkit-app-region: drag;
        height: var(--titlebar-height);
        
        /* Make buttons and interactive elements non-draggable */
        .titlebar-button,
        .titlebar-interactive {
          -webkit-app-region: no-drag;
        }
      ` : ''}
    }

    /* Sidebar Area */
    .layout-sidebar {
      grid-area: sidebar;
      background: var(--color-bg-secondary);
      border-right: 1px solid var(--color-border-subtle);
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: var(--z-sidebar);
      transition: width var(--transition-normal);
      overflow: hidden;
    }

    /* Main Content Area */
    .layout-main {
      grid-area: main;
      display: flex;
      flex-direction: column;
      min-height: 0; /* Critical for proper flex behavior */
      min-width: 0;
      position: relative;
      overflow: hidden;
    }

    /* Responsive Behavior */
    @media (max-width: 767px) {
      .app-layout {
        grid-template-areas: 
          "titlebar"
          "main";
        grid-template-columns: 1fr;
        grid-template-rows: var(--titlebar-height) 1fr;
      }

      .layout-sidebar {
        position: fixed;
        top: var(--titlebar-height);
        left: ${state.sidebar.isOpen ? '0' : '-100%'};
        height: calc(100vh - var(--titlebar-height));
        width: var(--sidebar-width);
        z-index: var(--z-sidebar);
        transition: left var(--transition-normal);
        box-shadow: ${state.sidebar.isOpen ? '0 0 20px rgba(0,0,0,0.5)' : 'none'};
      }

      .layout-main {
        grid-area: main;
        margin-left: 0;
      }
    }

    /* Tablet optimizations */
    @media (min-width: 768px) and (max-width: 1023px) {
      .app-layout {
        grid-template-columns: ${state.sidebar.isOpen ? '320px' : '64px'} 1fr;
      }
    }

    /* Scrollbar styling */
    .layout-scrollable {
      scrollbar-width: thin;
      scrollbar-color: var(--color-border-default) transparent;
    }

    .layout-scrollable::-webkit-scrollbar {
      width: 6px;
    }

    .layout-scrollable::-webkit-scrollbar-track {
      background: transparent;
    }

    .layout-scrollable::-webkit-scrollbar-thumb {
      background: var(--color-border-default);
      border-radius: 3px;
    }

    .layout-scrollable::-webkit-scrollbar-thumb:hover {
      background: var(--color-border-strong);
    }

    /* Utility classes */
    .electron-drag-region {
      -webkit-app-region: drag;
    }

    .electron-no-drag {
      -webkit-app-region: no-drag;
    }

    /* Animation for sidebar collapse */
    .sidebar-transition {
      transition: all var(--transition-normal);
    }

    /* Focus management for accessibility */
    .layout-main:focus-within {
      outline: none;
    }
  `;

  return (
    <>
      <style>{layoutStyles}</style>
      <div className="app-layout" data-electron={isElectron}>
        {/* Titlebar */}
        <header className="layout-titlebar">
          {titlebarContent}
        </header>

        {/* Sidebar */}
        <aside className="layout-sidebar sidebar-transition">
          {sidebarContent}
        </aside>

        {/* Main Content */}
        <main className="layout-main">
          {children}
        </main>

        {/* Mobile overlay when sidebar is open */}
        {state.viewport.isMobile && state.sidebar.isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            style={{ top: 'var(--titlebar-height)' }}
            onClick={() => state.sidebar.isOpen && useLayout().actions.toggleSidebar()}
          />
        )}
      </div>
    </>
  );
};

export default AppLayout; 