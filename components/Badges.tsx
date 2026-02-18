import React from 'react';
import { RequestStatus, Priority } from '../types';

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const getStyles = (s: RequestStatus) => {
    switch (s) {
      case RequestStatus.OPEN:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case RequestStatus.SEPARATING:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case RequestStatus.TRANSIT:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case RequestStatus.DELIVERED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles(status)}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const getStyles = (p: Priority) => {
    switch (p) {
      case Priority.LOW:
        return 'text-gray-600 bg-gray-50';
      case Priority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50';
      case Priority.HIGH:
        return 'text-red-600 bg-red-50 font-bold';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <span className={`text-xs px-2 py-1 rounded uppercase tracking-wide ${getStyles(priority)}`}>
      {priority}
    </span>
  );
};