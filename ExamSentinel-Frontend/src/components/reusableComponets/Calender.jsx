import React from "react";
import { Calendar } from "@/components/ui/calendar";

export function DateCalendar({ date, onDateChange }) {
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={onDateChange}
      className="rounded-md border shadow"
    />
  );
}
