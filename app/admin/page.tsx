'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [mapping, setMapping] = useState<any[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== '2512') {
      setError('Invalid password');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/participants?password=${encodeURIComponent(password)}`);
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setParticipants(data.participants);
        setGameState(data.gameState);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const res = await fetch(`/api/admin/participants?password=${encodeURIComponent(password)}`);
      const data = await res.json();

      if (data.success) {
        setParticipants(data.participants);
        setGameState(data.gameState);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  };

  const handleRemove = async (participantId: string) => {
    if (!confirm('Remove this participant?')) return;

    try {
      const res = await fetch('/api/admin/participants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, participantId }),
      });

      if (res.ok) {
        await loadParticipants();
      }
    } catch (err) {
      console.error('Failed to remove participant:', err);
    }
  };

  const handleGenerate = async () => {
    if (!confirm('Generate assignments now? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Assignments generated for ${data.count} participants!`);
        await loadParticipants();
      } else {
        alert(data.error || 'Failed to generate assignments');
      }
    } catch (err) {
      alert('Failed to generate assignments');
    }
  };

  const handleReset = async () => {
    if (!confirm('RESET EVERYTHING? This will delete all participants, assignments, and suggestions. This cannot be undone!')) return;

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        alert('Everything has been reset!');
        await loadParticipants();
        setShowMapping(false);
      }
    } catch (err) {
      alert('Failed to reset');
    }
  };

  const handleViewMapping = async () => {
    try {
      const res = await fetch(`/api/admin/mapping?password=${encodeURIComponent(password)}`);
      const data = await res.json();

      if (data.success) {
        setMapping(data.mapping);
        setShowMapping(true);
      }
    } catch (err) {
      console.error('Failed to load mapping:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-purple-600 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-blue-400">
          <div className="text-6xl text-center mb-4">👑</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">
            Admin Portal
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="text-red-600 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white text-xl font-bold py-3 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Portal'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold underline">
              ← Back to World Showcase
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const confirmedCount = participants.filter(p => p.confirmed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-blue-400">
          <div className="text-6xl text-center mb-4">👑</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">
            EPCOT Admin Portal
          </h1>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-3">🌍 Mission Status</h2>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-600">{confirmedCount}</span> travelers ready
            </p>
            <p className="text-lg text-gray-700">
              Assignments: {gameState?.locked ? (
                <span className="text-teal-600 font-bold">✅ Journey Started</span>
              ) : (
                <span className="text-orange-600 font-bold">⏳ Awaiting Launch</span>
              )}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎫 Travelers</h2>
            {participants.length === 0 ? (
              <p className="text-gray-600">No travelers yet</p>
            ) : (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{p.name}</p>
                      <p className="text-gray-600">
                        Size: {p.shirtSize} • {p.confirmed ? '✅ Confirmed' : '⏳ Not confirmed'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!gameState?.locked && (
              <button
                onClick={handleGenerate}
                disabled={confirmedCount < 3}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white text-xl font-bold py-4 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Launch World Showcase Journey
              </button>
            )}

            {gameState?.locked && !showMapping && (
              <button
                onClick={handleViewMapping}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                🗺️ View Full Mission Map
              </button>
            )}

            {showMapping && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-4 border-2 border-blue-300">
                <h3 className="text-2xl font-bold text-blue-700 mb-4">🗺️ Complete Mission Map</h3>
                <div className="space-y-2">
                  {mapping.map((m, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border-l-4 border-teal-400">
                      <p className="text-lg">
                        <span className="font-bold text-blue-600">{m.buyer}</span> → <span className="font-bold text-purple-600">{m.recipient}</span>
                        <span className="text-gray-600 ml-2">(Size: {m.recipientSize})</span>
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowMapping(false)}
                  className="mt-4 w-full bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hide Mapping
                </button>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full bg-red-600 text-white text-xl font-bold py-4 rounded-xl hover:bg-red-700 transition-colors"
            >
              🗑️ Reset Everything
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold underline">
              ← Back to World Showcase
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
