import "./AllocationVisualizer.css";

interface Allocation {
  percentage: number;
}

export default function AllocationVisualizer({ percentage }: Allocation) {
  const validPercentage = percentage
    ? Math.round(Math.min(100, Math.max(0, percentage)))
    : 0;

  return (
    <div className="allocationContainer">
      <span className="allocationText">{`${validPercentage}%`}</span>

      <div className="progressBarContainer">
        <div
          className="progressBarFiller"
          style={{ width: `${validPercentage}%` }}
        />
      </div>
    </div>
  );
}
