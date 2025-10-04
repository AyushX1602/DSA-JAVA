import { Card, CardContent } from '@/components/ui/card';

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const MetricCard = ({ label, value, isCurrency = false }) => (
  <Card>
    <CardContent className="py-4">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold">
          {isCurrency ? formatCurrency(value) : value}
        </span>
      </div>
    </CardContent>
  </Card>
);

const TripMetricsCard = ({
  expenses = 0,
  averagePerDay = 0,
  placesVisited = 0,
  activitiesDone = 0,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <MetricCard label="Expenses" value={expenses} isCurrency />
      <MetricCard label="Average/Day" value={averagePerDay} isCurrency />
      <MetricCard label="Places Visited" value={placesVisited} />
      <MetricCard label="Activities Done" value={activitiesDone} />
    </div>
  );
};

export default TripMetricsCard;
