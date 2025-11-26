import { resolve } from 'path';
import { generateApi } from 'swagger-typescript-api';

// Скрипт генерации типизированного API-клиента из Swagger / OpenAPI
// Перед запуском убедитесь, что backend доступен по указанному URL.

generateApi({
  name: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  url: 'http://localhost:8080/swagger/doc.json',
  httpClientType: 'axios',
}).then(() => {
  // eslint-disable-next-line no-console
  console.log('API client generated to src/api/Api.ts');
}).catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Failed to generate API client:', e);
  process.exit(1);
});


