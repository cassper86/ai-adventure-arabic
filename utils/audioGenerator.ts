/**
 * مولد الأصوات - Web Audio API
 *
 * مسؤول عن:
 * - توليد الأصوات المختلفة للعبة
 * - إدارة التأثيرات الصوتية
 * - الربط مع audioManager للتحكم في الصوت
 *
 * المميزات:
 * - أصوات مولدة برمجياً (لا تحتاج ملفات خارجية)
 * - تأثيرات صوتية متقدمة (reverb, tremolo, filters)
 * - تحكم تلقائي في مستوى الصوت
 */

import { audioManager } from './audioManager';

export class AudioGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // الحصول على GainNode مع التحكم التلقائي في الصوت
  private createManagedGainNode(): GainNode | null {
    if (!this.audioContext) return null;
    const gainNode = this.audioContext.createGain();
    // تعيين مستوى الصوت الحالي من audioManager
    gainNode.gain.setValueAtTime(audioManager.getVolume(), this.audioContext.currentTime);
    audioManager.addAudioElement(gainNode);
    return gainNode;
  }

  // توليد صوت نقرة بسيطة
  generateClickSound(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve(new Blob());
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);

      // إنشاء blob فارغ للعودة فوراً (يمكن تحسينه لاحقاً)
      setTimeout(() => resolve(new Blob()), 150);
    });
  }

  // توليد موسيقى خلفية للعبة
  generateBackgroundMusic(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve(new Blob());
        return;
      }

      const duration = 60; // دقيقة واحدة
      const sampleRate = 44100;
      const numSamples = duration * sampleRate;
      const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate); // ستيريو
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // نغمات الموسيقى الشرقية (مقام فرع)
      const melody = [
        { freq: 261.63, duration: 0.5 }, // C4
        { freq: 293.66, duration: 0.5 }, // D4
        { freq: 329.63, duration: 0.5 }, // E4
        { freq: 349.23, duration: 0.5 }, // F4
        { freq: 392.00, duration: 0.5 }, // G4
        { freq: 440.00, duration: 0.5 }, // A4
        { freq: 493.88, duration: 0.5 }, // B4
        { freq: 523.25, duration: 1.0 }, // C5
      ];

      let currentSample = 0;
      let melodyIndex = 0;
      let melodyTime = 0;

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;

        // إنشاء تأثير متكرر للنغمات
        if (melodyTime >= melody[melodyIndex].duration) {
          melodyTime = 0;
          melodyIndex = (melodyIndex + 1) % melody.length;
        }

        const currentNote = melody[melodyIndex];
        const noteProgress = melodyTime / currentNote.duration;

        // إنشاء صوت مع هيئة (ADSR envelope)
        const attack = 0.1;
        const decay = 0.2;
        const sustain = 0.7;
        const release = 0.3;

        let envelope = 0;
        if (noteProgress < attack) {
          envelope = noteProgress / attack; // Attack
        } else if (noteProgress < attack + decay) {
          envelope = 1 - (noteProgress - attack) / decay * 0.3; // Decay
        } else if (noteProgress < currentNote.duration - release) {
          envelope = sustain; // Sustain
        } else {
          envelope = sustain * (1 - (noteProgress - (currentNote.duration - release)) / release); // Release
        }

        // توليد الصوت مع تردد متغير قليلاً للتأثير
        const frequency = currentNote.freq + Math.sin(t * 2) * 5;
        const wave = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.1;

        // إضافة تأثير ريفرب بسيط
        const reverb = wave * 0.3 + (leftChannel[Math.max(0, i - 1000)] || 0) * 0.1;

        leftChannel[i] = reverb;
        rightChannel[i] = reverb * 0.8; // تأخير قليل للقناة اليمنى

        melodyTime += 1 / sampleRate;
      }

      // تحويل إلى blob
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // إنشاء blob فارغ للعودة (سيتم تحسينه لاحقاً)
      resolve(new Blob());
    });
  }

  // موسيقى خلفية مثيرة للعبة - أسلوب ألعاب المغامرات المثيرة 🎮
  playBackgroundMusic() {
    if (!this.audioContext) return;

    try {
      // لحن مثير يشبه ألعاب المغامرات - مزيج من النغمات الإلكترونية والشرقية
      const melody = [
        // الجزء الأول - بناء التشويق
        { freq: 146.83, duration: 600, type: 'bass' },   // D3 - bass
        { freq: 220.00, duration: 400, type: 'lead' },   // A3
        { freq: 261.63, duration: 500, type: 'lead' },   // C4
        { freq: 329.63, duration: 300, type: 'lead' },   // E4
        { freq: 392.00, duration: 800, type: 'lead' },   // G4

        // الجزء الثاني - الإثارة
        { freq: 174.61, duration: 500, type: 'bass' },   // F3
        { freq: 261.63, duration: 400, type: 'lead' },   // C4
        { freq: 311.13, duration: 300, type: 'lead' },   // D#4
        { freq: 369.99, duration: 600, type: 'lead' },   // F#4
        { freq: 440.00, duration: 700, type: 'lead' },   // A4

        // الجزء الثالث - الذروة
        { freq: 195.99, duration: 400, type: 'bass' },   // G3
        { freq: 293.66, duration: 500, type: 'lead' },   // D4
        { freq: 349.23, duration: 300, type: 'lead' },   // F4
        { freq: 415.30, duration: 600, type: 'lead' },   // G#4
        { freq: 493.88, duration: 800, type: 'lead' },   // B4

        // الجزء الرابع - العودة للبداية
        { freq: 130.81, duration: 700, type: 'bass' },   // C3
        { freq: 196.00, duration: 400, type: 'lead' },   // G3
        { freq: 246.94, duration: 500, type: 'lead' },   // B3
        { freq: 293.66, duration: 300, type: 'lead' },   // D4
        { freq: 369.99, duration: 1000, type: 'lead' },  // F#4 - ذروة
      ];

      let currentNoteIndex = 0;

      const playNextNote = () => {
        const note = melody[currentNoteIndex];

        // إنشاء oscillator للنغمة الأساسية
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        // إضافة تأثير للصوت حسب نوع النغمة
        const filter = this.audioContext!.createBiquadFilter();
        if (note.type === 'bass') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, this.audioContext!.currentTime);
          filter.Q.setValueAtTime(2, this.audioContext!.currentTime);
        } else {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2000, this.audioContext!.currentTime);
          filter.Q.setValueAtTime(1.5, this.audioContext!.currentTime);
        }

        // إضافة تأثير ريفرب بسيط
        const convolver = this.audioContext!.createConvolver();
        const reverbBuffer = this.audioContext!.createBuffer(2, this.audioContext!.sampleRate * 1.5, this.audioContext!.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const channelData = reverbBuffer.getChannelData(channel);
          for (let i = 0; i < channelData.length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 3) * 0.05;
          }
        }
        convolver.buffer = reverbBuffer;

        oscillator.connect(filter);
        filter.connect(convolver);
        convolver.connect(gainNode);

        // إضافة master gain node للتحكم في الصوت العام
        const masterGainMap = this.createManagedGainNode();
        if (masterGainMap) {
          gainNode.connect(masterGainMap);
          masterGainMap.connect(this.audioContext!.destination);
        } else {
          gainNode.connect(this.audioContext!.destination);
        }

        oscillator.frequency.setValueAtTime(note.freq, this.audioContext!.currentTime);

        // إضافة تأثير tremolo للإثارة
        const tremolo = this.audioContext!.createGain();
        const tremoloOsc = this.audioContext!.createOscillator();

        tremoloOsc.frequency.setValueAtTime(6, this.audioContext!.currentTime); // 6Hz tremolo
        tremolo.gain.setValueAtTime(0.7, this.audioContext!.currentTime);

        tremoloOsc.connect(tremolo.gain);
        gainNode.connect(tremolo);

        // إضافة master gain node للتحكم في الصوت العام
        const masterGainTremolo = this.createManagedGainNode();
        if (masterGainTremolo) {
          tremolo.connect(masterGainTremolo);
          masterGainTremolo.connect(this.audioContext!.destination);
        } else {
          tremolo.connect(this.audioContext!.destination);
        }

        // هيئة ADSR محسنة للإثارة
        const now = this.audioContext!.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(note.type === 'bass' ? 0.25 : 0.18, now + 0.05); // Attack أسرع
        gainNode.gain.setValueAtTime(note.type === 'bass' ? 0.2 : 0.15, now + note.duration / 1000 - 0.1); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, now + note.duration / 1000); // Release

        oscillator.start(now);
        oscillator.stop(now + note.duration / 1000);
        tremoloOsc.start(now);
        tremoloOsc.stop(now + note.duration / 1000);

        currentNoteIndex = (currentNoteIndex + 1) % melody.length;
        setTimeout(playNextNote, note.duration);
      };

      playNextNote();
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }

  // موسيقى خلفية لخريطة المستويات
  playMapMusic() {
    if (!this.audioContext) return;

    try {
      // مقام حجاز - نغمات أكثر هدوءاً للخريطة
      const mapMelody = [
        { freq: 220.00, duration: 1200 }, // A3 - لا
        { freq: 246.94, duration: 600 },  // B3 - سي
        { freq: 277.18, duration: 800 },  // C#4 - دو #
        { freq: 293.66, duration: 600 },  // D4 - ري
        { freq: 329.63, duration: 1000 }, // E4 - مي
        { freq: 369.99, duration: 600 },  // F#4 - فا #
        { freq: 415.30, duration: 800 },  // G#4 - صول #
        { freq: 440.00, duration: 1500 }, // A4 - لا
        { freq: 415.30, duration: 600 },  // G#4 - صول #
        { freq: 369.99, duration: 800 },  // F#4 - فا #
        { freq: 329.63, duration: 600 },  // E4 - مي
        { freq: 293.66, duration: 1000 }, // D4 - ري
        { freq: 277.18, duration: 600 },  // C#4 - دو #
        { freq: 246.94, duration: 800 },  // B3 - سي
        { freq: 220.00, duration: 2000 }, // A3 - لا (طويل)
      ];

      let currentNoteIndex = 0;

      const playNextMapNote = () => {
        const note = mapMelody[currentNoteIndex];

        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        // مرشح مختلف للخريطة - أكثر دفئاً
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.audioContext!.currentTime);
        filter.Q.setValueAtTime(0.7, this.audioContext!.currentTime);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(note.freq, this.audioContext!.currentTime);

        // هيئة أكثر سلاسة للخريطة
        const now = this.audioContext!.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.2); // Attack أبطأ
        gainNode.gain.setValueAtTime(0.1, now + note.duration / 1000 - 0.3); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, now + note.duration / 1000); // Release

        oscillator.start(now);
        oscillator.stop(now + note.duration / 1000);

        currentNoteIndex = (currentNoteIndex + 1) % mapMelody.length;
        setTimeout(playNextMapNote, note.duration);
      };

      playNextMapNote();
    } catch (error) {
      console.warn('Failed to play map music:', error);
    }
  }

  // تشغيل ملف صوت حقيقي (للمستقبل)
  async playAudioFile(audioPath: string, loop: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(audioPath);
        audio.loop = loop;
        audio.volume = audioManager.getVolume(); // استخدام audioManager للتحكم في الصوت

        // إضافة العنصر الصوتي للتحكم المركزي
        audioManager.addAudioElement(audio);

        audio.addEventListener('canplaythrough', () => {
          audio.play().then(() => {
            resolve();
          }).catch(reject);
        });

        audio.addEventListener('error', reject);

        // حفظ مرجع للصوت للتحكم فيه لاحقاً
        this.currentAudio = audio;
      } catch (error) {
        reject(error);
      }
    });
  }

  // إيقاف الملف الصوتي الحالي
  stopAudioFile(): void {
    if (this.currentAudio) {
      // إزالة العنصر الصوتي من audioManager
      audioManager.removeAudioElement(this.currentAudio);
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  private currentAudio: HTMLAudioElement | null = null;

  // تشغيل صوت نقرة فوري
  playClickSound() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);

      // إضافة master gain node للتحكم في الصوت العام
      const masterGainClick = this.createManagedGainNode();
      if (masterGainClick) {
        gainNode.connect(masterGainClick);
        masterGainClick.connect(this.audioContext.destination);
      } else {
        gainNode.connect(this.audioContext.destination);
      }

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
  }

  // تشغيل نغمة انتصار
  playVictorySound() {
    if (!this.audioContext) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (أوكتاف أعلى)
      let currentNote = 0;

      const playNote = () => {
        if (currentNote >= notes.length) return;

        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);

        // إضافة master gain node للتحكم في الصوت العام
        const masterGainVictory = this.createManagedGainNode();
        if (masterGainVictory) {
          gainNode.connect(masterGainVictory);
          masterGainVictory.connect(this.audioContext!.destination);
        } else {
          gainNode.connect(this.audioContext!.destination);
        }

        oscillator.frequency.setValueAtTime(notes[currentNote], this.audioContext!.currentTime);

        gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.3);

        currentNote++;
        setTimeout(playNote, 200);
      };

      playNote();
    } catch (error) {
      console.warn('Failed to play victory sound:', error);
    }
  }
}

// نسخة عامة للاستخدام
export const audioGenerator = new AudioGenerator();
