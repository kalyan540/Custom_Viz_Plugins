import "@trendmicro/react-dropdown/dist/react-dropdown.css";
import Dropdown from "@trendmicro/react-dropdown";
import "../Buttons"; // Ensure CSS dependency

export default Dropdown;
export {
  DropdownToggle,
  DropdownMenu,
  DropdownMenuWrapper,
  MenuItem,
  DropdownButton
} from "@trendmicro/react-dropdown";

export const CustomDropdownToggleStyle = {
  padding: "5px 10px",
  fontSize: "14px",
  minWidth: "273px",
  borderRadius: "4px"
};

export const CustomDropdownMenuStyle = {
  fontSize: "14px",
  minWidth: "273px",
  borderRadius: "4px"
};
