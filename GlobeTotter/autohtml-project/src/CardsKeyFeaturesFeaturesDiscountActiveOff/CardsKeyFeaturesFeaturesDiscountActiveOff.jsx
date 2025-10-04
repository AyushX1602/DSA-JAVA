import "./CardsKeyFeaturesFeaturesDiscountActiveOff.css";

export const CardsKeyFeaturesFeaturesDiscountActiveOff = ({
  features = "location",
  active = "off",
  className,
  ...props
}) => {
  const variantsClassName = "features-" + features + " active-" + active;

  return (
    <div
      className={
        "cards-key-features-features-discount-active-off " +
        className +
        " " +
        variantsClassName
      }
    >
      <img className="frame-54" src="frame-540.svg" />
      <div className="frame-59">
        <div className="big-discount">Big discount </div>
        <div className="get-discount-for-every-services">
          Get discount for every services{" "}
        </div>
      </div>
    </div>
  );
};
