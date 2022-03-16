import EventEmitter from "events";
import { useEffect, useState } from "react";

export default function useListener(emitter: EventEmitter, eventName: string) {
  let [, forceUpdate] = useState(0);

  useEffect(() => {
    let listener = () =>
      forceUpdate((i) => {
        console.log(`Event Occured!! : ${eventName}`);
        return i + 1;
      });
    emitter.on(eventName, listener);
    return () => emitter.removeListener(eventName, listener);
  }, [emitter, eventName]);
}
