import { get, run } from '../database/db.js';

const SELECT_WITH_MOVIE = `
  SELECT m.*, ds.date AS scheduleDate, ds.startTime AS scheduleTime
  FROM daily_schedule ds
  JOIN movies m ON m.id = ds.movieId
  WHERE ds.date = ?
`;

export function getByDate(date) {
  return get(SELECT_WITH_MOVIE, [date]);
}

export async function setForDate(date, movieId, startTime) {
  await run(
    `INSERT INTO daily_schedule (date, movieId, startTime)
     VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE
       SET movieId = excluded.movieId,
           startTime = excluded.startTime,
           updatedAt = CURRENT_TIMESTAMP`,
    [date, movieId, startTime]
  );
  return getByDate(date);
}

export function removeByDate(date) {
  return run('DELETE FROM daily_schedule WHERE date = ?', [date]);
}
