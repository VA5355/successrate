  // ⬅️ adjust import to where your Redux store is
import { orderBookData } from '../positionGrid/orderBook.actions';
import { wrapPromise } from "./ordersSuspenseResource";
import {useDispatch, useSelector} from 'react-redux';


export function createOrderResource(dispatch) {
// const dispatch = useDispatch();

  const promise = new Promise((resolve, reject) => {
    const action = dispatch(orderBookData(""));

    if (action && typeof action.then === "function") {
      action.then(resolve).catch(reject);
    } else {
      resolve(action);
    }
  });

  return wrapPromise(promise);
}