// components/ExpiryDropdown.jsx
import { useSelector, useDispatch } from "react-redux";
import { setExpiry } from '@/redux/slices/webSocketSlice';
//import { setExpiry } from "../store/websocketSlice";

export default function ExpiryDropdown() {
  const dispatch = useDispatch();
  const expiries = useSelector((state) => state.websocket.expiries);
  const selected = useSelector((state) => state.websocket.selectedExpiry);

  if (!expiries || expiries.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-gray-700 mr-2">
        Select Expiry:
      </label>
      <select
        value={selected}
        onChange={(e) => dispatch(setExpiry(e.target.value))}
        className="px-3 py-1 border rounded-lg text-sm shadow-sm"
      >
        {expiries.map((exp, i) => (
          <option key={i} value={exp}>
            {exp}
          </option>
        ))}
      </select>
    </div>
  );
}
