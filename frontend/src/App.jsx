import Index from "./Index";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
      <Index />
    </ThemeProvider>
  );
};

export default App;
