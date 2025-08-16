// utils/toast.ts
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

export async function showToast({ text }: { text: string }): Promise<void> {
    if (Capacitor.isNativePlatform()) {
        await Toast.show({ text });
    } else {
        // Fallback para web
        const toast = document.createElement('div');
        toast.textContent = text;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#333';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '10000';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
}