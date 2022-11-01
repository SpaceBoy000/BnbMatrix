import { styled } from "@mui/system";
import PolyCoinsImg from "../../assets/polygon-coins.png";
import PolyFrontImg from "../../assets/polygon-front.png";

const Item = styled('img')(({ theme }) => ({
  position: 'absolute',
  zIndex: '-1',
  maxHeight: '200px',
  [theme.breakpoints.down("md")]: {
    display: 'none'
  },
}));


export default function BackBrand() {
  return (
    <>
      <Item src={PolyFrontImg} alt="" style={{ left: '100px', top: '450px' }} />
      <Item src={PolyCoinsImg} alt="" style={{ right: '100px', top: '1050px' }} />
    </>
  );
}
