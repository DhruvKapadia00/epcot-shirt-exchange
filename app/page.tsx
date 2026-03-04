'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [shirtSize, setShirtSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [participant, setParticipant] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionLink, setSuggestionLink] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    loadStatus(storedUserId);
  }, []);

  const loadStatus = async (uid: string | null) => {
    try {
      const url = uid ? `/api/status?userId=${uid}` : '/api/status';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setParticipant(data.participant);
        setAssignment(data.assignment);
        setGameState(data.gameState);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, shirtSize }),
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('userId', data.userId);
        setUserId(data.userId);
        await loadStatus(data.userId);
      }
    } catch (error) {
      console.error('Failed to join:', error);
    }
  };

  const handleAddSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignment?.recipient?.id || !suggestionText) return;

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: assignment.recipient.id,
          text: suggestionText,
          link: suggestionLink || undefined,
        }),
      });

      if (res.ok) {
        setSuggestionText('');
        setSuggestionLink('');
        setShowSuggestionForm(false);
        await loadStatus(userId);
      }
    } catch (error) {
      console.error('Failed to add suggestion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">🌍 Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-blue-400">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🌍</div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              EPCOT Shirt Exchange
            </h1>
            <p className="text-xl font-semibold text-teal-600">🍹 Drink Around the World 2026 🍹</p>
            <p className="text-sm text-gray-500 mt-1">World Showcase Adventure</p>
          </div>

          {!participant ? (
            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-lg text-black border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Shirt Size
                </label>
                <select
                  value={shirtSize}
                  onChange={(e) => setShirtSize(e.target.value as any)}
                  className="w-full px-4 py-3 text-lg text-black border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:from-blue-700 hover:to-teal-700 transition-all transform hover:scale-105"
              >
                🌍 Join the Adventure! 🎉
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border-2 border-blue-200">
                <h2 className="text-2xl font-bold text-blue-700 mb-3">
                  🌍 Welcome back, {participant.name}!
                </h2>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Shirt Size:</span> {participant.shirtSize}
                </p>
                <p className="text-lg text-teal-600 font-semibold mt-2">
                  ✅ Ready for the World Showcase
                </p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold text-blue-600">{gameState?.confirmedCount || 0}</span> travelers confirmed
                </p>
                {!gameState?.locked && (
                  <p className="text-gray-600 mt-2">
                    ⏳ Waiting for the journey to begin...
                  </p>
                )}
              </div>

              {assignment && (
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 border-2 border-blue-300">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    � Your World Showcase Mission:
                  </h2>
                  <div className="bg-white rounded-xl p-4 mb-4 border-2 border-teal-300">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {assignment.recipient.name}
                    </p>
                    <p className="text-2xl text-gray-700 mt-2">
                      Size: <span className="font-bold text-teal-600">{assignment.recipient.shirtSize}</span>
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      🎨 Shirt Ideas for {assignment.recipient.name}
                    </h3>
                    
                    {assignment.suggestions && assignment.suggestions.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {assignment.suggestions.map((s: any) => (
                          <div key={s.id} className="bg-white rounded-lg p-3">
                            <p className="text-gray-800">{s.text}</p>
                            {s.link && (
                              <a
                                href={s.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                              >
                                View Link →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 mb-4">No suggestions yet</p>
                    )}

                    {!showSuggestionForm ? (
                      <button
                        onClick={() => setShowSuggestionForm(true)}
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-colors"
                      >
                        🎨 Add a Shirt Idea
                      </button>
                    ) : (
                      <form onSubmit={handleAddSuggestion} className="space-y-3">
                        <input
                          type="text"
                          value={suggestionText}
                          onChange={(e) => setSuggestionText(e.target.value)}
                          placeholder="Your shirt idea"
                          required
                          maxLength={100}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="url"
                          value={suggestionLink}
                          onChange={(e) => setSuggestionLink(e.target.value)}
                          placeholder="Link (optional)"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-2 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors"
                          >
                            Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSuggestionForm(false);
                              setSuggestionText('');
                              setSuggestionLink('');
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              👑 Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
