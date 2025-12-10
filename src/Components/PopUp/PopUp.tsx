import "../PopUp/PopUp.css";

type PopUpProps = {
  onClose: () => void;
};

export default function PopUp({ onClose }: PopUpProps) {
  return (
    <div className="popUpWraper" onClick={onClose}>
      <div
        className="popUp"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1 className="title">Add founds</h1>
        <h3 className="description">
          Make sure you don t invest more then you can afford
        </h3>
        <form>
          <label htmlFor="">Please type the sum you want to invest</label>
          <input className="addFoundsInput" type="number" />
          <button className="btn">Add Founds</button>
        </form>
      </div>
    </div>
  );
}
