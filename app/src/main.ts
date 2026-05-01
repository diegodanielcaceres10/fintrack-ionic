import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { defineCustomElements as defineJeepSqlite } from 'jeep-sqlite/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { PersistentStoreService } from './app/shared/services/persistent-store.service';

if (Capacitor.getPlatform() === 'web') {
  defineJeepSqlite(window);

  if (!document.querySelector('jeep-sqlite')) {
    const jeepSqliteElement = document.createElement('jeep-sqlite');
    jeepSqliteElement.setAttribute('style', 'display: none;');
    jeepSqliteElement.setAttribute('wasm-path', '/assets');
    document.body.appendChild(jeepSqliteElement);
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideAppInitializer(() => {
      const persistentStore = inject(PersistentStoreService);
      return persistentStore.init();
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
