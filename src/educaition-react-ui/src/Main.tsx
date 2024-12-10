import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dropzone/styles.css";
import "./styles/index.scss"; // Import additional styles

// TODO: Set up Sentry for error tracking and performance monitoring
// import "./config/sentry.config";
import "./config/dayjs.config";

// Use Promise.all to load dependencies in parallel
Promise.all([
  import("@educaition-react/ui/Root"),
  import("@educaition-react/ui/App"),
]).then(([{ default: render }, { default: App }]) => {
  render(App);
});

// TypeScript module declaration
export {};
