import Chat from "./components/Chat/Chat";
import styles from './App.module.scss';

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <Chat />
    </div>
  );
};

export default App;
