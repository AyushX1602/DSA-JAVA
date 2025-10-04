// MyCalendar.jsx
import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserCalendar } from '@/hooks/react-query/use-trips';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('week');
  const { data: calendar, isLoading } = useUserCalendar();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!calendar) return <div className="p-4">No activities found</div>;

  const updatedCalendar = calendar.map((event) => ({
    start: new Date(event.start),
    end: new Date(event.end),
    title: event.title,
    id: event.id,
  }));

  return (
    <div className="p-4">
      <Card className="w-[80%] mx-auto">
        <CardHeader>
          <CardTitle>My Calendar</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <BigCalendar
            localizer={localizer}
            events={updatedCalendar}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: '100%' }}
            selectable
            onSelectEvent={(event) => alert(`You clicked: ${event.title}`)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            view={view}
            onView={(newView) => setView(newView)}
            defaultView="week"
            views={['month', 'week', 'day', 'agenda']}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCalendar;
