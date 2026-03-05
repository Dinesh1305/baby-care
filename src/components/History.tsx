import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CryEvent, BabyStatus } from '../types/database';

export default function History() {
  const [events, setEvents] = useState<CryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<BabyStatus | 'all'>('all');

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('history_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cry_events',
        },
        (payload) => {
          setEvents((prev) => [payload.new as CryEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('cry_events')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setEvents(data);
    }
    setIsLoading(false);
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter((e) => e.status === filter);

  const getStatusBadge = (status: BabyStatus) => {
    switch (status) {
      case 'sleeping':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'crying':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'noise_detected':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 70) return 'text-red-600 font-bold';
    if (intensity >= 40) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const stats = {
    total: events.length,
    crying: events.filter((e) => e.status === 'crying').length,
    avgIntensity: events.length > 0
      ? Math.round(events.reduce((sum, e) => sum + e.intensity, 0) / events.length)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Cry Detection History
          </h1>
          <p className="text-gray-600">Complete record of all detected events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Events</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Crying Events</h3>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.crying}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Avg Intensity</h3>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.avgIntensity}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
              Event Log
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('crying')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'crying'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Crying
              </button>
              <button
                onClick={() => setFilter('noise_detected')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'noise_detected'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Noise
              </button>
              <button
                onClick={() => setFilter('sleeping')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'sleeping'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sleeping
              </button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events to display</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Intensity
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => {
                    const { date, time } = formatDateTime(event.detected_at);
                    return (
                      <tr
                        key={event.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-700">{date}</td>
                        <td className="py-3 px-4 text-gray-700">{time}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm border ${getStatusBadge(
                              event.status
                            )}`}
                          >
                            {event.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className={`py-3 px-4 ${getIntensityColor(event.intensity)}`}>
                          {event.intensity}%
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {event.duration > 0 ? `${event.duration}s` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
