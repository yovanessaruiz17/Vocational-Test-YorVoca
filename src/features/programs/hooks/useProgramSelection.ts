import { useCallback, useState } from 'react';
import { EnrichedAcademicProgram } from '../../../types/academic';

export function useProgramSelection() {
  const [selectedProgram, setSelectedProgram] = useState<EnrichedAcademicProgram | null>(null);

  const openProgramDetail = useCallback((item: EnrichedAcademicProgram) => {
    setSelectedProgram(item);
  }, []);

  const closeProgramDetail = useCallback(() => {
    setSelectedProgram(null);
  }, []);

  return {
    selectedProgram,
    openProgramDetail,
    closeProgramDetail,
  };
}
