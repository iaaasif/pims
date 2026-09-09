import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';

export function useMobileSafeAreas() {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const setupSystemBars = async () => {
            try {
                // Status Bar Setup
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: 'transparent' });

                // Navigation Bar Setup (using @capgo/capacitor-navigation-bar for Cap 8 support)
                if (Capacitor.getPlatform() === 'android') {
                    try {
                        await NavigationBar.setNavigationBarColor({
                            color: '#ff9900', // Matches primary orange
                            darkButtons: true // Dark buttons look better on orange
                        });
                    } catch (e) {
                        console.warn('NavigationBar plugin failed:', e);
                    }
                }
            } catch (error) {
                console.warn('Capacitor plugins for system bars not available:', error);
            }
        };

        setupSystemBars();
    }, []);
}
