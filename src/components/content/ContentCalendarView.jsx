import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export function ContentCalendarView({ posts, onSelectPost, onSelectDate }) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(7); // August (0-indexed: 7)
  const currentYear = 2026;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in August 2026 (Starts on Saturday, Aug 1)
  // Let's compute a 35/42 day grid
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();

  const calendarCells = [];
  // Leading empty/prev-month days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ dayNumber: null, isCurrentMonth: false, dateStr: null });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedMonth = String(currentMonthIndex + 1).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    calendarCells.push({ dayNumber: d, isCurrentMonth: true, dateStr });
  }

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
  };

  return (
    <div className="content-calendar-wrapper">
      {/* Calendar Header Navigation */}
      <div className="calendar-nav-bar">
        <div className="calendar-month-indicator">
          <h3 className="calendar-month-title">
            {monthNames[currentMonthIndex]} {currentYear}
          </h3>
          <span className="calendar-badge-total">{posts.length} Active Posts Scheduled</span>
        </div>

        <div className="calendar-month-controls">
          <button
            type="button"
            className="btn-cal-nav"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="btn-cal-today"
            onClick={() => setCurrentMonthIndex(7)}
          >
            Today
          </button>
          <button
            type="button"
            className="btn-cal-nav"
            onClick={handleNextMonth}
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="calendar-grid-header-row">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-day-header-cell">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar 7-Column Grid */}
      <div className="calendar-cells-grid">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="calendar-cell empty" />;
          }

          const postsOnDay = posts.filter(
            (p) => p.scheduledDate === cell.dateStr
          );

          const isToday = cell.dateStr === '2026-08-28';

          return (
            <div
              key={cell.dateStr}
              className={`calendar-cell ${isToday ? 'today' : ''}`}
            >
              <div className="calendar-cell-top">
                <span className={`day-number-label ${isToday ? 'today-pill' : ''}`}>
                  {cell.dayNumber}
                </span>

                <button
                  type="button"
                  className="btn-quick-add-date"
                  title={`Add post on ${cell.dateStr}`}
                  onClick={() => onSelectDate?.(cell.dateStr)}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Scheduled Post Chips */}
              <div className="calendar-cell-posts-stack">
                {postsOnDay.map((post) => {
                  const statusClass =
                    post.status === 'Scheduled'
                      ? 'pill-scheduled'
                      : post.status === 'Approved'
                      ? 'pill-approved'
                      : post.status === 'In Review'
                      ? 'pill-review'
                      : post.status === 'Published'
                      ? 'pill-published'
                      : 'pill-draft';

                  return (
                    <button
                      key={post.id}
                      type="button"
                      className={`calendar-post-chip ${statusClass}`}
                      onClick={() => onSelectPost(post)}
                      title={`${post.clientName}: ${post.title} (${post.scheduledTime})`}
                    >
                      <div className="chip-header">
                        <span className="chip-format">{post.type}</span>
                        <span className="chip-time">{post.scheduledTime}</span>
                      </div>
                      <span className="chip-title-text">{post.title}</span>
                      <div className="chip-client-tag">🏢 {post.clientName}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContentCalendarView;
