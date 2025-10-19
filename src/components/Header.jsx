import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
import { HomeIcon, FileTextIcon, GearIcon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useApp } from '../state/AppContext.jsx';

export default function Header() {
  const location = useLocation();
  const { apiKey } = useApp();
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/letters', label: 'Letters', icon: FileTextIcon },
    { path: '/settings', label: 'Settings', icon: GearIcon }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* API Key Warning Banner */}
      {!apiKey && !dismissedWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 px-4 py-3 text-center relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              API key required for cover letter generation
            </span>
            <Link 
              to="/settings" 
              className="text-sm underline hover:no-underline font-semibold text-amber-900 dark:text-amber-100"
            >
              Add API Key
            </Link>
          </div>
          <button
            onClick={() => setDismissedWarning(true)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100"
            aria-label="Dismiss warning"
          >
            <Cross2Icon className="h-4 w-4" />
          </button>
        </div>
      )}

      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <FileTextIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Cover Letter Maker
              </span>
            </Link>

            {/* Navigation */}
            <NavigationMenu.Root>
              <NavigationMenu.List className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavigationMenu.Item key={item.path}>
                      <NavigationMenu.Link asChild>
                        <Link
                          to={item.path}
                          className={`group inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                            isActive(item.path)
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </NavigationMenu.Link>
                    </NavigationMenu.Item>
                  );
                })}
              </NavigationMenu.List>
            </NavigationMenu.Root>

            {/* API Key Status */}
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className="flex items-center space-x-2 cursor-default">
                    {apiKey ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Cross2Icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {apiKey ? 'Connected' : 'No API Key'}
                    </span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    align="end"
                    className="rounded-md bg-popover text-popover-foreground text-xs px-2 py-1 shadow-lg border"
                  >
                    {apiKey ? 'Your Gemini API key is set' : 'Set your Gemini API key in Settings'}
                    <Tooltip.Arrow className="fill-popover" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </header>
    </>
  );
}
