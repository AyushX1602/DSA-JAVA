import "./CardsKeyFeaturesFeaturesDateActiveOn.css";

export const CardsKeyFeaturesFeaturesDateActiveOn = ({
  features = "location",
  active = "off",
  className,
  ...props
}) => {
  const variantsClassName = "features-" + features + " active-" + active;

  return (
    <div
      className={
        "cards-key-features-features-date-active-on " +
        className +
        " " +
        variantsClassName
      }
    >
      <img className="frame-53" src="frame-530.svg" />
      <div className="frame-57">
        <div className="schedule-your-trip">Schedule your trip </div>
        <div className="set-the-date-you-want">Set the date you want </div>
      </div>
    </div>
  );
};
