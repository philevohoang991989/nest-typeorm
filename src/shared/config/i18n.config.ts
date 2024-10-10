import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('i18n', () => {
  return {
    fallbackLanguage: 'en',
    loaderOptions: {
      path: join(__dirname, '../../i18n/'),
      watch: true,
    },
  };
});
