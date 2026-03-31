import React from 'react';
import { TOPICS } from '../store/useStore';

export default function TopicBadge({ topicId, size = 'sm' }) {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return null;
  const pad = size === 'sm' ? '2px 8px' : '4px 12px';
  const fs = size === 'sm' ? 11 : 13;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: topic.color + '20', color: topic.color,
      borderRadius: 20, padding: pad, fontSize: fs, fontWeight: 600,
      border: `1px solid ${topic.color}40`,
    }}>
      {topic.icon} {topic.name}
    </span>
  );
}
