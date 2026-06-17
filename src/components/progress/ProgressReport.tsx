import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TOPIC_LABELS } from '../../data/constants';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

export const ProgressReport: React.FC = () => {
  const getDailyStats = useAppStore((s) => s.getDailyStats);
  const getDrillsByDate = useAppStore((s) => s.getDrillsByDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dailyStats = getDailyStats();
  const selectedDrills = selectedDate ? getDrillsByDate(selectedDate) : [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'success';
    if (accuracy >= 0.65) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      {dailyStats.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Overall Progress</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="text-xs text-blue-700">Days Active</div>
              <div className="text-2xl font-bold text-blue-600">{dailyStats.length}</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-xs text-green-700">Total Drills</div>
              <div className="text-2xl font-bold text-green-600">
                {dailyStats.reduce((sum, d) => sum + d.drillsCompleted, 0)}
              </div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <div className="text-xs text-purple-700">Questions Done</div>
              <div className="text-2xl font-bold text-purple-600">
                {dailyStats.reduce((sum, d) => sum + d.totalQuestions, 0)}
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 text-center">
              <div className="text-xs text-orange-700">Overall Accuracy</div>
              <div className="text-2xl font-bold text-orange-600">
                {dailyStats.length > 0
                  ? Math.round(
                      (dailyStats.reduce((sum, d) => sum + d.totalCorrect, 0) /
                        dailyStats.reduce((sum, d) => sum + d.totalQuestions, 0)) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Breakdown */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold">Daily Performance</h3>
        {dailyStats.length === 0 ? (
          <p className="text-gray-600">No drill history yet. Start a drill to begin tracking!</p>
        ) : (
          <div className="space-y-4">
            {dailyStats.map((day) => (
              <div
                key={day.date}
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:bg-gray-50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{formatDate(day.date)}</div>
                    <div className="text-sm text-gray-600">
                      {day.drillsCompleted} drill{day.drillsCompleted !== 1 ? 's' : ''} • {day.totalQuestions}{' '}
                      questions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      day.dailyAccuracy >= 0.8
                        ? 'text-green-600'
                        : day.dailyAccuracy >= 0.65
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {Math.round(day.dailyAccuracy * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(day.totalCorrect)}/{day.totalQuestions}
                    </div>
                  </div>
                </div>
                <ProgressBar
                  value={day.totalCorrect}
                  max={day.totalQuestions}
                  variant={getAccuracyColor(day.dailyAccuracy)}
                />

                {/* Expanded drill details */}
                {selectedDate === day.date && selectedDrills.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                    {selectedDrills.map((drill, idx) => (
                      <div key={drill.drillId} className="rounded-lg bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              Drill {idx + 1}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatTime(drill.completedAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {drill.correctAnswers}/{drill.totalQuestions}
                            </div>
                            <Badge
                              variant={
                                drill.accuracy >= 0.8
                                  ? 'success'
                                  : drill.accuracy >= 0.65
                                    ? 'warning'
                                    : 'danger'
                              }
                            >
                              {Math.round(drill.accuracy * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {/* Topics covered in this drill */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {drill.topicsCovered.map((topic) => (
                            <Badge key={topic} variant="info">
                              {TOPIC_LABELS[topic]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weekly Trend */}
      {dailyStats.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Weekly Trend</h3>
          <div className="flex items-end gap-2">
            {dailyStats.slice(0, 7).reverse().map((day) => {
              const accuracy = Math.round(day.dailyAccuracy * 100);
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center">
                  <div
                    className={`w-full rounded-t-lg ${
                      accuracy >= 80 ? 'bg-green-500' : accuracy >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${Math.max(20, (accuracy / 100) * 200)}px` }}
                  />
                  <div className="mt-1 text-xs font-medium text-gray-700">{accuracy}%</div>
                  <div className="text-xs text-gray-600">{formatDate(day.date).split(',')[0]}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
