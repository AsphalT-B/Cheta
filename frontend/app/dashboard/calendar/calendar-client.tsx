"use client";

import { KeyboardEvent, useState } from "react";
import { brandColorFor, DashboardHeader, ErrorState, LoadingState, Money } from "../components";
import { useCalendarQuery } from "../queries";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function dateLabel(month: string, day: number) {
  return new Date(`${month}-${String(day).padStart(2, "0")}T00:00:00Z`).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function CalendarPage() {
  const month = currentMonth();
  const { data, isLoading, isError } = useCalendarQuery(month);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState />;

  const firstDay = new Date(`${month}-01T00:00:00Z`).getUTCDay();
  const daysInMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
  const chargeByDay = new Map(data.charges.map((charge) => [Number(charge.date.slice(-2)), charge]));
  const monthLabel = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-NG", { month: "long", year: "numeric", timeZone: "UTC" });
  const selectedCharge = selectedDay === null ? undefined : chargeByDay.get(selectedDay);

  function selectDay(day: number) {
    if (chargeByDay.has(day)) setSelectedDay(day);
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLDivElement>, day: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDay(day);
    }
  }

  return (
    <>
      <DashboardHeader title={monthLabel} subtitle={<>{Money({ value: data.amount_still_due })} still to pay this month.</>} />
      <section className="dashboard-panel">
        <div className="calendar-grid weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <b key={day}>{day}</b>)}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: firstDay }, (_, index) => <div className="calendar-day empty" key={`empty-${index}`} />)}
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const charge = chargeByDay.get(day);
            const hasCharge = Boolean(charge?.subscriptions.length);
            const isToday = day === new Date().getUTCDate();
            return (
              <div
                className={`calendar-day ${isToday ? "today" : ""} ${hasCharge ? "has-charge" : ""}`}
                key={day}
                role={hasCharge ? "button" : undefined}
                tabIndex={hasCharge ? 0 : undefined}
                aria-label={hasCharge ? `View subscriptions renewing on ${dateLabel(month, day)}` : undefined}
                onClick={() => selectDay(day)}
                onKeyDown={(event) => handleDayKeyDown(event, day)}
              >
                <span>{day}</span>
                {charge?.subscriptions.slice(0, 2).map((item) => (
                  <em style={{ background: brandColorFor(item.name) }} key={item.id}>{item.name}</em>
                ))}
                {charge && charge.subscriptions.length > 2 && <small className="calendar-more">+{charge.subscriptions.length - 2} more…</small>}
              </div>
            );
          })}
        </div>
      </section>

      {selectedCharge && selectedDay !== null && (
        <div className="calendar-day-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedDay(null); }}>
          <section className="calendar-day-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-day-title">
            <button className="modal-close" type="button" aria-label="Close day details" onClick={() => setSelectedDay(null)}>×</button>
            <h2 id="calendar-day-title">{dateLabel(month, selectedDay)}</h2>
            <p>{selectedCharge.subscriptions.length} subscription{selectedCharge.subscriptions.length === 1 ? "" : "s"} renewing</p>
            {selectedCharge.subscriptions.map((item) => (
              <div className="calendar-subscription-detail" key={item.id}>
                <i style={{ background: brandColorFor(item.name) }}>{item.name.charAt(0).toUpperCase()}</i>
                <span><b>{item.name}</b><small>Upcoming renewal</small></span>
                <strong><Money value={item.amount} /></strong>
              </div>
            ))}
          </section>
        </div>
      )}
    </>
  );
}

