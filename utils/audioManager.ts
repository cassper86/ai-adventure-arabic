/**
 * مدير الصوت المركزي
 *
 * مسؤول عن:
 * - إدارة مستوى الصوت العام للتطبيق
 * - حفظ واستعادة إعدادات الصوت
 * - التحكم في جميع العناصر الصوتية
 * - كتم/إلغاء كتم الصوت
 *
 * المميزات:
 * - تحكم مركزي في جميع الأصوات
 * - حفظ تلقائي للإعدادات في localStorage
 * - دعم HTMLAudioElement و Web Audio API
 */

class AudioManager {
  private masterVolume: number = 0.5;
  private isMuted: boolean = false;
  private audioElements: Set<HTMLAudioElement | AudioNode> = new Set();
  private gainNodes: Set<GainNode> = new Set();

  constructor() {
    // تحميل الإعدادات المحفوظة
    this.loadSettings();
  }

  // تحميل الإعدادات من localStorage
  private loadSettings() {
    const savedVolume = localStorage.getItem('ai-adventure-volume');
    const savedMuted = localStorage.getItem('ai-adventure-muted');

    if (savedVolume) {
      this.masterVolume = parseFloat(savedVolume);
    }
    if (savedMuted) {
      this.isMuted = JSON.parse(savedMuted);
    }
  }

  // حفظ الإعدادات في localStorage
  private saveSettings() {
    localStorage.setItem('ai-adventure-volume', this.masterVolume.toString());
    localStorage.setItem('ai-adventure-muted', this.isMuted.toString());
  }

  // الحصول على مستوى الصوت الحالي
  getVolume(): number {
    return this.isMuted ? 0 : this.masterVolume;
  }

  // الحصول على حالة الكتم
  getIsMuted(): boolean {
    return this.isMuted;
  }

  // إرسال حدث تغيير للإشعار بتغيير الإعدادات
  private notifyChange() {
    // إرسال custom event للإشعار بتغيير الإعدادات
    window.dispatchEvent(new CustomEvent('audioSettingsChanged'));
  }

  // تحديد مستوى الصوت الرئيسي
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.isMuted = this.masterVolume === 0;
    this.saveSettings();
    this.updateAllAudio();
    this.notifyChange();
  }

  // كتم/إلغاء كتم الصوت
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveSettings();

    // إذا تم الكتم، أوقف جميع الأصوات فوراً
    if (this.isMuted) {
      this.audioElements.forEach(audio => {
        if (audio instanceof HTMLAudioElement) {
          audio.pause();
        }
      });
    } else {
      // إذا تم إلغاء الكتم، استأنف جميع الأصوات
      this.audioElements.forEach(audio => {
        if (audio instanceof HTMLAudioElement && audio.paused) {
          audio.play().catch((error) => {
            console.warn('تعذر تشغيل الصوت:', error);
          });
        }
      });
    }

    this.updateAllAudio();
    this.notifyChange();
  }

  // إضافة عنصر صوتي للتحكم
  addAudioElement(element: HTMLAudioElement | AudioNode) {
    if (element instanceof HTMLAudioElement) {
      this.audioElements.add(element);
      element.volume = this.getVolume();
    } else if (element instanceof GainNode) {
      this.gainNodes.add(element);
      element.gain.setValueAtTime(this.getVolume(), element.context.currentTime);
    }
  }

  // إزالة عنصر صوتي
  removeAudioElement(element: HTMLAudioElement | AudioNode) {
    if (element instanceof HTMLAudioElement) {
      this.audioElements.delete(element);
    } else if (element instanceof GainNode) {
      this.gainNodes.delete(element);
    }
  }

  // تحديث جميع العناصر الصوتية
  private updateAllAudio() {
    const currentVolume = this.getVolume();

    // تحديث عناصر HTML Audio
    this.audioElements.forEach(audio => {
      if (audio instanceof HTMLAudioElement) {
        audio.volume = currentVolume;
      }
    });

    // تحديث GainNodes
    this.gainNodes.forEach(gainNode => {
      gainNode.gain.setValueAtTime(currentVolume, gainNode.context.currentTime);
    });
  }

  // إنشاء GainNode مع التحكم التلقائي
  createManagedGainNode(context: AudioContext): GainNode {
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(this.getVolume(), context.currentTime);
    this.addAudioElement(gainNode);
    return gainNode;
  }

  // تنظيف جميع العناصر الصوتية
  cleanup() {
    this.audioElements.clear();
    this.gainNodes.clear();
  }
}

// نسخة عامة من مدير الصوت
export const audioManager = new AudioManager();
