"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, ExternalLink, Search, Wind, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';


// Helper function to check if a string is likely a URL
function isLikelyUrl(str: string): boolean {
    try {
        // Check if it parses as a URL
        new URL(str);
        // Further checks for common TLDs or localhost might be needed for robustness
        // Basic check: contains a dot or is localhost
        return str.includes('.') || str.startsWith('http://') || str.startsWith('https://') || str.includes('localhost');
    } catch (_) {
        // It didn't parse as a full URL, check simple patterns
        // Allow things like "example.com" without protocol
        return (str.includes('.') && !str.includes(' ') && !str.startsWith('data:')) || str.includes('localhost');
    }
}

export default function Home() {
  const [urlInput, setUrlInput] = useState<string>('');
  const [iframeSrc, setIframeSrc] = useState<string>('about:blank'); // Start with a blank page
  const [currentError, setCurrentError] = useState<string | null>(null); // State for error messages
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading indicator
  const iframeRef = useRef<HTMLIFrameElement>(null);

   // State for the initial search input (used only on the initial screen)
   const [initialSearchInput, setInitialSearchInput] = useState<string>('');

   // Function to handle search/navigation from the initial screen input
   const handleInitialGo = () => {
       setUrlInput(initialSearchInput); // Sync the main input first before navigating
       handleGoInternal(initialSearchInput); // Then perform the action using the initial input value
   };

   // Internal function to handle the actual navigation/search logic
   const handleGoInternal = (inputValue: string) => {
     setCurrentError(null); // Clear previous errors
     setIsLoading(true); // Set loading state
     let queryOrUrl = inputValue.trim();

     if (!queryOrUrl) {
       setIsLoading(false);
       return;
     }

     let targetUrl: string;
     let isSearch = false;

     // Check if input is likely a URL or a search term
     if (isLikelyUrl(queryOrUrl)) {
       // It looks like a URL
       targetUrl = queryOrUrl;
       // Add https:// if no protocol is specified and it's not localhost
       if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.includes('localhost')) {
         targetUrl = `https://${targetUrl}`;
         // Update input field only if we modified the user's input for URL correction
         setUrlInput(targetUrl); // Update header input
       } else if (targetUrl.includes('localhost') && !targetUrl.startsWith('http://')) {
         // Add http:// for localhost if missing
         targetUrl = `http://${targetUrl}`;
         setUrlInput(targetUrl); // Update header input
       }
       // Ensure urlInput reflects the final target URL if it was modified
       if (urlInput !== targetUrl) {
           setUrlInput(targetUrl);
       }
        // Sync initial input if it was the source
        if (inputValue === initialSearchInput && initialSearchInput !== targetUrl) {
             setInitialSearchInput(targetUrl);
        }

     } else {
       // Treat as a search query - Use Google
       isSearch = true;
       targetUrl = `https://www.google.com/search?q=${encodeURIComponent(queryOrUrl)}`;
       // Keep the search term in the input bar
       setUrlInput(queryOrUrl); // Update header input with the search term
       // Sync initial input if it was the source
       if (inputValue === initialSearchInput && initialSearchInput !== queryOrUrl) {
         setInitialSearchInput(queryOrUrl);
       }
     }

     console.log(`Navigating/Searching: ${targetUrl}`);
     setIframeSrc(targetUrl);
   };


  const handleGo = () => {
     handleGoInternal(urlInput); // Use the header input value
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGo();
    }
  };

  // Specific keydown handler for the initial search input
  const handleInitialKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
          handleInitialGo();
      }
  };


  const handleBack = () => {
    setCurrentError(null); // Clear error on navigation attempt
    setIsLoading(true);
    try {
        // Check if navigation is possible
        if (iframeRef.current?.contentWindow?.history?.length ?? 0 > 1) {
            iframeRef.current?.contentWindow?.history.back();
        } else {
             console.warn("Cannot navigate back: No history available or restricted.");
             setIsLoading(false); // Stop loading as navigation won't happen
        }
    } catch (e) {
        console.warn("Error navigating back:", e);
        // Use a more specific error message if possible
        setCurrentError("Cannot navigate back. This might be due to browser security restrictions or lack of history.");
        setIsLoading(false);
    }
    // onLoad/onError will handle setting isLoading back to false
  };

  const handleForward = () => {
    setCurrentError(null); // Clear error on navigation attempt
    setIsLoading(true);
     try {
        // Basic check if forward is possible conceptually
        iframeRef.current?.contentWindow?.history.forward();
     } catch(e) {
        console.warn("Error navigating forward:", e);
        setCurrentError("Cannot navigate forward. This might be due to browser security restrictions or lack of history.");
        setIsLoading(false);
     }
     // onLoad/onError will handle setting isLoading back to false
  };

  const handleRefresh = () => {
    setCurrentError(null); // Clear error on navigation attempt
    setIsLoading(true);
    if (iframeRef.current?.contentWindow && iframeSrc !== 'about:blank') {
      try {
        iframeRef.current.contentWindow.location.reload();
      } catch (error) {
        console.warn("Could not reload iframe:", error);
        // Fallback: reset src if reload fails due to cross-origin issues
        if (iframeRef.current?.src && iframeRef.current.src !== 'about:blank') {
           // Use key change to force reload
           const baseUrl = iframeSrc.split('#')[0]; // Get base URL without existing hash
           setIframeSrc(baseUrl + '#reload=' + Date.now()); // Append a changing hash
           // We need to clean the hash from urlInput if it got there
           setUrlInput(baseUrl); // Reset input to the base URL
           setInitialSearchInput(baseUrl); // Sync initial input too
        } else {
            setIsLoading(false);
        }
      }
    } else if (iframeRef.current?.src && iframeRef.current.src !== 'about:blank') {
       // Fallback if contentWindow is null or src is blank
       // Use key change to force reload
       const baseUrl = iframeSrc.split('#')[0]; // Get base URL without existing hash
       setIframeSrc(baseUrl + '#reload=' + Date.now()); // Append a changing hash
       setUrlInput(baseUrl); // Reset input to the base URL
       setInitialSearchInput(baseUrl); // Sync initial input too
    } else {
        // If no src or it's blank, stop loading
        setIsLoading(false);
    }
     // onLoad/onError will handle setting isLoading back to false
  };

  const handleIframeError = (event: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    // This error handler might be tricky as it often fires *before* a potential
    // X-Frame-Options block happens (which doesn't always trigger 'onerror').
    // We rely more on the onLoad potentially detecting a blocked frame (though imperfectly).
    console.error("Iframe loading error event:", event);
    // Avoid setting error if it's just the initial 'about:blank' or a programmatic navigation failure
    if (iframeSrc !== 'about:blank') {
        // Check if the error is specifically for Google search
        if (iframeSrc.startsWith('https://www.google.com/search')) {
             setCurrentError(`Google search results may not display correctly due to security restrictions. Try opening search results in a new tab.`);
        } else {
            // Generic error for other sites
             setCurrentError(`Error loading "${urlInput}". The website might be down, blocking embedding (X-Frame-Options/CSP), or refusing the connection. Try opening in a new tab.`);
        }
        setIsLoading(false);
    } else {
        setIsLoading(false); // Still stop loading for blank page errors
    }
  }

  const handleIframeLoad = () => {
      setIsLoading(false);
      // Attempt to update URL bar based on iframe's current location,
      // but this will likely fail for cross-origin frames due to security.
      let currentIframeUrl: string | null = null;
      let loadedSuccessfully = false;
      try {
          // Accessing contentWindow.location.href can throw cross-origin errors
          currentIframeUrl = iframeRef.current?.contentWindow?.location.href ?? null;
          loadedSuccessfully = true; // Assume success if we can access href

          // Check if the loaded content is effectively blank or an error page from the host
          // This is a basic check and might not catch all scenarios.
          // Some sites load a blank page (`about:blank`) before redirecting or rendering.
          // Some error pages might still have `contentDocument` accessible but show an error message.
          if (currentIframeUrl === 'about:blank' && iframeSrc !== 'about:blank') {
             // It loaded 'about:blank' unexpectedly, likely blocked.
             console.warn(`Iframe loaded 'about:blank' instead of '${iframeSrc}'. Assuming blocked.`);
             // Check if it was Google search that was blocked
             if (iframeSrc.startsWith('https://www.google.com/search')) {
                  setCurrentError(`Google search results cannot be displayed directly due to security restrictions. Try opening search results in a new tab.`);
             } else {
                 setCurrentError(`Failed to load "${urlInput}". The website likely prevents embedding (X-Frame-Options or CSP). Try opening in a new tab.`);
             }
             // Reset src to avoid confusion
             setIframeSrc('about:blank');
             // Keep the user's intended URL or search term in the input
             // Find the original intended target before potential redirects
             const originalTarget = iframeSrc.split('#')[0];
             if (!originalTarget.startsWith('https://www.google.com/search')) {
                 setUrlInput(originalTarget);
                 setInitialSearchInput(originalTarget);
             } else {
                 // If it was a search, urlInput should already hold the term
                 // Make sure initialSearchInput also holds the term
                 setInitialSearchInput(urlInput);
             }
             return; // Stop further processing for this load event
          }


          // If accessible and not a search results page, update the input bar
          if (currentIframeUrl && currentIframeUrl !== 'about:blank' && !currentIframeUrl.startsWith('https://www.google.com/')) {
             // Clean the reload hash if present
             let cleanUrl = currentIframeUrl.includes('#reload=')
                 ? currentIframeUrl.substring(0, currentIframeUrl.indexOf('#reload='))
                 : currentIframeUrl;

             // Update input only if the loaded URL is different from what the user typed
             // or the explicitly set iframe source (cleaned). This avoids unnecessary updates
             // during internal redirects on the loaded page.
             const originalTarget = iframeSrc.split('#')[0];
             if (cleanUrl !== urlInput && cleanUrl !== originalTarget) {
                 setUrlInput(cleanUrl);
                 setInitialSearchInput(cleanUrl);
                 // Don't setIframeSrc here, as that could cause loops if the site redirects again.
             } else if (cleanUrl === originalTarget && urlInput !== originalTarget) {
                 // If the iframe finally loaded the intended target, sync the input bar
                 setUrlInput(originalTarget);
                 setInitialSearchInput(originalTarget);
             }
          } else if (iframeSrc !== 'about:blank' && !iframeSrc.startsWith('https://www.google.com/search')) {
             // If we couldn't access the URL (cross-origin) or it's a search page,
             // ensure the input bar shows the URL we *intended* to load (cleaned).
             const sourceToShow = iframeSrc.split('#')[0];
             if (urlInput !== sourceToShow) {
                setUrlInput(sourceToShow);
                setInitialSearchInput(sourceToShow);
             }
          } else if (iframeSrc.startsWith('https://www.google.com/search')) {
             // If it's a Google search, keep the search term in the urlInput
             // urlInput should have been set correctly in handleGoInternal
             // Ensure initialSearchInput also holds the search term
             if (initialSearchInput !== urlInput) {
                 setInitialSearchInput(urlInput);
             }
          }
          // If load was successful (or seemed successful), clear any previous errors
          // Exception: Keep Google search warning if it's specifically about Google.
          if (loadedSuccessfully) {
              if (!iframeSrc.startsWith('https://www.google.com/search')) {
                  setCurrentError(null);
              } else if (currentError?.startsWith('Google search results')) {
                  // Keep the google search error/warning if it was already set
              } else {
                  // Clear other errors if google search loaded successfully initially
                  setCurrentError(null);
              }
          }

      } catch (e) {
          // Cross-origin restriction likely occurred
          console.warn("Cross-origin restriction: Cannot access iframe's location.href or document.");
          loadedSuccessfully = false; // Mark as failed due to cross-origin

          // If we intended to load a specific site (not search), assume it might be blocked
          if (iframeSrc !== 'about:blank' && !iframeSrc.startsWith('https://www.google.com/search')) {
             setCurrentError(`Could not fully load "${urlInput}". The website might prevent embedding or interaction due to security policies (like X-Frame-Options or CSP). Try opening in a new tab.`);
          } else if (iframeSrc.startsWith('https://www.google.com/search')) {
             // Specifically handle potentially blocked Google search - show a milder warning
             setCurrentError(`Google search results may not display correctly due to security restrictions. Try opening search results in a new tab.`);
             // Don't clear the iframe for google search, let it attempt to display
          }
          // Keep the input bar showing the intended destination or search term
           const sourceToShow = iframeSrc.split('#')[0];
           if (!sourceToShow.startsWith('https://www.google.com/search')) { // Don't show google search URL if blocked
               setUrlInput(sourceToShow);
                setInitialSearchInput(sourceToShow);
           } else {
               // Keep the search term if Google was potentially blocked
               // urlInput already holds the search term in this case
               // initialSearchInput should also hold the search term
               if (initialSearchInput !== urlInput) {
                  setInitialSearchInput(urlInput);
               }
           }
      }
  }

  // Function to open current URL in a new tab
  const openInNewTab = () => {
    let urlToOpen = iframeSrc.split('#')[0]; // Use the current iframe source (cleaned)
    let isUserSearch = !isLikelyUrl(urlInput) && urlInput.trim() !== '';

    if (!urlToOpen || urlToOpen === 'about:blank') {
        // If iframe source is blank/invalid, try the input bar's content
        urlToOpen = urlInput.trim();
         // Add protocol if missing for the input bar content
        if (urlToOpen && !isUserSearch && !urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://') && !urlToOpen.includes('localhost')) {
            urlToOpen = `https://${urlToOpen}`;
        } else if (urlToOpen && urlToOpen.includes('localhost') && !urlToOpen.startsWith('http://')) {
             urlToOpen = `http://${urlToOpen}`;
        }
    }

    // If the user just entered a search query in the input bar OR the current iframe src is a google search
    if (isUserSearch || iframeSrc.startsWith('https://www.google.com/search')) {
       window.open(`https://www.google.com/search?q=${encodeURIComponent(urlInput)}`, '_blank', 'noopener,noreferrer');
    }
    // Otherwise, open the URL currently intended (either from iframe or input)
    else if (urlToOpen && urlToOpen !== 'about:blank') {
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    } else {
        console.warn("No valid URL to open in new tab.");
        // Optionally, show a toast message
    }
  };


  return (
    <TooltipProvider>
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center p-2 border-b bg-card shadow-sm gap-1 md:gap-2">
        {/* Navigation Buttons */}
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Back">
                  <ArrowLeft />
                </Button>
            </TooltipTrigger>
            <TooltipContent><p>Back</p></TooltipContent>
        </Tooltip>
         <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleForward} aria-label="Forward">
                  <ArrowRight />
                </Button>
            </TooltipTrigger>
            <TooltipContent><p>Forward</p></TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh" disabled={isLoading || iframeSrc === 'about:blank'}>
                    <RefreshCw className={cn('transition-transform', isLoading ? 'animate-spin' : '')} />
                </Button>
            </TooltipTrigger>
             <TooltipContent><p>Refresh</p></TooltipContent>
        </Tooltip>

        {/* Address/Search Bar */}
        <div className="flex-grow relative flex items-center">
          <Input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Google or enter address"
            className="flex-grow bg-input focus:ring-primary focus:border-primary text-sm md:text-base pl-3 pr-10" // Added padding for button
            aria-label="Address and Search Bar"
          />
          <Button
            onClick={handleGo}
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={isLoading || !urlInput.trim()}
            aria-label="Go or Search"
          >
            <Search />
          </Button>
         </div>

         {/* Open in New Tab Button */}
         <Tooltip>
            <TooltipTrigger asChild>
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={openInNewTab}
                    aria-label="Open in new tab"
                    disabled={isLoading || (!urlInput.trim() && (!iframeSrc || iframeSrc === 'about:blank'))}
                  >
                    <ExternalLink />
                </Button>
            </TooltipTrigger>
             <TooltipContent><p>Open current page or search in new tab</p></TooltipContent>
        </Tooltip>
      </header>

      {/* Error Display Area */}
       {currentError && (
        <Alert variant="destructive" className="m-2 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Website Loading Issue</AlertTitle>
            <AlertDescription>
                {currentError}
                <br />
                {(currentError.includes('embedding') || currentError.includes('security restrictions') || currentError.includes('X-Frame-Options') || currentError.includes('CSP') || currentError.includes('refusing the connection')) && (
                  <small>Try using the "Open in new tab" button <ExternalLink className="inline h-3 w-3" /></small>
                )}
                 {currentError.includes('Google search results') && (
                   <small>Google often blocks search results in iframes. Use the "Open in new tab" button <ExternalLink className="inline h-3 w-3" /> for the best experience.</small>
                 )}
            </AlertDescription>
        </Alert>
      )}

      <main className="flex-grow overflow-hidden relative border-t">
         {/* Loading Overlay */}
         {isLoading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 animate-fadeIn">
                <RefreshCw className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-2 text-lg font-medium">Loading...</span>
            </div>
          )}
          {/* Initial state message */}
         {!isLoading && iframeSrc === 'about:blank' && !currentError && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-0 text-muted-foreground p-4 text-center">
                {/* Large Logo - Adjusted size for smaller screens */}
                <div className="mb-4 sm:mb-6 flex items-center text-primary">
                   <Wind strokeWidth={1.5} className="mr-2 sm:mr-3 h-[60px] w-[60px] sm:h-[80px] sm:w-[80px]" />
                   <span className="text-4xl sm:text-6xl font-bold tracking-tight">SurfEasy</span>
                </div>
                {/* Initial Search Bar - Adjusted width and styles */}
                 <div className="w-full max-w-md sm:max-w-xl relative flex items-center">
                    <Input
                        type="text"
                        value={initialSearchInput} // Use dedicated state for initial input
                        onChange={(e) => setInitialSearchInput(e.target.value)} // Update dedicated state
                        onKeyDown={handleInitialKeyDown} // Use dedicated keydown handler
                        placeholder="Search Google or enter address"
                        className="w-full bg-input focus:ring-primary focus:border-primary text-sm md:text-base pl-3 pr-10 shadow-sm"
                        aria-label="Initial Search or Address Bar"
                      />
                      <Button
                        onClick={handleInitialGo} // Use dedicated click handler
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                        disabled={isLoading || !initialSearchInput.trim()}
                        aria-label="Go or Search"
                      >
                        <Search />
                    </Button>
                 </div>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm">Enter a search term or website address to start browsing.</p>
             </div>
         )}
        <iframe
          ref={iframeRef}
          key={iframeSrc.split('#')[0]}
          src={iframeSrc}
          title="SurfEasy Webpage View"
          className={cn(
            'w-full h-full border-0 transition-opacity duration-300',
            isLoading || (iframeSrc === 'about:blank' && !currentError) ? 'opacity-0' : 'opacity-100'
          )} // Hide iframe when loading or truly blank (no error shown)
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox" // Added sandbox attribute
        />
      </main>
    </div>
    </TooltipProvider>
  );
}