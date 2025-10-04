import "./CardsServicesServicesFlexibleBookingActiveOff.css";

export const CardsServicesServicesFlexibleBookingActiveOff = ({
  services = "all-you-needs",
  active = "off",
  className,
  ...props
}) => {
  const variantsClassName = "services-" + services + " active-" + active;

  return (
    <div
      className={
        "cards-services-services-flexible-booking-active-off " +
        className +
        " " +
        variantsClassName
      }
    >
      <div className="group-3">
        <div className="ellipse-2"></div>
        <img className="group" src="group0.svg" />
      </div>
      <div className="frame-15">
        <div className="flexible-booking">Flexible Booking </div>
        <div className="from-flights-stays-to-sights-just-count-on-our-complete-products">
          From flights, stays, to sights, just count on our complete products.{" "}
        </div>
      </div>
    </div>
  );
};
