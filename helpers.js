// Courtesy of https://stackoverflow.com/a/16321280/7459528
export default function setLongTimeout(
  callback,
  timeout_ms,
  timeoutHandleObject,
) {
  //if we have to wait more than max time, need to recursively call this function again
  if (timeout_ms > 2147483647) {
    //now wait until the max wait time passes then call this function again with
    //requested wait - max wait we just did, make sure and pass callback
    timeoutHandleObject.timeout = setTimeout(function () {
      setLongTimeout(callback, timeout_ms - 2147483647, timeoutHandleObject);
    }, 2147483647);
  } //if we are asking to wait less than max, finally just do regular setTimeout and call callback
  else {
    timeoutHandleObject.timeout = setTimeout(callback, timeout_ms);
  }
}
