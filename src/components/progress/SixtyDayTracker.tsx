import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';

export const SixtyDayTracker: React.FC = () => {
  const getDailyStats = useAppStore((s) => s.getDailyStats);
  const dailyStats = getDailyStats();

  // Get last 60 days
  const today = new Date();
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Create 60-day calendar
  const dayMap = new Map<string, any>();
  dailyStats.forEach(day => {
    dayMap.set(day.date, day);
  });

  const last60Days: Array<{ date: string; stats: any }> = [];
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last60Days.push({
      date: dateStr,
      stats: dayMap.get(dateStr),
    });
  }

  // Calculate metrics
  const activeDays = last60Days.filter(d => d.stats).length;
  const totalQuestions = last60Days.reduce((sum, d) => sum + (d.stats?.totalQuestions || 0), 0);
  const totalCorrect = last60Days.reduce((sum, d) => sum + (d.stats?.totalCorrect || 0), 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  // Calculate rolling 7-day average
  const rolling7Day = [];
  for (let i = 6; i < last60Days.length; i++) {
    const window = last60Days.slice(i - 6, i + 1);
    const windowQuestions = window.reduce((sum, d) => sum + (d.stats?.totalQuestions || 0), 0);
    const windowCorrect = window.reduce((sum, d) => sum + (d.stats?.totalCorrect || 0), 0);
    const avg = windowQuestions > 0 ? (windowCorrect / windowQuestions) * 100 : 0;
    rolling7Day.push({
      date: window[window.length - 1].date,
      accuracy: avg,
    });
  }

  // Trend analysis
  const firstWeek = last60Days.slice(0, 7).filter(d => d.stats);
  const lastWeek = last60Days.slice(-7).filter(d => d.stats);
  const firstWeekAvg = firstWeek.length > 0
    ? (firstWeek.reduce((sum, d) => sum + (d.stats?.totalCorrect || 0), 0) /
       firstWeek.reduce((sum, d) => sum + (d.stats?.totalQuestions || 0), 1)) * 100
    : 0;
  const lastWeekAvg = lastWeek.length > 0
    ? (lastWeek.reduce((sum, d) => sum + (d.stats?.totalCorrect || 0), 0) /
       lastWeek.reduce((sum, d) => sum + (d.stats?.totalQuestions || 0), 1)) * 100
    : 0;
  const improvement = lastWeekAvg - firstWeekAvg;

  const getColor = (accuracy: number | undefined) => {
    if (!accuracy) return 'bg-gray-100';
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 70) return 'bg-blue-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIntensity = (accuracy: number | undefined) => {
    if (!accuracy) return 'opacity-20';
    if (accuracy >= 85) return 'opacity-100';
    if (accuracy >= 75) return 'opacity-80';
    if (accuracy >= 65) return 'opacity-60';
    return 'opacity-40';
  };

  return (
    <div className="space-y-6">
      {/* 60-Day Summary */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold">60-Day Summary</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-xs text-blue-700">Days Active</div>
            <div className="text-2xl font-bold text-blue-600">{activeDays}</div>
            <div className="mt-1 text-xs text-gray-600">out of 60</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="text-xs text-purple-700">Total Questions</div>
            <div className="text-2xl font-bold text-purple-600">{totalQuestions}</div>
            <div className="mt-1 text-xs text-gray-600">avg {Math.round(totalQuestions / 60)}/day</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-xs text-green-700">Correct</div>
            <div className="text-2xl font-bold text-green-600">{totalCorrect}</div>
            <div className="mt-1 text-xs text-gray-600">accuracy</div>
          </div>
          <div className="rounded-lg bg-orange-50 p-4">
            <div className="text-xs text-orange-700">Overall Accuracy</div>
            <div className="text-2xl font-bold text-orange-600">{Math.round(overallAccuracy)}%</div>
            <div className="mt-1 text-xs text-gray-600">60-day avg</div>
          </div>
          <div className={`rounded-lg p-4 ${improvement >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-xs ${improvement >= 0 ? 'text-green-700' : 'text-red-700'}`}>Trend</div>
            <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement >= 0 ? '+' : ''}{Math.round(improvement)}%
            </div>
            <div className="mt-1 text-xs text-gray-600">vs first week</div>
          </div>
        </div>
      </Card>

      {/* 60-Day Calendar Heatmap */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold">60-Day Activity Heatmap</h3>
        <div className="space-y-2">
          {/* Week labels and grid */}
          <div className="space-y-2">
            {Array.from({ length: 9 }).map((_, weekIdx) => {
              const weekStart = weekIdx * 7;
              const weekEnd = Math.min(weekStart + 7, 60);
              const weekDays = last60Days.slice(weekStart, weekEnd);

              return (
                <div key={weekIdx}>
                  <div className="mb-1 text-xs font-semibold text-gray-600">
                    Week {weekIdx + 1}
                  </div>
                  <div className="flex gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day.date}
                        className={`flex-1 aspect-square rounded-sm flex items-center justify-center text-[10px] font-bold text-white transition-all hover:ring-2 hover:ring-gray-400 cursor-help
                          ${getColor(day.stats?.dailyAccuracy ? day.stats.dailyAccuracy * 100 : undefined)}
                          ${getIntensity(day.stats?.dailyAccuracy ? day.stats.dailyAccuracy * 100 : undefined)}`}
                        title={`${new Date(day.date).toLocaleDateString()}: ${day.stats ? Math.round(day.stats.dailyAccuracy * 100) + '%' : 'No data'}`}
                      >
                        {day.stats ? Math.round(day.stats.dailyAccuracy * 100) : '—'}
                      </div>
                    ))}
                    {/* Pad remaining week slots */}
                    {Array.from({ length: 7 - weekDays.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 aspect-square rounded-sm opacity-0" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="text-xs font-semibold text-gray-600 mb-2">Accuracy Scale</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-red-500" />
                <span className="text-xs text-gray-600">0-60%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-yellow-500" />
                <span className="text-xs text-gray-600">60-70%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-blue-500" />
                <span className="text-xs text-gray-600">70-80%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-green-500" />
                <span className="text-xs text-gray-600">80%+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-gray-100" />
                <span className="text-xs text-gray-600">No data</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Rolling 7-Day Trend Chart */}
      {rolling7Day.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Rolling 7-Day Average</h3>
          <div className="flex items-end gap-1 h-48">
            {rolling7Day.map((point, idx) => (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center"
                title={`${new Date(point.date).toLocaleDateString()}: ${Math.round(point.accuracy)}%`}
              >
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:opacity-80"
                  style={{
                    height: `${Math.max(10, (point.accuracy / 100) * 180)}px`,
                  }}
                />
                {idx % 7 === 6 && (
                  <div className="mt-2 text-xs font-medium text-gray-600">
                    {Math.round(point.accuracy)}%
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-600">
            📈 Each bar shows the average accuracy for that 7-day window
          </div>
        </Card>
      )}

      {activeDays === 0 && (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No activity in the last 60 days. Start a drill to begin tracking your performance! 🚀
          </p>
        </Card>
      )}
    </div>
  );
};
