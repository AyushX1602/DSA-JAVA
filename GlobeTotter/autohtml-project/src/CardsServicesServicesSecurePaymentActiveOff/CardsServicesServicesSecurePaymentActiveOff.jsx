import "./CardsServicesServicesSecurePaymentActiveOff.css";

export const CardsServicesServicesSecurePaymentActiveOff = ({
  services = "all-you-needs",
  active = "off",
  className,
  ...props
}) => {
  const variantsClassName = "services-" + services + " active-" + active;

  return (
    <div
      className={
        "cards-services-services-secure-payment-active-off " +
        className +
        " " +
        variantsClassName
      }
    >
      <div className="group-4">
        <div className="ellipse-3"></div>
        <img className="group" src="group0.svg" />
      </div>
      <div className="frame-16">
        <div className="secure-payment">Secure Payment </div>
        <div className="from-flights-stays-to-sights-just-count-on-our-complete-products">
          From flights, stays, to sights, just count on our complete products.{" "}
        </div>
      </div>
    </div>
  );
};
