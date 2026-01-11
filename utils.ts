
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const getWeekDays = (): string[] => {
  const today = new Date();
  const days: string[] = [];
  const day = today.getDay();
  const diff = today.getDate() - day;
  const startOfWeek = new Date(today.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const calculateStreak = (completions: string[]): number => {
  if (completions.length === 0) return 0;
  
  const sorted = [...completions].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!completions.includes(todayStr) && !completions.includes(yesterdayStr)) {
    return 0;
  }

  let checkDate = completions.includes(todayStr) ? new Date() : yesterday;
  checkDate.setHours(0, 0, 0, 0);

  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (completions.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
