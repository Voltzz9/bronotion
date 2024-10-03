'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const useNoteId = () => {
  const params = useParams();
  const [noteId, setNoteId] = useState<number | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (id && typeof id === 'string') {
      setNoteId(Number(id));
    }
  }, [params]);

  return noteId;
};

export default useNoteId;
