import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';

// ✅ Combine la configuration existante avec le provider HttpClient
bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(), // 🔥 Ajoute ceci pour résoudre "No provider for _HttpClient"
  ],
}).catch((err) => console.error(err));

