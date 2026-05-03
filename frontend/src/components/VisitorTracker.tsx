"use client";
import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/visit`, { method: 'POST' }).catch(() => {});
  }, []);
  return null;
}
