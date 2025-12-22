/**
 * نظام حفظ بيانات اللعبة
 *
 * مسؤول عن:
 * - حفظ أفضل النتائج
 * - تتبع إحصائيات اللعب
 * - حساب المتوسطات
 * - حفظ البيانات في localStorage
 *
 * البيانات المحفوظة:
 * - أفضل نتيجة
 * - إجمالي عدد الألعاب
 * - إجمالي النقاط
 * - متوسط النقاط لكل لعبة
 */

export class GameStorage {
  private static readonly BEST_SCORE_KEY = 'ai-adventure-best-score';
  private static readonly TOTAL_GAMES_KEY = 'ai-adventure-total-games';
  private static readonly TOTAL_SCORE_KEY = 'ai-adventure-total-score';

  // حفظ أفضل نتيجة
  static saveBestScore(score: number): void {
    const currentBest = this.getBestScore();
    if (score > currentBest) {
      localStorage.setItem(this.BEST_SCORE_KEY, score.toString());
    }
  }

  // الحصول على أفضل نتيجة
  static getBestScore(): number {
    const score = localStorage.getItem(this.BEST_SCORE_KEY);
    return score ? parseInt(score) : 0;
  }

  // حفظ إحصائيات اللعبة
  static saveGameStats(score: number, time: number): void {
    const totalGames = this.getTotalGames() + 1;
    const totalScore = this.getTotalScore() + score;

    localStorage.setItem(this.TOTAL_GAMES_KEY, totalGames.toString());
    localStorage.setItem(this.TOTAL_SCORE_KEY, totalScore.toString());
  }

  // الحصول على إجمالي عدد الألعاب
  static getTotalGames(): number {
    const games = localStorage.getItem(this.TOTAL_GAMES_KEY);
    return games ? parseInt(games) : 0;
  }

  // الحصول على إجمالي النقاط
  static getTotalScore(): number {
    const score = localStorage.getItem(this.TOTAL_SCORE_KEY);
    return score ? parseInt(score) : 0;
  }

  // حساب متوسط النقاط
  static getAverageScore(): number {
    const totalGames = this.getTotalGames();
    const totalScore = this.getTotalScore();
    return totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  }

  // إعادة تعيين جميع البيانات
  static resetAllData(): void {
    localStorage.removeItem(this.BEST_SCORE_KEY);
    localStorage.removeItem(this.TOTAL_GAMES_KEY);
    localStorage.removeItem(this.TOTAL_SCORE_KEY);
  }

  // الحصول على إحصائيات كاملة
  static getStats(): {
    bestScore: number;
    totalGames: number;
    totalScore: number;
    averageScore: number;
  } {
    return {
      bestScore: this.getBestScore(),
      totalGames: this.getTotalGames(),
      totalScore: this.getTotalScore(),
      averageScore: this.getAverageScore(),
    };
  }
}
