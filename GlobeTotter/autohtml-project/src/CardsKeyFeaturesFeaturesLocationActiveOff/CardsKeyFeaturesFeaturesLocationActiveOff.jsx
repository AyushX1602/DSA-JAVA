import "./CardsKeyFeaturesFeaturesLocationActiveOff.css";

export const CardsKeyFeaturesFeaturesLocationActiveOff = ({
  features = "location",
  active = "off",
  className,
  ...props
}) => {
  const variantsClassName = "features-" + features + " active-" + active;

  return (
    <div
      className={
        "cards-key-features-features-location-active-off " +
        className +
        " " +
        variantsClassName
      }
    >
      <img className="frame-52" src="frame-520.svg" />
      <div className="frame-55">
        <div className="select-many-location">Select many location </div>
        <div className="chooce-your-favorite-location">
          Chooce your favorite location{" "}
        </div>
      </div>
    </div>
  );
};
