import "./CardsServicesServicesAllYouNeedsActiveOn.css";

export const CardsServicesServicesAllYouNeedsActiveOn = ({
  services = "all-you-needs",
  active = "off",
  className,
  ...props
}) => {
  const variantsClassName = "services-" + services + " active-" + active;

  return (
    <div
      className={
        "cards-services-services-all-you-needs-active-on " +
        className +
        " " +
        variantsClassName
      }
    >
      <div className="group-2">
        <div className="ellipse-1"></div>
        <img className="group-1" src="group-10.svg" />
      </div>
      <div className="frame-14">
        <div className="all-you-needs">All You Needs </div>
        <div className="from-flights-stays-to-sights-just-count-on-our-complete-products">
          From flights, stays, to sights, just count on our complete products.{" "}
        </div>
      </div>
    </div>
  );
};
