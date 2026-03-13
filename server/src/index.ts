import app from './app';
import { config } from './config/index';

app.listen(config.port, () => {
  console.log(`[server] Running in ${config.nodeEnv} mode on port ${config.port}`);
});
