import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class HapticsManager {
  private static isCapacitorAvailable = false;

  static {
    // Check if we're running in a Capacitor environment
    this.isCapacitorAvailable = typeof window !== 'undefined' && 
      window.Capacitor && 
      window.Capacitor.isNativePlatform();
  }

  /**
   * Trigger a light haptic feedback for subtle interactions
   */
  static async light() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  /**
   * Trigger a medium haptic feedback for standard interactions
   */
  static async medium() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  /**
   * Trigger a heavy haptic feedback for important interactions
   */
  static async heavy() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  /**
   * Trigger a selection haptic feedback for UI selections
   */
  static async selection() {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.selectionStart();
      setTimeout(() => Haptics.selectionEnd(), 50);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  /**
   * Trigger a notification haptic feedback
   */
  static async notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!this.isCapacitorAvailable) return;
    
    try {
      await Haptics.notification({ 
        type: type.toUpperCase() as any
      });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }
}