import ProcessDesktop from "./Desktop";
import ProcessMobile from "./Mobile";

const Process = () => {
  return (
    <div
      data-dissolve="out"
      data-dissolve-start="top 150%"
      data-dissolve-end="top top"
    >
      <ProcessDesktop />
      <ProcessMobile />
    </div>
  );
};

export default Process;
