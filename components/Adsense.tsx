import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdsenseProps {
    adSlot: string;
    adFormat?: string;
    responsive?: boolean;
    style?: React.CSSProperties;
}

const Adsense: React.FC<AdsenseProps> = ({ adSlot, adFormat = 'auto', responsive = true, style = { display: 'block' } }) => {
    const adRef = useRef<HTMLModElement>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // This function attempts to push the ad if the container is ready.
        const tryPushAd = () => {
            const adElement = adRef.current;
            // Check if the ad element exists and has a calculated width in the layout.
            // This is the key to fixing "availableWidth=0".
            if (adElement && adElement.offsetWidth > 0) {
                // If it's ready, clear the interval so we only push once.
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                // Push the ad.
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                } catch (err) {
                    console.error("AdSense error on push:", err);
                }
            }
        };

        // When the component re-renders (e.g., for a new ad slot), clear any old interval.
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Start polling every 200ms to check if the ad container is ready.
        // This is much more reliable than a single, fixed-duration timeout.
        intervalRef.current = window.setInterval(tryPushAd, 200);

        // A "watchdog" timer to prevent the interval from running forever if the ad slot never becomes visible.
        const watchdog = setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.warn(`AdSense: Timed out waiting for ad slot ${adSlot} to become visible.`);
            }
        }, 2000); // Stop trying after 2 seconds.

        // The cleanup function is crucial: it runs when the component unmounts.
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            clearTimeout(watchdog);
        };
    }, [adSlot]); // Re-run the effect if the adSlot prop changes.

    return (
        <div className="adsense-placeholder my-6 flex items-center justify-center bg-surface/50 border-2 border-dashed border-gray-600 min-h-[100px] text-text-secondary text-center p-4">
            <ins ref={adRef} className="adsbygoogle"
                style={style}
                data-ad-client="ca-pub-4837963602014382" 
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={responsive.toString()}>
            </ins>
        </div>
    );
};

export default Adsense;
