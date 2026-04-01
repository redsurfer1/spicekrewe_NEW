import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export type IdleTimeoutConfig = {
  timeoutMs?: number;
  warningMs?: number;
};

export function useIdleTimeout(config?: IdleTimeoutConfig) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!user) {
      // No authenticated user: do not track idle timeout.
      return;
    }

    const baseTimeout = config?.timeoutMs ?? 30 * 60 * 1000; // 30 minutes
    const warningMs = config?.warningMs ?? 5 * 60 * 1000; // 5 minutes
    const timeoutMs = role === 'admin' ? 15 * 60 * 1000 : baseTimeout;

    let warningTimer: number | undefined;
    let logoutTimer: number | undefined;

    const schedule = () => {
      if (warningTimer !== undefined) window.clearTimeout(warningTimer);
      if (logoutTimer !== undefined) window.clearTimeout(logoutTimer);
      setShowWarning(false);

      const warnAt = Math.max(0, timeoutMs - warningMs);
      warningTimer = window.setTimeout(() => {
        setShowWarning(true);
      }, warnAt);

      logoutTimer = window.setTimeout(async () => {
        setShowWarning(false);
        try {
          await signOut();
        } finally {
          navigate('/login', { replace: true, state: { reason: 'idle_timeout' } });
        }
      }, timeoutMs);
    };

    const handleActivity = () => {
      schedule();
    };

    const events: Array<keyof DocumentEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'touchstart',
      'scroll',
    ];

    events.forEach((evt) => document.addEventListener(evt, handleActivity));
    schedule();

    return () => {
      if (warningTimer !== undefined) window.clearTimeout(warningTimer);
      if (logoutTimer !== undefined) window.clearTimeout(logoutTimer);
      events.forEach((evt) => document.removeEventListener(evt, handleActivity));
      setShowWarning(false);
    };
  }, [user, role, signOut, navigate, config?.timeoutMs, config?.warningMs]);

  return { showWarning };
}

