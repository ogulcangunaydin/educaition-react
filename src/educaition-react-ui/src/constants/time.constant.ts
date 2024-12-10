import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export namespace TimeConstant {
  export const NOTIFICATION_AUTO_CLOSE_DURATION = dayjs
    .duration(4, "second")
    .asMilliseconds();
}
