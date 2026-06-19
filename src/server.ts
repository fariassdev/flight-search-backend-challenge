import { createApp } from './app';
import { envConfig } from './config/env';

const app = createApp();

app.listen(envConfig.PORT, () => {
  console.log(`Server running on port ${envConfig.PORT}`);
});
